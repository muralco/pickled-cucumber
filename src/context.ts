import { Context } from './types';
import { getDeep } from './util';

let ctx: Context = {};

export const setCtx = (c: Context): void => (ctx = c);

export const getCtx = (): Context => ctx;

export const getCtxItem = <T>(key: string): T => getDeep(ctx, key) as T;

export const setCtxItem = <T>(key: string, value: T): void => {
  ctx[key] = value;
};

export const pushCtxItem = <T>(key: string, value: T): void => {
  const items = getCtxItem<T[]>(key) || [];
  items.push(value);
  setCtxItem(key, items);
};
