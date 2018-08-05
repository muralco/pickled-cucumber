export const getString = (actual: string | Object | number | boolean) =>
  (typeof actual === 'string'
    ? actual
    : JSON.stringify(actual || ''));

// Checks `a` and `b` and returns `undefined` if the match (i.e. they are
// deep equal) or the path where they differ.
export function recursiveMatch(a: any, b: any, path = ''): string | undefined {
  // 1) Match if both values are identical references of equivalent primitives
  if (a === b) return undefined;

  // 2) Fail if both values have different types
  if (typeof a !== typeof b) return path;

  // 3) Handle arrays
  if (Array.isArray(a) || Array.isArray(b)) {
    // Fail if one is an array and the other is not, or when the arrays have
    // diffrent sizes
    if (!Array.isArray(a)
      || !Array.isArray(b)
      || a.length !== b.length
    ) return path;

    // Recurse and return the first element that fails, if any
    return a
      .map((va, i) => recursiveMatch(va, b[i], path ? `${path}.${i}` : `${i}`))
      .find(path => path !== undefined);
  }

  // 4) Fail if the values are not objects because, they are not arrays (3) and
  // are not identical (1).
  if (typeof a !== 'object') return path;

  // 5) Both values are objects, they should have the same keys and matching
  // values
  return Object
    .keys({ ...a, ...b })
    .map(k => recursiveMatch(a[k], b[k], path ? `${path}.${k}` : k))
    .find(path => path !== undefined);
}

export const getDeep = (o: any, path: string): any|undefined =>
  path.split('.').reduce(
    (acc, k) => acc === undefined || acc === null ? undefined : acc[k],
    o,
  );
