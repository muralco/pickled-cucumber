import { Aliases } from './types';

const aliases: Aliases = {
  boolean: /true|false/,
  int: /\d+/,
  variable: /\w+/,
  variables: /(?:\\w+(?:,\\s+|\\sand\\s)?)+/,
  word: /\S+/,
};

export default aliases;
