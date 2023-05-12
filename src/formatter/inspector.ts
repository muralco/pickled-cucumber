import { Formatter, IFormatterOptions } from '@cucumber/cucumber';
import * as messages from '@cucumber/messages';
import { getCtxItem } from '../context';
import microdiff from 'microdiff';

const testCaseContext: any = {};

const getDiffCtx = () => ({
  initialFive: getCtxItem('initialFive'),
});

// ts-unused-exports:disable-next-line
export default class InspectorFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options);
    options.eventBroadcaster;

    options.eventBroadcaster.on('envelope', (message: messages.Envelope) => {
      const {
        testStepStarted,
        testStepFinished,
        testCaseStarted,
        testCaseFinished,
      } = message;
      // export declare class TestStepFinished {
      //     testCaseStartedId: string;
      //     testStepId: string;
      //     testStepResult: TestStepResult;
      //     timestamp: Timestamp;
      // }
      if (testCaseStarted) {
        const { id: caseId } = testCaseStarted;
        testCaseContext[caseId] = {};
      }

      if (testStepStarted) {
        const {
          testCaseStartedId: caseId,
          testStepId: stepId,
        } = testStepStarted;
        testCaseContext[caseId][stepId] = getDiffCtx();
      }

      if (testStepFinished) {
        const {
          testCaseStartedId: caseId,
          testStepId: stepId,
        } = testStepFinished;

        // compute the diff
        const diff = microdiff(testCaseContext[caseId][stepId], getDiffCtx());

        if (diff.length) {
          this.log(
            JSON.stringify({
              testCaseStartedId: caseId,
              testStepStartedId: stepId,
              diff,
            }) + '\n',
          );
        }
      }

      if (testCaseFinished) {
        delete testCaseContext[testCaseFinished.testCaseStartedId];
      }
    });
  }
}
