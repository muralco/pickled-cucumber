import { Context } from './types';

let ctx: Context = {};

export const setCtx = (c: Context) => ctx = c;

export const getCtx = () => ctx;

export const getCtxItem = <T>(key: string): T => ctx[key] as T;

export const setCtxItem = <T>(key: string, value: T) => { ctx[key] = value; };
