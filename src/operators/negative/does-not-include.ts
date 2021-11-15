import { findOffendingItem } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the array or object 'a' does not include the partial 'b'`,
  exec: (actual, expected) => {
    const expectedJson = JSON.parse(expected);
    const offending = findOffendingItem(actual, expectedJson);

    if (offending.path !== undefined) return undefined;

    return {
      assertEquals: true,
      error: 'does include',
      expected: expectedJson,
    };
  },
  name: ['do not include', 'does not include'],
};

export default op;
