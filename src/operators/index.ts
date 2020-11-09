import opDoesNotContain from './negative/does-not-contain';
import opDoesNotExist from './negative/does-not-exist';
import opDoesNotHaveKeys from './negative/does-not-have-keys';
import opDoesNotMatch from './negative/does-not-match';
import opIsNot from './negative/is-not';
import opContains from './positive/contains';
import opExists from './positive/exists';
import opHasKeys from './positive/has-keys';
import opIncludes from './positive/includes';
import opIs from './positive/is';
import opMatches from './positive/matches';
import opStartsWith from './positive/starts-with';
import { OperatorMap } from './types';

const OPERATORS = [
  opContains,
  opDoesNotContain,
  opDoesNotExist,
  opDoesNotHaveKeys,
  opDoesNotMatch,
  opExists,
  opHasKeys,
  opIncludes,
  opIs,
  opIsNot,
  opMatches,
  opStartsWith,
].reduce<OperatorMap>(
  (acc, op) => {
    if (typeof op.name === 'string') acc[op.name] = op;
    else op.name.forEach(name => acc[name] = op);
    return acc;
  },
  {},
);

export default OPERATORS;

export const opAtSpec = '[\\w.\\[\\]\\$\\{\\}/\\\\"-]+';

export const getOpSpec = (ops: OperatorMap = {}): RegExp => {
  const keys = Object.keys({ ...ops, ...OPERATORS })
    .sort()
    .join('|');
  return new RegExp(`${keys}|at ${opAtSpec} (?:${keys})`);
};
