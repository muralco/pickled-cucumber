import { Operator } from './types';

const op: Operator = {
  arity: 'unary',
  description: `checks that 'a' is truthy`,
  error: '',
  exec: actual =>
    actual
    ? undefined
    : { error: 'is not truthy', expected: undefined },
  name: 'exists',
};

export default op;
