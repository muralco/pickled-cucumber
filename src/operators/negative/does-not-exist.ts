import { Operator } from '../types';

const op: Operator = {
  arity: 'unary',
  description: `checks that 'a' is truthy`,
  exec: actual =>
    actual
      ? { error: 'is not falsey', unary: true }
      : undefined,
  name: ['does not exist', 'do not exist'],
};

export default op;
