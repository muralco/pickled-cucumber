import { Aliases } from '../types';

const aliases: Aliases = {
  any: /.*/,
  boolean: /true|false/,
  int: /\d+/,
  variable: /[\w._-]+/,
  variables: /[\w._-]+(?:,\s*[\w._-]+|\s+and\s+[\w._-]+)*/,
  word: /\S+/,
};

export const getVariables = (s: string): string[] => s.split(/,\s*|\s+and\s+/);

export default aliases;
