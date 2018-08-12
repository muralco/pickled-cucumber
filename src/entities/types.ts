export type IdOrObject<T, Tid extends keyof T> = T|T[Tid];

export interface Entity<T, Tid extends keyof T> {
  create: (attrs?: T) => Promise<T>;
  delete: (idOrObject: IdOrObject<T, Tid>) => Promise<void>;
  findBy: (criteria: object) => Promise<T|undefined|null>;
  findById: (idOrObject: IdOrObject<T, Tid>) => Promise<T|undefined|null>;
  update: (idOrObject: IdOrObject<T, Tid>, attrs: Partial<T>) => Promise<T>;
}

export interface EntityMap {
  [name: string]: Entity<any, string|number>;
}

export interface EntityOptions<T, Tid extends keyof T> {
  onCreate?: (
    attrs: Partial<T> | undefined,
  ) => T|Promise<T>;
  onUpdate?: (
    attrs: Partial<T> | undefined,
    id: T[Tid],
    entity: Entity<T, Tid>,
  ) => Partial<T>|Promise<Partial<T>>;
}
