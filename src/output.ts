import {
  After,
  AfterStep,
  Before,
  BeforeStep,
  Status,
} from '@cucumber/cucumber';
import {
  AfterInitialContext,
  AfterTeardown,
  BeforeInitialContext,
  BeforeTeardown,
} from './hooks';

const NO_OUTPUT = '<Nothing was captured>';

interface Writable {
  write: (a: string) => void;
}

interface Interceptor {
  capturedData: string[];
  restore: () => void;
  intercept: () => void;
  flush: () => void;
}

class StdioInterceptor implements Interceptor {
  public capturedData: string[] = [];
  private readonly originalWrite: (a: string) => void;

  constructor(
    public readonly target: Writable,
    public readonly capture?: boolean,
    public readonly suppress?: boolean,
  ) {
    this.originalWrite = target.write;
  }

  flush() {
    this.capturedData = [];
  }
  intercept() {
    this.target.write = (a: string) => {
      if (this.capture) {
        this.capturedData.push(a);
      }
      if (!this.suppress) {
        this.originalWrite.call(this.target, a);
      }
    };
  }
  restore() {
    this.target.write = this.originalWrite;
  }
}

export const setupOutputCapture = (capture?: boolean, suppress?: boolean) => {
  const stdOutInterceptor = new StdioInterceptor(
    process.stdout,
    capture,
    suppress,
  );
  const stdErrInterceptor = new StdioInterceptor(
    process.stderr,
    capture,
    suppress,
  );

  const restore = () => {
    stdOutInterceptor.restore();
    stdErrInterceptor.restore();
  };

  const flush = () => {
    stdOutInterceptor.flush();
    stdErrInterceptor.flush();
  };

  const interceptOutput = () => {
    stdOutInterceptor.intercept();
    stdErrInterceptor.intercept();
  };

  Before(flush);

  BeforeInitialContext(interceptOutput);
  BeforeTeardown(interceptOutput);
  BeforeStep(interceptOutput);

  AfterInitialContext(restore);
  AfterTeardown(restore);
  AfterStep(restore);

  After(({ result }) => {
    if (capture && result && result.status === Status.FAILED) {
      result.message += [
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

  });

};
