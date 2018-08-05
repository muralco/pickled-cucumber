import * as assert from 'assert';
import compareJson from './compare-json';
import setup, { Options, SetupFn } from './index';
import { CompareError } from './operators/types';

const options: Options = {
  aliases: {
    any: /.*/,
  },
};

const fn: SetupFn = ({ getCtx, Given, setCtx, Then, When }) => {
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
};

setup(fn, options);
