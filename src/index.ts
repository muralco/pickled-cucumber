import {
    After, AfterAll, Before, BeforeAll,
    Given, setDefaultTimeout, Then, When,
} from '@cucumber/cucumber';
import printAliases from './aliases/printer';
import compareJson from './compare-json';
import { getCtx, getCtxItem, pushCtxItem, setCtx, setCtxItem } from './context';
import setupDebug from './debug';
import setupEntities from './entities';
import { defineElasticSteps } from './entities/elasticsearch';
import setupHttp from './http';
import setupMisc from './misc';
import { getOpSpec } from './operators';
import printOperators, { printError } from './operators/printer';
import { setupOutputCapture } from './output';
import setupRequireMock from './require';
import stepCtor from './steps/constructor';
import printSteps from './steps/printer';
import { Step, StepKind } from './steps/types';
import {
  Aliases,
  Options as BaseOptions,
  SetupFnArgs,
  StepDefinitionFn,
  TearDownFn,
} from './types';

export { getVariables } from './aliases';

export type Options = BaseOptions;

export type SetupFn = (args: SetupFnArgs) => void;

const setup = (
  fn: SetupFn,
  options: Options = {},
) => {
  // Force unhandleded promise rejections to fail (warning => error)
  process.on('unhandledRejection', (up: unknown) => { throw up; });
  // Tear down
  const getTearDown = () => getCtxItem<TearDownFn[]>('$tearDown');
  if (!process.env.KEEP_DATA) {
    After(() => Promise.all(getTearDown().reverse().map(fn => fn())));
  }

  const {
    aliases = {},
    captureOutput,
    debug,
    elasticSearchIndexUri,
    entities = {},
    http,
    operators = {},
    requireMocks,
    suppressOutput,
    timeout,
    usage,
  } = options;

  setDefaultTimeout(timeout || Number(process.env.TEST_TIMEOUT || '10') * 1000);

  Before(($scenario) => {
    const customCtx = options.initialContext && options.initialContext() || {};
    setCtx({
      random: Date.now(),
      ...customCtx,
      $scenario,
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

  const args: SetupFnArgs = {
    After,
    AfterAll,
    Before,
    BeforeAll,
    compare: (op, a, e) => {
      const error = compareJson(operators, op, a, e);
      if (error !== undefined) printError(error);
    },
    getCtx: getCtxItem,
    Given: step('Given'),
    onTearDown: fn => getTearDown().push(fn),
    pushCtx: pushCtxItem,
    setCtx: setCtxItem,
    Then: step('Then'),
    When: step('When'),
  };

  setupMisc(args);
  if (requireMocks) setupRequireMock(requireMocks);
  if (hasEntities) setupEntities(entities, args);
  if (elasticSearchIndexUri) defineElasticSteps(elasticSearchIndexUri, args);
  if (http) setupHttp(http, args);
  if (!debug && (captureOutput || suppressOutput)) {
    setupOutputCapture(captureOutput, suppressOutput);
  }
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
    console.log();
    console.log('Variables');
    console.log('---------');
    console.log(`
    \${varName}          => expands to the value bound to varName
    \${varName.propName} => expands to the propName property of varName
    \${varName[0].name}  => expands to the name of the first item of varName
    `.replace(/^\s+/gm, ''));
  }

  if (debug) setupDebug(steps);

  steps.forEach((s) => {
    switch (s.kind) {
      case 'Given': return Given(s.regexp, s.fn);
      case 'Then': return Then(s.regexp, s.fn);
      case 'When': return When(s.regexp, s.fn);
    }
  });

  return steps;
};

export default setup;
