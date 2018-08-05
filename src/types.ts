import { OperatorMap } from './operators/types';

export interface Context {
  [key: string]: any;
}

export interface Aliases {
  [name: string]: RegExp;
}

export interface Options {
  aliases?: Aliases;
  operators?: OperatorMap;
}
