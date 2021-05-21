import { getString, stringToRegexp } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the string representation of 'a' does not match regex 'b'`,
  exec: (actual, expected) => {
    const expectedRexExp = stringToRegexp(expected);
    return !getString(actual).match(expectedRexExp)
      ? undefined
      : { error: 'matches', expected: `${expectedRexExp}` };
  },
  name: 'does not match',
};

export default op;
