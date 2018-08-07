import { Aliases } from '../types';
import BUILT_IN from './index';

export default (aliases: Aliases): string => {
  const all = { ...BUILT_IN, ...aliases };

  const items = Object
    .keys(all)
    .sort()
    .map(k => ({ expr: all[k].source, key: `{${k}}:` }));

  const maxKeyLen = items
    .map(i => i.key.length)
    .reduce((a, b) => Math.max(a, b), 0);

  return items
    .map(i => `${i.key.padEnd(maxKeyLen)} ${i.expr}\n`)
    .join('');
};
