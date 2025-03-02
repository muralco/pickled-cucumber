import { findPartialInCollection } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the array or object 'a' does not include the partial 'b'`,
  exec: (actual, expected) => {
    const expectedJson = JSON.parse(expected);
    const offending = findPartialInCollection(actual, expectedJson);

    if (!offending.matched) return undefined;

    return {
      assertEquals: true,
      error: 'does include',
      expected: expectedJson,
      path: offending.path,
    };
  },
  name: ['do not include', 'does not include'],
};

export default op;
