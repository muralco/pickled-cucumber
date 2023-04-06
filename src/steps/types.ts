export type StepFn = (...args: string[]) => void;
export type ParserFn = (raw: string) => unknown;
export type ParserKind = 'json';

export interface StepOptions {
  inline?: boolean;
  optional?: string | boolean;
  parser?: ParserKind;
}

export type StepKind = 'Given' | 'Then' | 'When';

export interface Step {
  fn: StepFn;
  kind: StepKind;
  name: string;
  regexp: RegExp;
}
