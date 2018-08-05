export interface Entity<T, TId = string|number> {
  create: (attrs?: T) => Promise<T>;
  delete: (idOrObject: T|TId) => Promise<void>;
  findBy: (criteria: any) => Promise<T[]>;
  update: (idOrObject: T|TId, attrs: Partial<T>) => Promise<void>;
}

export interface EntityMap {
  [name: string]: Entity<any>;
}
