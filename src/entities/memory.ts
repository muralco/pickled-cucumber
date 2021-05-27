import { Entity, IdOrObject } from './types';

const generate = <T, Tid extends keyof T>(
  idField: Tid,
  newId: () => T[Tid],
): Entity<T, Tid> => {
  const entities: T[] = [];

  const isObj = (v: IdOrObject<T, Tid>): v is T => v && idField in v;
  type Entries = [keyof T, T[keyof T]][];

  const entityMethods: Entity<T, Tid> = {
    create: async (record) => {
      const e = { ...(record as T), [idField]: newId() };
      entities.push(e);
      return e;
    },
    delete: async (id) => {
      const entity = await entityMethods.findById(id);
      if (!entity) return;
      entities.splice(entities.findIndex((e) => e === entity, 1));
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
    findBy: async (record: object) => {
      const entries = Object.entries(record) as Entries;
      return entities.find(
        (e) =>
          entries.every((pair) => e[pair[0]] === pair[1]) ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (idField in record && e[idField] === (record as any)[idField]),
      );
    },
    findById: async (record) => {
      const id = isObj(record) ? record[idField] : record;
      return entityMethods.findBy({ [idField]: id });
    },
    update: async (record, update) => {
      const entity = await entityMethods.findById(record);
      return Object.assign(entity, update);
    },
  };

  return entityMethods;
};

export default generate;
