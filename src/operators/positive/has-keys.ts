import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the object 'a' has all the keys in array 'b'`,
  exec: (actual, expected) => {
    const actualObject =
      typeof actual === 'object' ? (actual as Record<string, unknown>) : {};
    const expectedKeys: string[] = JSON.parse(expected);
    const missing = expectedKeys.filter(
      (k) => !Object.prototype.hasOwnProperty.call(actualObject, k),
    );
    const error =
      missing.length === 1 ? 'does not have key' : 'does not have keys';
    return !missing.length ? undefined : { error, expected: missing };
  },
  name: 'has keys',
};

export default op;
