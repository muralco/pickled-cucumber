import { getDeep, recursiveMatch } from '../util';
import { Operator } from './types';

interface Offending {
  actual: any;
  path: string | undefined;
}

const recursiveIncludes = (
  actual: any,
  expectedPartial: any,
  path?: string,
) => {
  const expected = typeof expectedPartial === 'object'
    && !Array.isArray(expectedPartial)
    ? { ...actual, ...expectedPartial } // make a whole object from a partial
    : expectedPartial; // is a primitive or array

  return recursiveMatch(actual, expected, path);
};

const findOffendingItem = (actual: any, expected: any): Offending => {
  if (!Array.isArray(actual)) {
    return { actual, path: recursiveIncludes(actual, expected) };
  }

  const items = actual.map((a, i) => ({
    actual: a,
    path: recursiveIncludes(a, expected, `${i}`),
  }));

  if (items.some(i => !i.path)) return { actual, path: undefined };

  return { actual: null, path: items[0].path };
};

const op: Operator = {
  arity: 'binary',
  description: `checks that the array or object 'a' contains the partial 'b'`,
  error: '',
  exec: (actual, expected) => {
    const expectedJson = JSON.parse(expected);
    const offending = findOffendingItem(actual, expectedJson);

    if (offending.path === undefined) return undefined;

    const actualValue = offending.path
      ? getDeep(offending.actual, offending.path)
      : offending.actual;

    return {
      error: 'does not include',
      expected: expectedJson,
      subError: offending.path
        ? {
          actual: actualValue,
          path: offending.path,
        }
        : undefined,
    };
  },
  name: ['include', 'includes'],
};

export default op;
