const isId = <T extends {}, Tid extends keyof T>(
  idOrObject: T|T[Tid],
): idOrObject is T[Tid] => typeof idOrObject !== 'object';

export const getId = <T extends {}, Tid extends keyof T>(
  idProperty: Tid,
  idOrObject: T|T[Tid],
): T[Tid] => isId<T, Tid>(idOrObject)
  ? idOrObject
  : idOrObject[idProperty];
