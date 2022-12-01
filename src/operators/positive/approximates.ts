import { getString } from '../../util';
import { Operator } from '../types';

// Operator to check approximate numbers
// By default the approximation uses +- 0.001 (DEFAULT_ERROR_MARGIN)

// We use ERROR_EPSILON to give an extra tiny rounding leeway to fix
// floating-point errors for big numbers "on the fence", up to 8 significant
// digits. For example:
//                                               v--- uh-oh
// (12345679 - 12345678.9999).toFixed(60) = 0.000099999830126762390136718...
//                        + ERROR_EPSILON = 0.0000000002
//                                        = 0.000100000030126762390575261...
//                                               ^--- ok!
// This avoids triggering a false failure on edge cases.
const ERROR_EPSILON = 0.0000000002;

const DEFAULT_ERROR_MARGIN = '0.001';

const op: Operator = {
  arity: 'binary',
  description: `checks that the number 'a' approximates number 'b'`,
  exec: (actual, expected) => {
    const actualNumber = parseFloat(getString(actual));
    if (Number.isNaN(actualNumber))
      return { error: "is not a number and can't approximate", expected };

    // expected :=
    //  | number
    //  | number "+-" positive-number
    //  | number "-+" positive-number
    const match = expected
      .trim()
      .match(
        /^(-?[0-9^.]+|-?[0-9]*\.[0-9]+) *(?:(?:-\+|\+-) *([0-9^.]+|[0-9]*\.[0-9]+))?$/,
      );

    if (!match)
      return { error: "'expected' in incorrect approximate format", expected };

    const expectedNumber = parseFloat(match[1]);
    const expectedErrorMargin = parseFloat(match[2] ?? DEFAULT_ERROR_MARGIN);

    if (
      Math.abs(expectedNumber - actualNumber) >
      expectedErrorMargin + ERROR_EPSILON
    ) {
      return {
        error: 'is not approximately',
        expected: `${expectedNumber} +- ${expectedErrorMargin}`,
      };
    }

    return undefined;
  },
  name: 'approximates',
};

export default op;
