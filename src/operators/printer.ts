import * as assert from 'assert';
import BUILT_INS from './index';
import { CompareError, OperatorMap } from './types';

export default (ops: OperatorMap): string => {
  const all = { ...BUILT_INS, ...ops };
  const items = Object.keys(all)
    .sort()
    .map((k) => {
      const op = all[k];
      return op.arity === 'unary'
        ? { prefix: `a ${k} any:`, suffix: op.description }
        : { prefix: `a ${k} b:`, suffix: op.description };
    });

  const maxPrefixLen = items
    .map((i) => i.prefix.length)
    .reduce((a, b) => Math.max(a, b), 0);

  return items
    .map((i) => `${i.prefix.padEnd(maxPrefixLen)} ${i.suffix}\n`)
    .join('');
};

const prettyJson = (o: unknown, p = '', i = 0) => {
  try {
    return `${JSON.stringify(o, undefined, i)}`.replace(/\n/g, `\n${p}`);
  } catch (e) {
    return `Can't convert object to string`;
  }
};

const assertValue = (v: unknown) =>
  v === undefined ? 'undefined' : prettyJson(v);

const printValue = (o: unknown) =>
  typeof o === 'object' ? prettyJson(o) : `${o}`;

export const printError = ({
  actual,
  assertEquals,
  error,
  expected,
  full,
  path,
  subError,
  unary,
}: CompareError): string => {
  const errorPath = subError ? subError.path : path;
  const at = errorPath ? ` (at ${errorPath})` : '';

  const actualValue = subError ? subError.actual : actual;
  const expectedValue = subError ? subError.expected : expected;
  const padd = '    ';
  const indent = 2;

  const fullActual = full || (subError && actual);

  const errorMessage = subError ? 'is not' : error;

  const message = `
  Error${at}:
    ${prettyJson(actualValue)} ${errorMessage}${
    !unary ? ` ${printValue(expectedValue)}` : ''
  }
  \n\n
  Actual${at}:
    ${prettyJson(actualValue, padd, indent)}
  Expected:
    ${prettyJson(expectedValue, padd, indent)}

  ${
    fullActual
      ? `
  Full actual object:
    ${prettyJson(fullActual, padd, indent)}
  `
      : ''
  }
  `;

  if (assertEquals) {
    assert.equal(assertValue(actualValue), assertValue(expectedValue), message);
  }
  assert.fail(message);
};
