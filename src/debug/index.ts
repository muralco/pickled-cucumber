// This file is all about monkey patching CucumberJS to add pseudo-debugging
// capabilities.
import TestCaseRunner, {
  HookParams,
  Result,
  Step,
  StepDefinition,
} from 'cucumber/lib/runtime/test_case_runner';
import * as readline from 'readline';
import { getCtx, getCtxItem } from '../context';
import printSteps from '../steps/printer';
import { Step as ContextStep } from '../steps/types';

const oldRs = TestCaseRunner.prototype.invokeStep;

const COMMANDS = [
  'dump',
  'exit',
  'help',
  'retry',
  'steps',
];

const BAR = `=================================================================`;

const HELP = `${BAR}
Usage:
  debug> <command>
or:
  debug> <step>

Commands:
  dump [key]     Dump a key from the test context (or the whole context if key
                 is omitted).
  exit           Exit debugger
  r, retry       Retry the failed command
  steps          Print all available steps

Steps:
  Any Given, When or Then step you have defined. For example:

  debug> Given variable A is 1

Hint 👊: you can use <Tab> completion!

${BAR}`;

const runAndPrintError = async (
  runner: TestCaseRunner,
  steps: ContextStep[],
  step: Step,
  def: StepDefinition,
  hp: HookParams | undefined,
) => {
  const r = await oldRs.call(runner, step, def, hp);
  if (r.status === 'failed') {
    const actual = steps.find(s => s.name === step.text);

    const stepText = actual
      ? `${actual.kind} ${actual.name}`
      : step.text;

    const { uri } = runner.testCaseSourceLocation;
    const { line } = runner.testCase.pickle.steps[runner.testStepIndex - 1]
      .locations[0];
    console.log(`\n> ${stepText} (${uri}:${line})`);
    console.log(
      `< ERROR:\n`,
      r.exception
        ? r.exception.toString()
        : r.exception,
    );
  }
  return r;
};

const completer = (steps: ContextStep[]) => {
  const all = [
    ...COMMANDS,
    ...steps.map(s => `${s.kind} ${s.name}`),
  ].sort();

  return (linePartial: string) => [
    linePartial
      ? all.filter(c => c.startsWith(linePartial))
      : all,
    linePartial,
  ];
};

const debug = (
  runner: TestCaseRunner,
  steps: ContextStep[],
  step: Step,
  def: StepDefinition,
  hp: HookParams | undefined,
  result: Result,
): Promise<Result> => new Promise((resolve) => {
  let actualResult = result;

  const rl = readline.createInterface({
    completer: completer(steps),
    input: process.stdin,
    output: process.stdout,
    prompt: 'debug> ',
  });
  rl.on('line', async (rawLine: string) => {
    const line = rawLine.trim();
    if (
      line.startsWith('Given ')
      || line.startsWith('When ')
      || line.startsWith('Then ')
    ) {
      const newStep = { ...step, text: line.replace(/^\S+ /, '') };
      const [newDef] = runner.getStepDefinitions(newStep);
      if (!newDef) {
        console.log('< ERROR: Unknown step!');
      } else {
        const r = await runAndPrintError(runner, steps, newStep, newDef, hp);
        if (r.status === 'passed') {
          console.log('< OK');
        }
      }
      rl.prompt();
      return;
    }

    if (line.startsWith('dump')) {
      const value = line === 'dump'
        ? getCtx()
        : getCtxItem(line.replace('dump', '').trim());
      console.log(JSON.stringify(value, null, 2));
      rl.prompt();
      return;
    }
    switch (line) {
      case 'exit':
        rl.close();
        return;
      case 'help':
        console.log(HELP);
        break;
      case 'r':
      case 'retry':
        const r = await runAndPrintError(runner, steps, step, def, hp);
        if (r.status !== 'failed') {
          actualResult = r;
          rl.close();
          return;
        }
        break;
      case 'steps':
        console.log(printSteps(steps));
        break;
      default:
        console.log('< ERROR: Unknown command or step. Type `help` for help');
        break;
    }
    rl.prompt();
  }).on('close', () => {
    resolve(actualResult);
  });
  console.log(BAR);
  console.log('> Press CTRL+D to exit debugger (or "help" for more options)');
  rl.prompt();
});

export default (steps: ContextStep[]) => {
  TestCaseRunner.prototype.invokeStep = async function debugInvokeStep(
    step,
    def,
    hp,
  ) {
    // tslint:disable-next-line:no-invalid-this
    const r = await runAndPrintError(this, steps, step, def, hp);
    if (r.status !== 'failed') {
      return r;
    }

    // Rather than failing, break into debugging...
    // tslint:disable-next-line:no-invalid-this
    return await debug(this, steps, step, def, hp, r);
  };
};
