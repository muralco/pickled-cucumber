export type IdOrObject<T, Tid extends keyof T> = T | T[Tid];

export interface Entity<T, Tid extends keyof T> {
  create: (attrs?: T) => Promise<T>;
  delete: (idOrObject: IdOrObject<T, Tid>) => Promise<void>;
  // eslint-disable-next-line
  find: (criteria: object) => Promise<T[]>;
  // eslint-disable-next-line
  findBy: (criteria: object) => Promise<T | undefined | null>;
  findById: (idOrObject: IdOrObject<T, Tid>) => Promise<T | undefined | null>;
  update: (idOrObject: IdOrObject<T, Tid>, attrs: Partial<T>) => Promise<T>;
}

export interface EntityMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: Entity<any, any>;
}

export interface EntityOptions<T, Tid extends keyof T> {
  onCreate?: (attrs: Partial<T> | undefined) => T | Promise<T>;
  onUpdate?: (
    attrs: Partial<T> | undefined,
    id: T[Tid],
    entity: Entity<T, Tid>,
  ) => Partial<T> | Promise<Partial<T>>;
}
