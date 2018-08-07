import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  Given,
  Then,
  When,
} from 'cucumber';
import printAliases from './aliases/printer';
import compareJson from './compare-json';
import { getCtx, getCtxItem, setCtx, setCtxItem } from './context';
import setupEntities from './entities';
import { getOpSpec } from './operators';
import printOperators, { printError } from './operators/printer';
import setupRequireMock from './require';
import stepCtor from './steps/constructor';
import printSteps from './steps/printer';
import { Step, StepKind } from './steps/types';
import {
  Aliases,
  Options,
  SetupFnArgs,
  StepDefinitionFn,
  TearDownFn,
} from './types';

export { getVariables } from './aliases';

export type Options = Options;

export type SetupFn = (args: SetupFnArgs) => void;

const getTearDown = () => getCtxItem<TearDownFn[]>('$tearDown');

After(() => Promise.all(getTearDown().reverse().map(fn => fn())));

const setup = (fn: SetupFn, options: Options = {}) => {
  // Force unhandleded promise rejections to fail (warning => error)
  process.on('unhandledRejection', (up) => { throw up; });

  const {
    aliases = {},
    entities = {},
    operators = {},
    requireMocks,
    usage,
  } = options;

  Before(() => {
    const customCtx = options.initialContext && options.initialContext() || {};
    setCtx({
      random: Date.now(),
      ...customCtx,
      $tearDown: [],
    });
  });

  const entityNames = Object.keys(entities);
  const hasEntities = !!entityNames.length;

  const effectiveAliases: Aliases = {
    ...aliases,
    op: getOpSpec(operators),
  };
  if (hasEntities) {
    effectiveAliases['entity'] = new RegExp(entityNames.join('|'));
  }

  const createStep = stepCtor(effectiveAliases, getCtx);

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

  const args: SetupFnArgs = {
    AfterAll,
    BeforeAll,
    compare: (op, a, e) => {
      const error = compareJson(operators, op, a, e);
      if (error !== undefined) printError(error);
    },
    getCtx: getCtxItem,
    Given: step('Given'),
    onTearDown: fn => getTearDown().push(fn),
    setCtx: setCtxItem,
    Then: step('Then'),
    When: step('When'),
  };

  if (requireMocks) setupRequireMock(requireMocks);
  if (hasEntities) setupEntities(entities, args);

  fn(args);

  if (usage) {
    console.log('Step reference');
    console.log('--------------');
    console.log(printSteps(steps));
    console.log();
    console.log('Operators');
    console.log('---------');
    console.log(printOperators(operators));
    console.log();
    console.log('Aliases');
    console.log('-------');
    console.log(printAliases(effectiveAliases));
  }

  steps.forEach((s) => {
    switch (s.kind) {
      case 'Given': return Given(s.regexp, s.fn);
      case 'Then': return Then(s.regexp, s.fn);
      case 'When': return When(s.regexp, s.fn);
    }
  });
};

export default setup;
