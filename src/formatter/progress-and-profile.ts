import { SummaryFormatter, formatterHelpers, Status } from '@cucumber/cucumber';
import { IFormatterOptions } from '@cucumber/cucumber/lib/formatter';
import { IParsedTestCaseAttempt } from '@cucumber/cucumber/lib/formatter/helpers/test_case_attempt_parser';
import { ILineAndUri } from '@cucumber/cucumber/lib/types';
import * as messages from '@cucumber/messages';

interface Duration {
  seconds: number;
  nanos: number;
}

/**
 *  Formats a duration to a humane representation inside the order of magnitude
 *
 *  The optional parameter precision defines how many significan digits are shown
 */
const humanizeDuration = (
  { seconds, nanos }: Duration,
  precision = 3,
): string => {
  const interval = nanos + seconds * 1e9;

  if (interval < 1e3) {
    return `${interval.toPrecision(precision)} ns`;
  }
  if (interval < 1e6) {
    return `${(interval / 1e3).toPrecision(precision)} µs`;
  }
  if (interval < 1e9) {
    return `${(interval / 1e6).toPrecision(precision)} ms`;
  }
  return `${(interval / 1e9).toPrecision(precision)} s`;
};

/**
 * Adds to durations
 *
 * This didn't take into account if the number of nanos already adds to some number of seconds. That behavior is not required for the current application
 */
const addDurations = (a: Duration, b: Duration): Duration => ({
  nanos: a.nanos + b.nanos,
  seconds: a.seconds + b.seconds,
});

/**
 * Compute the full duration of an scenario by adding the duration of each step
 */
const scenarioDuration = (parsed: IParsedTestCaseAttempt): Duration =>
  parsed.testSteps
    .map(({ result }) => result.duration)
    .reduce(addDurations, { nanos: 0, seconds: 0 });

/**
 * Formatter class
 *
 * Cucumber requires it to be the export default
 */

// ts-unused-exports:disable-next-line
export default class ProgressAndProfileFormatter extends SummaryFormatter {
  constructor(options: IFormatterOptions) {
    super(options);
    options.eventBroadcaster.on('envelope', ({ testCaseFinished }) => {
      if (testCaseFinished) {
        this.logTestCaseFinished(testCaseFinished);
      }
    });
  }
  public logTestCaseFinished(
    testCaseFinished: messages.TestStepFinished,
  ): void {
    const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId,
    );
    const {
      gherkinDocument,
      pickle,
      worstTestStepResult: { status },
    } = testCaseAttempt;

    const parsed = formatterHelpers.parseTestCaseAttempt({
      cwd: this.cwd,
      snippetBuilder: this.snippetBuilder,
      supportCodeLibrary: this.supportCodeLibrary,
      testCaseAttempt,
    });
    const formattedLocation = this.formatLocation(
      parsed.testCase.sourceLocation,
    );
    const coloredStatus = this.formatStatus(status);

    const coloredFeature = this.colorFns.tag(
      gherkinDocument.feature?.name ?? '<Empty>',
    );

    const humaneDuration = humanizeDuration(scenarioDuration(parsed));

    this.log(
      `[${coloredStatus}] (${humaneDuration}) ${coloredFeature} ${this.colorFns.location(
        '>',
      )} ${pickle.name} # ${formattedLocation}\n`,
    );
  }

  private formatStatus(status: messages.TestStepResultStatus): string {
    return this.colorFns.forStatus(status)(Status[status]);
  }

  private formatLocation(sourceLocation?: ILineAndUri): string {
    if (!sourceLocation) {
      return '';
    }
    const { line, uri } = sourceLocation;
    return this.colorFns.location(`${uri}:${line}`);
  }
}
