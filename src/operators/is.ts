import { recursiveMatch } from '../util';
import { Operator } from './types';

const op: Operator = {
  arity: 'binary',
  description: `checks that 'a' deep equals 'b'`,
  error: '',
  exec: (actual, expected) => {
    if (expected === 'null' && actual === null) return undefined;
    const isUndef = expected === 'undefined';
    const expectedJson = isUndef
      ? undefined
      : JSON.parse(expected);
    const errorPath = recursiveMatch(actual, expectedJson);
    return errorPath === undefined
      ? undefined
      : { error: 'is not', expected: expectedJson, path: errorPath };
  },
  name: 'is',
};

export default op;
