import { Operator } from '../types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the object 'a' has none of the keys in array 'b'`,
  exec: (actual, notExpected) => {
    const actualObject =
      typeof actual === 'object' ? (actual as Record<string, unknown>) : {};
    const notExpectedKeys: string[] = JSON.parse(notExpected);
    const extra = notExpectedKeys.filter((k) =>
      Object.prototype.hasOwnProperty.call(actualObject, k),
    );
    const error = extra.length === 1 ? 'has key' : 'has keys';
    return extra.length === 0 ? undefined : { error, expected: extra };
  },
  name: 'does not have keys',
};

export default op;
