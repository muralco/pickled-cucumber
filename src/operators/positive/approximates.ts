import { getString } from '../../util';
import { Operator } from '../types';

// Operator to check approximate numbers
// By default the approximation uses +- 0.001 (DEFAULT_ERROR_MARGIN)

// We use ERROR_EPSILON to give an extra tiny rounding leeway to fix floating
// point errors for big numbers "on the fence", up to 8 significant digits.
// For example:
//
// Checking 1234567.9999 vs (1234568 +- 0.0001) should match, but in reality...
//
//                 uh-oh, it's a tiny bit over 0.0001 due
//                    to floating point precision errors!
//                                                       \
//                 (1234568 - 1234567.9999) = 0.000100000062957406044006347656
//                            ERROR_EPSILON = 0.0000000002
// (1234568 - 1234567.9999) - ERROR_EPSILON = 0.000099999862957406043567805398
//                                                  \
//                                                   OK! still under the margin
//
// By slightly *contracting the difference* to account for added precision
// error, comparison against the exact error margin won't trigger a false fail.
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
    //  | number "±" positive-number
    const match = expected
      .trim()
      .match(
        /^(-?[0-9^.]+|-?[0-9]*\.[0-9]+) *(?:(?:-\+|\+-|±) *([0-9^.]+|[0-9]*\.[0-9]+))?$/,
      );

    if (!match) {
      return {
        error: `. '${expected}' is not a valid approximation specification. Please use any of the following: <number> or <number> +- <positive-number>`,
        expected,
      };
    }

    const expectedNumber = parseFloat(match[1]);
    const expectedErrorMargin = parseFloat(match[2] ?? DEFAULT_ERROR_MARGIN);

    if (
      Math.abs(expectedNumber - actualNumber) - ERROR_EPSILON >
      expectedErrorMargin
    ) {
      return {
        error: 'is not approximately',
        expected: `${expectedNumber} +- ${expectedErrorMargin}`,
        actual: actualNumber,
      };
    }

    return undefined;
  },
  name: 'approximates',
};

export default op;
