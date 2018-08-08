import { Aliases } from '../types';

const aliases: Aliases = {
  any: /.*/,
  boolean: /true|false/,
  int: /\d+/,
  variable: /\w+/,
  variables: /\w+(?:,\s*\w+|\s+and\s+\w+)*/,
  word: /\S+/,
};

export const getVariables = (s: string) => s.split(/,\s*|\s+and\s+/);

export default aliases;
