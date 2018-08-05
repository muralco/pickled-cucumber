import { Context } from './types';

let ctx: Context = {};

export const resetCtx = () => ctx = {};

export const getCtx = () => ctx;

export const getCtxItem = <T>(key: string): T => ctx[key] as T;

export const setCtxItem = <T>(key: string, value: T) => { ctx[key] = value; };
