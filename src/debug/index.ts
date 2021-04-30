// This file is all about monkey patching CucumberJS to add pseudo-debugging
// capabilities.
import { Status } from '@cucumber/cucumber';
import getColorFns from '@cucumber/cucumber/lib/formatter/get_color_fns';
import {
  getGherkinStepMap,
} from '@cucumber/cucumber/lib/formatter/helpers/gherkin_document_parser';
import { IDefinition } from '@cucumber/cucumber/lib/models/definition';
import  PickleRunner from '@cucumber/cucumber/lib/runtime/pickle_runner';
import { messages } from '@cucumber/messages';
import * as readline from 'readline';
import { getCtx, getCtxItem } from '../context';
import printSteps from '../steps/printer';
import { Step as ContextStep } from '../steps/types';

const oldRs = PickleRunner.prototype.invokeStep;

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

interface StepData {
  uri?: string | null;
  line?: number | null;
  text?: string | null;
}

// Gets the uri and line of the file under test
const extractStepData = (
  runner: PickleRunner,
  step: messages.Pickle.IPickleStep,
): StepData => {
  // All the contorsion below is to be able to access the private gherkin doc
  const document = (
    runner as any
  ).gherkinDocument as messages.IGherkinDocument;
  const rawStep = getGherkinStepMap(document)[step.astNodeIds![0]];
  return {
    line: rawStep.location?.line,
    text: `${rawStep.keyword} ${step.text}`,
    uri: document.uri,
  };
};

const printLines = (...lines: string[]) => console.log(lines.join('\n'));

// Get coloring functions
const colorFns = getColorFns(true);

const runAndPrintError = async (
  runner: PickleRunner,
  step: messages.Pickle.IPickleStep,
  def: IDefinition,
  hookParam?: any,
) => {
  const result = await oldRs.call(runner, step, def, hookParam);
  if (result.status === Status.FAILED) {
    const error = colorFns.forStatus(result.status);
    const { line, text, uri } = extractStepData(runner, step);
    printLines(
      '',
      `> ${text} (${uri}:${line})`,
      error('< ERROR:'),
      error(result.message!),
    );
  }
  return result;
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
  runner: PickleRunner,
  steps: ContextStep[],
  step: messages.Pickle.IPickleStep,
  def: IDefinition,
  hp: any | undefined,
  result: messages.TestStepFinished.ITestStepResult,
): Promise<messages.TestStepFinished.ITestStepResult> => new Promise((resolve) => {
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
        const r = await runAndPrintError(runner, newStep, newDef, hp);
        if (r.status === Status.PASSED) {
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
        const r = await runAndPrintError(runner, step, def, hp);
        if (r.status !== Status.FAILED) {
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
  PickleRunner.prototype.invokeStep = async function debugInvokeStep(
    step,
    def,
    hp,
  ) {
    // tslint:disable-next-line:no-invalid-this
    const r = await runAndPrintError(this, step, def, hp);
    if (r.status !== Status.FAILED) {
      return r;
    }

    // Rather than failing, break into debugging...
    // tslint:disable-next-line:no-invalid-this
    return await debug(this, steps, step, def, hp, r);
  };
};
