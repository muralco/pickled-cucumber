export const getString = (actual: unknown) =>
  typeof actual === 'string'
    ? actual
    : actual === undefined || actual === null
      ? JSON.stringify('')
      : JSON.stringify(actual || '');

// Checks `a` and `b` and returns `undefined` if they match (i.e. they are
// deep equal) or the path where they differ.
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
    if (!Array.isArray(a)
      || !Array.isArray(b)
      || a.length !== b.length
    ) return path;

    // Recurse and return the first element that fails, if any
    return a
      .map((va, i) => recursiveMatch(
        va,
        b[i],
        path ? `${path}.${i}` : `${i}`,
        partial,
      ))
      .find(path => path !== undefined);
  }

  // 5) Fail if the values are not objects because, they are not arrays (2) and
  // are not identical (1).
  if (typeof a !== 'object') return path;

  // 6) Both values are objects, they should have the same keys and matching
  // values
  const aObject = a as { [k: string]: unknown };
  const bObject = b as { [k: string]: unknown };
  return Object
    .keys({ ...aObject, ...bObject })
    .map((k: string) =>
        recursiveMatch(
          aObject[k],
          bObject[k],
          path ? `${path}.${k}` : k,
          partial,
        ),
      )
    .find(path => path !== undefined);
}

const IDX_REGEX = /(.*)\[(\d+)\]$/;

const getProp = (o: any, prop: string): any|undefined => {
  const [name, index] = (prop.match(IDX_REGEX) || []).slice(1);
  return name
    ? o[name][Number(index)]
    : index
      ? o[Number(index)]
      : o[prop];
};

const getPathSegments = (path: string) =>
  (path.match(/"[^"]*"|[^.]+/g) || []).map(k => k.replace(/^"(.*)"$/, '$1'));

export const getDeep = (o: unknown, path: string): unknown|undefined =>
  path === undefined
    ? undefined
    : getPathSegments(path).reduce(
      (acc, k) => acc === undefined || acc === null
        ? undefined
        : getProp(acc, k),
      o,
    );
