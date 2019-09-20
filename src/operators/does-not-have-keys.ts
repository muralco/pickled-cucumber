import { Operator } from './types';

const op: Operator = {
  arity: 'binary',
  description: `checks that the object 'a' has none of the keys in array 'b'`,
  error: '',
  exec: (actual, notExpected) => {
    const actualObject = typeof actual === 'object'
      ? (actual as object)
      : {};
    const notExpectedKeys: string[] = JSON.parse(notExpected);
    const extra = notExpectedKeys.filter(k => actualObject.hasOwnProperty(k));
    const error = extra.length === 1
      ? 'has key'
      : 'has keys';
    return extra.length === 0
      ? undefined
      : { error, expected: extra };
  },
  name: 'does not have keys',
};

export default op;
