import { getString } from '../util';
import { Operator } from './types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the string representation of 'a' matches regex 'b'`,
  error: '',
  exec: (actual, expected) => {
    const [flags] = (expected.match(/\/([gimuy]+)$/) || []).slice(1);

    const expectedString = expected
      .replace(/^\/(.*)\/[gimuy]*$/, '$1')
      .replace(/^"(.*)"$/, '$1');

    const expectedRexExp = new RegExp(expectedString, flags);

    return !!getString(actual).match(expectedRexExp)
      ? undefined
      : { error: 'does not match', expected: `${expectedRexExp}` };
  },
  name: 'matches',
};

export default op;
