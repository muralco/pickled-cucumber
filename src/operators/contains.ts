import { getString } from '../util';
import { Operator } from './types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the string representation of 'a' contains 'b'`,
  error: '',
  exec: (actual, expected) => {
    const expectedString = `${JSON.parse(expected)}`;
    return getString(actual).indexOf(expectedString) !== -1
    ? undefined
    : { error: 'does not contain', expected: expectedString };
  },
  name: ['contain', 'contains'],
};

export default op;
