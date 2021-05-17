import { AfterStep, Before, BeforeStep, Status } from '@cucumber/cucumber';
import {
  ITestStepHookParameter,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';

const NO_OUTPUT = '<Nothing was captured>';

interface Writable {
  write: (a: string) => void;
}

interface Interceptor {
  capturedData: string[];
  restore: () => void;
  intercept: () => void;
}

const intercept = (
  target: Writable,
  capture?: boolean,
  suppress?: boolean,
): Interceptor => {
  const capturedData: string[] = [];
  const originalWrite = target.write;
  return {
    capturedData,
    intercept: () => {
      target.write = (a: string) => {
        if (capture) {
          capturedData.push(a);
        }
        if (!suppress) {
          originalWrite.call(target, a);
        }
      };
    },
    restore: () => {
      target.write = originalWrite;
    },
  };
};

export const setupOutputCapture = (capture?: boolean, suppress?: boolean) => {
  let stdOutInterceptor: Interceptor;
  let stdErrInterceptor: Interceptor;

  Before(() => {
    stdOutInterceptor = intercept(process.stdout, capture, suppress);
    stdErrInterceptor = intercept(process.stderr, capture, suppress);
  });

  BeforeStep(() => {
    stdOutInterceptor.intercept();
    stdErrInterceptor.intercept();
  });

  AfterStep((arg: ITestStepHookParameter) => {
    if (capture && arg.result.status === Status.FAILED) {
      arg.result.message += [
        '',
        '',
        'Captured Output',
        '===============',
        'Std Err',
        '-------',
        stdErrInterceptor.capturedData.join('') || NO_OUTPUT,
        '',
        'Std Out',
        '-------',
        stdOutInterceptor.capturedData.join('') || NO_OUTPUT,
      ].join('\n');
    }
    stdOutInterceptor.restore();
    stdErrInterceptor.restore();
  });
};
