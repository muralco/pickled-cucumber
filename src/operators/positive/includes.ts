import { findOffendingItem, getDeep, NOT_IN_ARRAY } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the array or object 'a' includes the partial 'b'`,
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
