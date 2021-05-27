import { IdOrObject } from './types';

const isId = <T, Tid extends keyof T>(
  idOrObject: IdOrObject<T, Tid>,
): idOrObject is T[Tid] => typeof idOrObject !== 'object';

export const getId = <T, Tid extends keyof T>(
  idProperty: Tid,
  idOrObject: IdOrObject<T, Tid>,
): T[Tid] => (isId(idOrObject) ? idOrObject : idOrObject[idProperty]);
