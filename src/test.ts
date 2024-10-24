import { AfterAll } from '@cucumber/cucumber';
import assert from 'assert';
import execa from 'execa';
import fs from 'fs';
import nodeFetch from 'node-fetch';
import path from 'path';
import compareJson from './compare-json';
import createElasticEntity from './entities/elasticsearch';
import createMemoryEntity from './entities/memory';
import createMongoEntity from './entities/mongodb';
import { EntityMap } from './entities/types';
import httpFetch from './http/fetch';
import httpSupertest from './http/supertest';
import setup, { getVariables, Options, SetupFn } from './index';
import { CompareError } from './operators/types';
const { mkdtemp, rmdir, writeFile } = fs.promises;

let initialTen = 10;
const ELASTIC_URI = process.env.ELASTIC_URI
  ? `${process.env.ELASTIC_URI}/test-index`
  : undefined;

// === Test `entities` ====================================================== //
const entities: EntityMap = {};

interface Box {
  id: number;
  color: string;
}
let boxId = 0;
entities['box'] = createMemoryEntity<Box, 'id'>('id', () => (boxId += 1));

// === Test `entities/mongo` ================================================ //
if (process.env.MONGO_URI) {
  // eslint-disable-next-line
  const mongo = require('mongodb');
  // eslint-disable-next-line
  let client: any;
  let connected = false;

  const getDb = async () => {
    if (client) return client.db();

    const conn = new mongo.MongoClient(process.env.MONGO_URI);
    client = await conn.connect();

    connected = true;
    return client.db();
  };
  AfterAll(async () => {
    if (connected) (await client).close();
  });

  entities['user'] = createMongoEntity(getDb, 'test-users', 'id', {
    onCreate: (attrs) => ({ id: Date.now(), ...attrs, created: Date.now() }),
    onUpdate: (attrs) => ({ ...attrs, updated: Date.now() }),
  });
}

// === Test `entities/elasticsearch` ======================================== //
if (ELASTIC_URI) {
  const indexMapping = {
    properties: {
      id: { type: 'long' },
      action: { type: 'text' },
      color: { type: 'text' },
      created: { type: 'long' },
      updated: { type: 'long' },
    },
  };
  entities['search'] = createElasticEntity(ELASTIC_URI, indexMapping, 'id', {
    onCreate: (attrs) => ({ id: Date.now(), ...attrs, created: Date.now() }),
    onUpdate: (attrs) => ({ ...attrs, updated: Date.now() }),
  });
}

// ========================================================================== //
const options: Options = {
  aliases: {
    '/api/*': /\/api\/.*/,
    'proper-name': /[A-Z][a-z]*/,
  },
  captureOutput: true,
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
  suppressOutput: true,
  usage: true,
};

