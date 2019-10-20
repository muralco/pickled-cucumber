import opContains from './contains';
import opDoesNotHaveKeys from './does-not-have-keys';
import opExists from './exists';
import opHasKeys from './has-keys';
import opIncludes from './includes';
import opIs from './is';
import opMatches from './matches';
import opStartsWith from './starts-with';
import { OperatorMap } from './types';

const OPERATORS = [
  opContains,
  opDoesNotHaveKeys,
  opExists,
  opHasKeys,
  opIncludes,
  opIs,
  opMatches,
  opStartsWith,
].reduce(
  (acc, op) => {
    if (typeof op.name === 'string') acc[op.name] = op;
    else op.name.forEach(name => acc[name] = op);
    return acc;
  },
  {} as OperatorMap,
);

export default OPERATORS;

export const opAtSpec = '[\\w.\\[\\]\\$\\{\\}/\\\\-]+';

export const getOpSpec = (ops: OperatorMap = {}): RegExp => {
  const keys = Object.keys({ ...ops, ...OPERATORS })
    .sort()
    .join('|');
  return new RegExp(`${keys}|at ${opAtSpec} (?:${keys})`);
};
