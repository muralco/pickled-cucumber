import { Context } from './types';
import { getDeep } from './util';

let ctx: Context = {};

export const setCtx = (c: Context) => ctx = c;

export const getCtx = () => ctx;

export const getCtxItem = <T>(key: string): T => getDeep(ctx, key) as T;

export const setCtxItem = <T>(key: string, value: T) => { ctx[key] = value; };

export const pushCtxItem = <T>(key: string, value: T) => {
  const items = getCtxItem<T[]>(key) || [];
  items.push(value);
  setCtxItem(key, items);
};
