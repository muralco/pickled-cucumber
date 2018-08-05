import { Before, Given, Then, When } from 'cucumber';
import { getCtx, getCtxItem, resetCtx, setCtxItem } from './context';
import printOperators from './operators/printer';
import stepCtor from './steps/constructor';
import printSteps from './steps/printer';
import { Step, StepFn, StepKind, StepOptions } from './steps/types';
import { Options } from './types';

export type Options = Options;

type StepDefinitionFn = (name: string, fn: StepFn, opts?: StepOptions) => void;

interface SetupFnArgs {
  getCtx: typeof getCtxItem;
  Given: StepDefinitionFn;
  setCtx: typeof setCtxItem;
  Then: StepDefinitionFn;
  When: StepDefinitionFn;
}

export type SetupFn = (args: SetupFnArgs) => void;

Before(resetCtx);

const setup = (fn: SetupFn, options: Options = {}) => {
  const { operators = {}, aliases = {} } = options;

  const createStep = stepCtor(operators, aliases, getCtx);

  const steps: Step[] = [];

  const step = (kind: StepKind): StepDefinitionFn => (...args) => {
    steps.push(...createStep(kind, ...args));
    return steps;
  };

  step('Given')(
    'variable {variable} is',
    (id, payload) => setCtxItem(id, payload),
    { inline: true },
  );

  fn({
    getCtx: getCtxItem,
    Given: step('Given'),
    setCtx: setCtxItem,
    Then: step('Then'),
    When: step('When'),
  });

  console.log('Step reference');
  console.log('--------------');
  console.log(printSteps(steps));
  console.log();
  console.log('Operators');
  console.log('---------');
  console.log(printOperators(operators));

  steps.forEach((s) => {
    switch (s.kind) {
      case 'Given': return Given(s.regexp, s.fn);
      case 'Then': return Then(s.regexp, s.fn);
      case 'When': return When(s.regexp, s.fn);
    }
  });
};

export default setup;
