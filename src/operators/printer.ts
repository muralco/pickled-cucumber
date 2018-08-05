import * as assert from 'assert';
import BUILT_INS from './index';
import { CompareError, OperatorMap } from './types';

export default (ops: OperatorMap) => {
  const all = { ...BUILT_INS, ...ops };
  const items = Object
    .keys(all)
    .sort()
    .map((k) => {
      const op = all[k];
      return op.arity === 'unary'
        ? { prefix: `a ${k} any:`, suffix: op.description }
        : { prefix: `a ${k} b:`, suffix: op.description };
    });

  const maxPrefixLen = items
    .map(i => i.prefix.length)
    .reduce((a, b) => Math.max(a, b), 0);

  return items
    .map(i => `${i.prefix.padEnd(maxPrefixLen)} ${i.suffix}\n`)
    .join('');
};

const prettyJson = (o: any) => JSON.stringify(o, undefined, 2);

export const printError = (error: CompareError) => {
  const path = error.subError ? error.subError.path : error.path;
  const at = path
    ? ` (at ${path})`
    : '';

  assert.fail(`
  Error${at}:
    ${prettyJson(error.actual)} ${error.error} ${error.expected}
  \n\n
  Actual${at}:
    ${prettyJson(error.subError && error.subError.actual || error.actual)}
  Expected:
    ${prettyJson(error.expected)}

  ${error.full
    ? `
  Full actual object:
    ${prettyJson(error.full)}
  `
    : ''
  }
  `,
  );
};
