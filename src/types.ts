import { EntityMap } from './entities/types';
import { HttpFn } from './http/types';
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
  elasticSearchIndexUri?: string;
  entities?: EntityMap;
  initialContext?: () => Context;
  http?: HttpFn;
  operators?: OperatorMap;
  requireMocks?: RequireMockMap;
  timeout?: number;
  usage?: boolean;
}

export type StepDefinitionFn = (
  name: string,
  fn: StepFn,
  opts?: StepOptions,
) => void;

export type TearDownFn = () => Promise<void>|void;
type HookFn = (fn: () => Promise<void>|void) => void;

export interface SetupFnArgs {
  After: HookFn;
  AfterAll: HookFn;
  Before: HookFn;
  BeforeAll: HookFn;
  getCtx: <T>(name: string) => T;
  compare: (op: string, actual: any, expected: any) => void;
  Given: StepDefinitionFn;
  onTearDown: (fn: TearDownFn) => void;
  setCtx: <T>(name: string, value: T) => void;
  Then: StepDefinitionFn;
  When: StepDefinitionFn;
}
