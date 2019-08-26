declare module "cucumber/lib/runtime/test_case_runner" {
  import {
    events,
    HookScenarioResult,
    pickle,
    Step as CucumberStep,
    StepDefinition as CucumberStepDefinition,
  } from 'cucumber';
  export interface Result extends events.StepResultPayload {
    exception?: Error;
  }
  export interface Step extends CucumberStep {
    text: string;
  }
  export type StepDefinition = CucumberStepDefinition;
  export type HookParams = HookScenarioResult;

  export default class {
    getStepDefinitions(step: Step): StepDefinition[];
    invokeStep(
      step: Step,
      definition: StepDefinition,
      hookParams?: HookParams,
    ): Promise<Result>;
    testCase: { pickle: pickle.Pickle; };
    testCaseSourceLocation: {
      uri: string;
      line: number;
    };
    testStepIndex: number;
  }
}