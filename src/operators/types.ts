interface OperatorError {
  error: string;
  expected?: unknown;
  path?: string;
  subError?: {
    actual: unknown;
    expected: unknown;
    path: string;
  };
  unary?: boolean;
}

export interface CompareError extends OperatorError {
  actual: unknown;
  assertEquals?: boolean;
  full?: unknown;
  op: string;
}

export type CompareResult = CompareError | undefined;

export interface Operator {
  arity: 'binary' | 'unary';
  description: string;
  exec: (actual: unknown, expected: string) => undefined | OperatorError;
  name: string | string[];
}

export interface OperatorMap {
  [op: string]: Operator;
}
