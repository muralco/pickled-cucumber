import { SummaryFormatter, formatterHelpers } from '@cucumber/cucumber';
import { IFormatterOptions } from '@cucumber/cucumber/lib/formatter';
import { ITestCaseAttempt } from '@cucumber/cucumber/lib/formatter/helpers/event_data_collector';
import * as messages from '@cucumber/messages';
import { FirstArg } from './progress-and-profile';

// ts-unused-exports:disable-next-line
export default class GithubFormatter extends SummaryFormatter {
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
    const testCaseAttempt: ITestCaseAttempt = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId,
    );

    const parsed = formatterHelpers.parseTestCaseAttempt({
      cwd: this.cwd,
      snippetBuilder: this.snippetBuilder,
      supportCodeLibrary: this.supportCodeLibrary,
      testCaseAttempt,
    });

    const color = this.colorFns.forStatus(
      parsed.testCase.worstTestStepResult.status,
    );

    if (!testCaseAttempt.gherkinDocument.feature) {
      return;
    }

    const failed = parsed.testCase.worstTestStepResult.status != 'PASSED';

    const testCaseTitle = color(
      testCaseAttempt.gherkinDocument.feature.name +
        ' / ' +
        testCaseAttempt.pickle.name,
    );

    if (failed) {
      this.log(`::group::❌ ${testCaseTitle}\n`);
      this.logIssues({ issues: [testCaseAttempt], title: 'Details' });
      this.log('::endgroup::\n');
    } else {
      this.log(`✅ ${testCaseTitle}\n`);
    }
  }

  logIssues(args: FirstArg<SummaryFormatter['logIssues']>): void {
    if (
      process.env.PICKLED_NO_WARN &&
      args.title &&
      args.title.includes('Warning')
    ) {
      return;
    }
    return super.logIssues(args);
  }
}
