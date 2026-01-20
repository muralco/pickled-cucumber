import { PartialFindResult } from './types';

export const getString = (actual: unknown): string =>
  typeof actual === 'string'
    ? actual
    : actual === undefined || actual === null
    ? JSON.stringify('')
    : JSON.stringify(actual);

/**
 * Checks `a` and `b` and returns `undefined` if they match (i.e. they are
 * deep equal) or the path where they differ.
 */
export function recursiveMatch(
  a: unknown,
  b: unknown,
  path = '',
  partial = false, // if true, allow `a` to have more keys than `b`
): string | undefined {
  // 1) Match if both values are identical references of equivalent primitives
  if (a === b) return undefined;

  // 2) Match `partial`
  if (partial) {
    // `b` does not constrain `a` (this key is not in `b`, but can be in `a`)
    if (b === undefined) return undefined;
    // JSON cannot model `undefined`, so if `b` constraints to `null`, we accept
    // `undefined` in `a`
    if (a === undefined && b === null) return undefined;
  }

  // 3) Fail if both values have different types
  if (typeof a !== typeof b) return path;

  // 4) Handle arrays
  if (Array.isArray(a) || Array.isArray(b)) {
    // Fail if one is an array and the other is not, or when the arrays have
    // different sizes
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
      return path;

    // Recurse and return the first element that fails, if any
    return a
      .map((va, i) =>
        recursiveMatch(va, b[i], path ? `${path}.${i}` : `${i}`, partial),
      )
      .find((path) => path !== undefined);
  }

  // 5) Fail if the values are not objects because, they are not arrays (2) and
  // are not identical (1).
  if (typeof a !== 'object') return path;

  // 6) Both values are objects, they should have the same keys and matching
  // values
  const aObject = a as { [k: string]: unknown };
  const bObject = b as { [k: string]: unknown };
  return Object.keys({ ...aObject, ...bObject })
    .map((k: string) =>
      recursiveMatch(
        aObject[k],
        bObject[k],
        path ? `${path}.${k}` : k,
        partial,
      ),
    )
    .find((path) => path !== undefined);
}

/**
 * Recursivelly checks if `actual` has an `expectedPartial` at `path`
 * @param actual Actual item being compared
 */
const recursivePartialMatch = (
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

const IDX_REGEX = /(.*)\[(\d+)\]$/;

// eslint-disable-next-line
const getProp = (o: any, prop: string): any | undefined => {
  const [name, index] = (prop.match(IDX_REGEX) || []).slice(1);
  return name ? o[name][Number(index)] : index ? o[Number(index)] : o[prop];
};

const getPathSegments = (path: string) =>
  (path.match(/"[^"]*"|[^.]+/g) || []).map((k) => k.replace(/^"(.*)"$/, '$1'));

const isObject = (item: unknown): item is Record<string, unknown> =>
  typeof item === 'object' && !Array.isArray(item) && item !== null;

export const getDeep = (o: unknown, path: string): unknown | undefined =>
  path === undefined
    ? undefined
    : getPathSegments(path).reduce(
        (acc, k) =>
          acc === undefined || acc === null ? undefined : getProp(acc, k),
        o,
      );

export const stringToRegexp = (str: string): RegExp => {
  const [flags] = (str.match(/\/([gimuy]+)$/) || []).slice(1);

  const expectedString = str
    .replace(/^\/(.*)\/[gimuy]*$/, '$1')
    .replace(/^"(.*)"$/, '$1');

  return new RegExp(expectedString, flags);
};

export const NOT_IN_ARRAY = Symbol('NOT_IN_ARRAY');

/**
 * Find a partial inside an array using recursivePartialMatch.
 * The returned path is the index in which it was found, or in the
 * case of failing, the path where it differs.
 */
export const findPartialInCollection = (
  actual: unknown,
  expected: string,
): PartialFindResult => {
  // Actual is not an array, test partial `expected` match against `actual`
  if (!Array.isArray(actual)) {
    const path = recursivePartialMatch(actual, expected);
    const matched = path === undefined;
    return { actual, path: path || '', matched };
  }

  // Actual it an array, test partial for each item
  const items = actual.map((a, i) => {
    const path = recursivePartialMatch(a, expected, `${i}`);
    const matched = path === undefined;
    return {
      actual: a,
      path: path || `${i}`,
      matched,
    };
  });

  // Return the first matched item
  const matchedItem = items.find(({ matched }) => matched);
  if (matchedItem) {
    return { actual, path: `${matchedItem.path}`, matched: true };
  }

  // Otherwise, the match fails
  return {
    actual: NOT_IN_ARRAY,
    path: items.length ? items[0].path : '0',
    matched: false,
  };
};
