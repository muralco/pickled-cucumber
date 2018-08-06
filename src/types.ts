import { EntityMap } from './entities/types';
import { OperatorMap } from './operators/types';
import { StepFn, StepOptions } from './steps/types';

export interface Context {
  [key: string]: any;
}

export interface Aliases {
  [name: string]: RegExp;
}

export interface RequireMockMap {
  [module: string]: any;
}

export interface Options {
  aliases?: Aliases;
  entities?: EntityMap;
  initialContext?: () => Context;
  operators?: OperatorMap;
  requireMocks?: RequireMockMap;
  verbose?: boolean;
}

export type StepDefinitionFn = (
  name: string,
  fn: StepFn,
  opts?: StepOptions,
) => void;

export type TearDownFn = () => Promise<void>|void;

export interface SetupFnArgs {
  getCtx: <T>(name: string) => T;
  compare: (op: string, actual: any, expected: any) => void;
  Given: StepDefinitionFn;
  onTearDown: (fn: TearDownFn) => void;
  setCtx: <T>(name: string, value: T) => void;
  Then: StepDefinitionFn;
  When: StepDefinitionFn;
}
