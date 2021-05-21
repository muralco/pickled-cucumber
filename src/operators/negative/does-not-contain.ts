import { getString } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the string representation of 'a' does not contain 'b'`,
  exec: (actual, expected) => {
    const expectedString = `${JSON.parse(expected)}`;
    return getString(actual).indexOf(expectedString) === -1
      ? undefined
      : { error: 'contains', expected: expectedString };
  },
  name: ['do not contain', 'does not contain'],
};

export default op;
