import { recursiveMatch } from '../../util';
import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that 'a' does not deep equal 'b'`,
  exec: (actual, expected) => {
    if (expected === 'null' && actual !== null) return undefined;
    const isUndef = expected === 'undefined';
    const expectedJson = isUndef
      ? undefined
      : JSON.parse(expected);
    const errorPath = recursiveMatch(actual, expectedJson);
    return errorPath !== undefined
      ? undefined
      : {
        // TODO: here
        assertEquals: true,
        error: 'is',
        expected: expectedJson,
        path: errorPath,
      };
  },
  name: 'isn\'t',
};

export default op;
