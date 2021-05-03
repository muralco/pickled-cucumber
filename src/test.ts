import { AfterAll } from '@cucumber/cucumber';
import assert from 'assert';
import nodeFetch from 'node-fetch';
import { promisify } from 'util';
import compareJson from './compare-json';
import createElasticEntity from './entities/elasticsearch';
import createMemoryEntity from './entities/memory';
import createMongoEntity from './entities/mongodb';
import { EntityMap } from './entities/types';
import httpFetch from './http/fetch';
import httpSupertest from './http/supertest';
import setup, { getVariables, Options, SetupFn } from './index';
import { CompareError } from './operators/types';

let initialTen = 10;
const ELASTIC_URI = process.env.ELASTIC_URI
  ? `${process.env.ELASTIC_URI}/test-index`
  : undefined;

// === Test `entities` ====================================================== //
const entities: EntityMap = {};

interface Box { id: number; color: string; }
let boxId = 0;
entities['box'] = createMemoryEntity<Box, 'id'>('id', () => boxId += 1);

// === Test `entities/mongo` ================================================ //
if (process.env.MONGO_URI) {
  const mongo = require('mongodb');
  let client: any;
  let connected = false;

  const getDb = async () => {
    if (client) return client;

    client = promisify(mongo.MongoClient.connect)(
      process.env.MONGO_URI,
    );

    await client;
    connected = true;
    return client;
  };
  AfterAll(async () => {
    if (connected) (await client).close();
  });

  entities['user'] = createMongoEntity(getDb, 'test-users', 'id', {
    onCreate: attrs => ({ id: Date.now(), ...attrs, created: Date.now() }),
    onUpdate: attrs => ({ ...attrs, updated: Date.now() }),
  });
}

// === Test `entities/elasticsearch` ======================================== //
if (ELASTIC_URI) {
  entities['search'] = createElasticEntity(
    ELASTIC_URI,
    '/test-type',
    'id', {
      onCreate: attrs => ({ id: Date.now(), ...attrs, created: Date.now() }),
      onUpdate: attrs => ({ ...attrs, updated: Date.now() }),
    },
  );
}

// ========================================================================== //
const options: Options = {
  aliases: {
    '/api/*': /\/api\/.*/,
    'proper-name': /[A-Z][a-z]*/,
  },
  elasticSearchIndexUri: ELASTIC_URI,
  entities,
  http: httpFetch(nodeFetch),
  initialContext: () => ({
    deeply: {
      nested: {
        string: 'hello!',
      },
    },
    initialFive: 5,
  }),
  requireMocks: {
    'totally-random-module': 42,
  },
  usage: true,
};

const fn: SetupFn = ({ getCtx, Given, onTearDown, setCtx, Then, When }) => {
  // === Test `requireMocks` ================================================ //
  assert.equal(
    require('totally-random-module'),
    42,
    'Require mocks are not working',
  );

  // === Test `compareJson` and `aliases` =================================== //
  const getResult = () => getCtx<CompareError>('$result');

  Given(
    '{word} is',
    (name, value) => setCtx(name, JSON.parse(value)),
    { inline: true },
  );

  When(
    'asserting that {word} {op}',
    (varName, op, expected) => setCtx(
      '$result',
      compareJson({}, op, getCtx(varName), expected),
    ),
    { inline: true },
  );

  Then(
    'the assertion passes',
    () => assert.equal(getResult(), undefined),
  );
  Then(
    'the assertion fails with {any}',
    (expected) => {
      const r = getResult();
      assert(r, 'the assertion passed');
      assert.deepEqual(
        `${JSON.stringify(r.actual)} ${r.error}${
          !r.unary ? ` ${JSON.stringify(r.expected)}` : ''
        }`,
        expected,
      );
    });
  Then(
    'the error path is {any}',
    path => assert.equal(JSON.stringify(getResult().path), path),
  );
  Then(
    'the full actual value is',
    actual => assert.deepEqual(JSON.parse(actual), getResult().full),
    { inline: true },
  );
  Then(
    'the sub error is: got {any} instead of {any} at {any}',
    (actual, expected, path) => {
      const r = getResult();
      assert(r.subError, 'no subError found');
      if (r.subError) {
        assert.deepEqual(r.subError.actual, JSON.parse(actual));
        assert.deepEqual(r.subError.expected, JSON.parse(expected));
        assert.deepEqual(r.subError.path, JSON.parse(path));
      }
    },
  );
  Then(
    'A proper name can be {proper-name}',
    name => assert(!!name.match(/^[A-Z]/)),
  );
  Then(
    'the {/api/*} alias matches (.*)',
    (actual, expected) => assert.equal(actual, expected),
  );

  // === Test `initialContext` ============================================== //
  When(
    'incrementing the value of {variable}',
    name => setCtx(name, getCtx<number>(name) + 1),
  );
  Then(
    'the value of {variable} is {int}',
    (name, val) => assert.equal(getCtx<number>(name), parseInt(val, 10)),
  );

  // === Test `onTearDown` ================================================== //
  When(
    'incrementing the value of the global initialTen',
    () => {
      initialTen += 1;
      onTearDown(() => { initialTen -= 1; });
    },
  );
  Then(
    'the value of the global initialTen is {int}',
    val => assert.equal(initialTen, parseInt(val, 10)),
  );

  // === Test expansion ===================================================== //
  Then(
    'variable {variable} has value (.*)',
    (name, val) => assert.equal(getCtx(name), val),
  );

};

setup(fn, options);

// === Test `getVariables` ================================================== //
assert.deepEqual(getVariables('A'), ['A']);
assert.deepEqual(getVariables('A, B'), ['A', 'B']);
assert.deepEqual(getVariables('A and B'), ['A', 'B']);
assert.deepEqual(getVariables('A, B and C'), ['A', 'B', 'C']);

// === Pin down untested dependencies ======================================= //
assert(httpSupertest);
