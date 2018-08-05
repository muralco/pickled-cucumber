import * as assert from 'assert';
import { AfterAll } from 'cucumber';
import { promisify } from 'util';
import compareJson from './compare-json';
import createMongoEntity from './entities/mongodb';
import { Entity, EntityMap } from './entities/types';
import setup, { Options, SetupFn } from './index';
import { CompareError } from './operators/types';

let initialTen = 10;

// === Test `entities` ====================================================== //
const entities: EntityMap = {};

interface Box { id: number; color: string; }
const boxes: Box[] = [];
const boxEntity: Entity<Box, 'id'> = {
  create: async (r = { id: 0, color: 'random' }) => {
    const b = { ...r, id: boxes.length };
    boxes.push(b);
    return b;
  },
  delete: async (r) => {
    const box = await boxEntity.findBy(r);
    if (!box) return;
    boxes.splice(boxes.findIndex(b => b === box), 1);
  },
  findBy: async r => boxes.find(b => b === r || b.id === r),
  findById: r => boxEntity.findBy(r),
  update: async (r, u) => {
    const box = (await boxEntity.findBy(r)) as Box;
    return Object.assign(box, u);
  },
};
entities['box'] = boxEntity;

// === Test `entities/mongo` ================================================ //
if (require.resolve('mongodb')) {
  const mongo = require('mongodb');
  let client: any;
  let connected = false;

  const getDb = async () => {
    if (client) return client;

    client = promisify(mongo.MongoClient.connect)(
      'mongodb://localhost:27017/test',
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

// ========================================================================== //
const options: Options = {
  aliases: {
    any: /.*/,
  },
  entities,
  initialContext: () => ({ initialFive: 5 }),
  requireMocks: {
    'totally-random-module': 42,
  },
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
        `${JSON.stringify(r.actual)} ${r.error} ${JSON.stringify(r.expected)}`,
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
    'the sub error is {any} at {any}',
    (expected, path) => {
      const r = getResult();
      assert(r.subError, 'no subError found');
      if (r.subError) {
        assert.deepEqual(r.subError.actual, JSON.parse(expected));
        assert.deepEqual(r.subError.path, JSON.parse(path));
      }
    },
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
};

setup(fn, options);
