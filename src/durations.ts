import { IParsedTestCaseAttempt } from '@cucumber/cucumber/lib/formatter/helpers/test_case_attempt_parser';

interface Duration {
  seconds: number;
  nanos: number;
}

/**
 *  Formats a duration to a humane representation inside the order of magnitude
 *
 *  The optional parameter precision defines how many significan digits are shown
 */
export const humanizeDuration = (
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
export const scenarioDuration = (parsed: IParsedTestCaseAttempt): Duration =>
  parsed.testSteps
    .map(({ result }) => result.duration)
    .reduce(addDurations, { nanos: 0, seconds: 0 });

/**
 * Compute the whole scenario duration
 */
export const scenarioDurationMs = (parsed: IParsedTestCaseAttempt): number =>
  parsed.testSteps
    .map(
      ({
        result: {
          duration: { nanos, seconds },
        },
      }) => (nanos + seconds * 1e9) / 1e6,
    )
    .reduce((a, b) => a + b, 0);
