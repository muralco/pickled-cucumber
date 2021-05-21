import { getString, stringToRegexp } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the string representation of 'a' matches regex 'b'`,
  exec: (actual, expected) => {
    const expectedRexExp = stringToRegexp(expected);
    return getString(actual).match(expectedRexExp)
      ? undefined
      : { error: 'does not match', expected: `${expectedRexExp}` };
  },
  name: 'matches',
};

export default op;
