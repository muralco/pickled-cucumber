import { getString } from '../util';
import { Operator } from './types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the string representation of 'a' starts with 'b'`,
  error: '',
  exec: (actual, expected) => {
    const expectedString = `${JSON.parse(expected)}`;
    return getString(actual).indexOf(expectedString) === 0
      ? undefined
      : { error: 'does not start with', expected: expectedString };
  },
  name: 'starts with',
};

export default op;
