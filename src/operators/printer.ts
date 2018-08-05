import BUILT_INS from './index';
import { OperatorMap } from './types';

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
