import { SummaryFormatter, formatterHelpers, Status } from '@cucumber/cucumber';
import { IFormatterOptions } from '@cucumber/cucumber/lib/formatter';
import { ILineAndUri } from '@cucumber/cucumber/lib/types';
import * as messages from '@cucumber/messages';
import { humanizeDuration, scenarioDuration } from '../durations';
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