const fn: SetupFn = ({ getCtx, Given, onTearDown, setCtx, Then, When }) => {
  // === Test `requireMocks` ================================================ //
  assert.equal(
    // eslint-disable-next-line
    require('totally-random-module'),
    42,
    'Require mocks are not working',
  );

  // === Test `compareJson` and `aliases` =================================== //
  const getResult = () => getCtx<CompareError>('$result');

  Given('{word} is', (name, value) => setCtx(name, JSON.parse(value)), {
    inline: true,
  });

  When(
    'asserting that {word} {op}',
    (varName, op, expected) =>
      setCtx('$result', compareJson({}, op, getCtx(varName), expected)),
    { inline: true },
  );

  Then('the assertion passes', () => assert.equal(getResult(), undefined));
  Then('the assertion fails with {any}', (expected) => {
    const r = getResult();
    assert(r, 'the assertion passed');
    assert.deepEqual(
      `${JSON.stringify(r.actual)} ${r.error}${
        !r.unary ? ` ${JSON.stringify(r.expected)}` : ''
      }`,
      expected,
    );
  });
  Then('the error path is {any}', (path) =>
    assert.equal(JSON.stringify(getResult().path), path),
  );
  Then(
    'the full actual value is',
    (actual) => assert.deepEqual(JSON.parse(actual), getResult().full),
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
  Then('A proper name can be {proper-name}', (name) =>
    assert(!!name.match(/^[A-Z]/)),
  );
  Then('the {/api/*} alias matches (.*)', (actual, expected) =>
    assert.equal(actual, expected),
  );

  // === Test `initialContext` ============================================== //
  When('incrementing the value of {variable}', (name) =>
    setCtx(name, getCtx<number>(name) + 1),
  );
  Then('the value of {variable} is {int}', (name, val) =>
    assert.equal(getCtx<number>(name), parseInt(val, 10)),
  );

  // === Test `onTearDown` ================================================== //
  When('incrementing the value of the global initialTen', () => {
    initialTen += 1;
    onTearDown(() => {
      initialTen -= 1;
    });
  });
  Then('the value of the global initialTen is {int}', (val) =>
    assert.equal(initialTen, parseInt(val, 10)),
  );

  // === Test expansion ===================================================== //
  Then('variable {variable} has value (.*)', (name, val) =>
    assert.equal(getCtx(name), val),
  );

  // === Test parser ===================================================== //
  Then(
    'JSON representation of the payload is (.*)',
    (repr, payload) => assert.equal(repr, JSON.stringify(payload)),
    { parser: 'json' },
  );

  // === Test output ======================================================== //
  Given('step definition', (payload) => setCtx('steps-definition', payload));
  Given('feature file is', (payload) =>
    setCtx(`feature-file-content`, payload),
  );
  Given('stdio output is suppressed', () =>
    setCtx(`suppression-enabled`, true),
  );
  Given('stdio output is captured', () => setCtx(`capture-enabled`, true));
  When('the suite is executed', async () => {
    const testDir = await mkdtemp(`output-test-`);
    const featureFile = path.join(testDir, 'test-feature.feature');
    const stepsFile = path.join(testDir, 'steps.ts');

    await writeFile(featureFile, getCtx('feature-file-content'));

    const testOptions: Options = {
      captureOutput: getCtx<boolean | undefined>('capture-enabled'),
      suppressOutput: getCtx<boolean | undefined>('suppression-enabled'),
    };

    // Asume they define fn
    const stepsContent = `
import setup, { SetupFn } from '../src/index';

${getCtx('steps-definition')}

setup(fn, {
  ...${JSON.stringify(testOptions)},
  initialContext: () => {
    console.log('logged-on-initial-context-stdout');
    console.error('logged-on-initial-context-stderr');
    return {};
  },
});
    `;

    await writeFile(stepsFile, stepsContent);

    try {
      const output = await execa(
        './node_modules/.bin/cucumber-js',
        [
          '--publish-quiet',
          '--require-module',
          'ts-node/register',
          '-r',
          stepsFile,
          featureFile,
        ],
        {
          env: {
            TS_NODE_CACHE: 'false',
            TS_NODE_FILES: 'true',
          },
        },
      );
      setCtx('test-suite-stdout', output.stdout);
      setCtx('test-suite-stderr', output.stderr);
    } catch (error) {
      // Test suite can fail
      setCtx('test-suite-stdout', error.stdout);
      setCtx('test-suite-stderr', error.stderr);
    }

    onTearDown(async () => {
      if (testDir) {
        await rmdir(testDir, { recursive: true });
      }
    });
  });
  Then('stdout contains', (payload) => {
    const output = getCtx<string>('test-suite-stdout');
    // Remove last line (used to report status because has timings
    const filtered = output
      .split('\n')
      .map((line) => line.split(' #')[0])
      .filter((line) => {
        // Remove last line (used to report status because has timings)
        if (line.includes('s (executing steps: ')) {
          return false;
        }
        // Remove information from exceptions
        if (line.startsWith('           at ')) {
          return false;
        }
        return true;
      })
      .join('\n');
    assert.deepEqual(payload, filtered);
  });
  Then('stderr contains', (payload) => {
    const output = getCtx<string>('test-suite-stderr');
    assert.deepEqual(payload, output);
  });
};

setup(fn, options);

// === Test `getVariables` ================================================== //
assert.deepEqual(getVariables('A'), ['A']);
assert.deepEqual(getVariables('A, B'), ['A', 'B']);
assert.deepEqual(getVariables('A and B'), ['A', 'B']);
assert.deepEqual(getVariables('A, B and C'), ['A', 'B', 'C']);

// === Pin down untested dependencies ======================================= //
assert(httpSupertest);
