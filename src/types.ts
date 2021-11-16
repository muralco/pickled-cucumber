import { IDefineSupportCodeMethods } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { EntityMap } from './entities/types';
import { HttpFn } from './http/types';
import { OperatorMap } from './operators/types';
import { StepFn, StepOptions } from './steps/types';

export interface Context {
  [key: string]: unknown;
}

export interface Aliases {
  [name: string]: RegExp;
}

export interface RequireMockMap {
  [module: string]: unknown;
}

export interface Options {
  aliases?: Aliases;
  captureOutput?: boolean;
  elasticSearchIndexUri?: string;
  entities?: EntityMap;
  http?: HttpFn;
  initialContext?: () => Context;
  operators?: OperatorMap;
  requireMocks?: RequireMockMap;
  suppressOutput?: boolean;
  timeout?: number;
  usage?: boolean;
}

export type StepDefinitionFn = (
  name: string,
  fn: StepFn,
  opts?: StepOptions,
) => void;

export type TearDownFn = () => Promise<void> | void;

export type SetupFnArgs = Pick<
  IDefineSupportCodeMethods,
  'After' | 'AfterStep' | 'AfterAll' | 'Before' | 'BeforeStep' | 'BeforeAll'
> & {
  compare: (op: string, actual: unknown, expected: string) => void;
  getCtx: <T>(name: string) => T;
  Given: StepDefinitionFn;
  onTearDown: (fn: TearDownFn) => void;
  pushCtx: <T>(name: string, value: T) => void;
  setCtx: <T>(name: string, value: T) => void;
  Then: StepDefinitionFn;
  When: StepDefinitionFn;
};

export interface RecursivePartialMatchResult {
  actual?: unknown;
  matched: boolean;
  path: string;
}
