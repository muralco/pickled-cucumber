export type StepFn = (...args: string[]) => void;

export interface StepOptions {
  inline?: boolean;
  optional?: string | boolean;
}

export type StepKind = 'Given' | 'Then' | 'When';

export interface Step {
  fn: StepFn;
  kind: StepKind;
  name: string;
  regexp: RegExp;
}
