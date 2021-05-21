import { IdOrObject } from './types';

const isId = <T extends Record<string, unknown>, Tid extends keyof T>(
  idOrObject: IdOrObject<T, Tid>,
): idOrObject is T[Tid] => typeof idOrObject !== 'object';

export const getId = <T extends Record<string, unknown>, Tid extends keyof T>(
  idProperty: Tid,
  idOrObject: IdOrObject<T, Tid>,
): T[Tid] => (isId(idOrObject) ? idOrObject : idOrObject[idProperty]);
