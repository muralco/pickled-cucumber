import { getDeep, recursiveMatch } from '../../util';
import { Operator } from '../types';

interface Offending {
  actual: unknown;
  path: string | undefined;
}

const isObject = (item: unknown): item is Record<string, unknown> =>
  typeof item === 'object' && !Array.isArray(item) && item !== null;

const recursiveIncludes = (
  actual: unknown,
  expectedPartial: unknown,
  path?: string,
) => {
  const expected =
    isObject(actual) && isObject(expectedPartial)
      ? { ...actual, ...expectedPartial } // make a whole object from a partial
      : expectedPartial; // is a primitive or array

  return recursiveMatch(actual, expected, path, true);
};

const NOT_IN_ARRAY = {};

const findOffendingItem = (actual: unknown, expected: string): Offending => {
  if (!Array.isArray(actual)) {
    return { actual, path: recursiveIncludes(actual, expected) };
  }

  const items = actual.map((a, i) => ({
    actual: a,
    path: recursiveIncludes(a, expected, `${i}`),
  }));

  if (items.some((i) => !i.path)) {
    return { actual, path: undefined };
  }

  if (!items.length) {
    return { actual: NOT_IN_ARRAY, path: '0' };
  }

  return { actual: NOT_IN_ARRAY, path: items[0].path };
};

const op: Operator = {
  arity: 'binary',
  description: `checks that the array or object 'a' contains the partial 'b'`,
  exec: (actual, expected) => {
    const expectedJson = JSON.parse(expected);
    const offending = findOffendingItem(actual, expectedJson);

    if (offending.path === undefined) return undefined;

    return {
      assertEquals: true,
      error: 'does not include',
      expected: expectedJson,
      subError:
        offending.actual !== NOT_IN_ARRAY
          ? {
              actual: getDeep(offending.actual, offending.path),
              expected: getDeep(expectedJson, offending.path),
              path: offending.path,
            }
          : undefined,
    };
  },
  name: ['include', 'includes'],
};

export default op;
