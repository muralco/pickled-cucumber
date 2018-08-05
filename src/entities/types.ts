export interface Entity<T, TId extends keyof T> {
  create: (attrs?: T) => Promise<T>;
  delete: (idOrObject: T|T[TId]) => Promise<void>;
  findBy: (criteria: any) => Promise<T|undefined|null>;
  findById: (idOrObject: T|T[TId]) => Promise<T|undefined|null>;
  update: (idOrObject: T|T[TId], attrs: Partial<T>) => Promise<T>;
}

export interface EntityMap {
  [name: string]: Entity<any, string|number>;
}
