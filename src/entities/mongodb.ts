import { Entity, EntityOptions } from './types';
import { getId } from './util';

type Criteria<T extends Record<string, unknown>, Tid extends keyof T> =
  | { [id: string]: T[Tid] }
  | Partial<T>;

interface Changes<T> {
  $push?: { [k in keyof T]?: T[k][] };
  $set?: Partial<T>;
  $unset?: { [k in keyof T]?: 1 };
}

type Void = Promise<void>;

interface MongoClient {
  collection: <T extends Record<string, unknown>, Tid extends keyof T>(
    s: string,
  ) => Promise<{
    deleteOne: (criteria: Criteria<T, Tid>) => Void;
    insertOne: (o: T) => Void;
    findOne: (criteria: Criteria<T, Tid>) => Promise<T | null>;
    updateOne: (Criteria: Criteria<T, Tid>, changes: Changes<T>) => Void;
  }>;
}

interface Options<T, Tid extends keyof T> extends EntityOptions<T, Tid> {
  onUpdateChanges?: (changes: Changes<T>) => Changes<T>;
}

const create = <T extends Record<string, unknown>, Tid extends keyof T>(
  getDb: () => Promise<MongoClient>,
  collectionName: string,
  idProperty: Tid,
  opts: Options<T, Tid> = {},
): Entity<T, Tid> => {
  const entity: Entity<T, Tid> = {
    create: async (attrs) => {
      const db = await getDb();
      const collection = await db.collection<T, Tid>(collectionName);
      const record = opts.onCreate
        ? await opts.onCreate(attrs)
        : attrs || ({} as T);
      await collection.insertOne(record);
      return record;
    },
    delete: async (idOrObject) => {
      const db = await getDb();
      const collection = await db.collection<T, Tid>(collectionName);
      return collection.deleteOne({
        [idProperty]: getId<T, Tid>(idProperty, idOrObject),
      });
    },
    findBy: async (criteria) => {
      if (!criteria) {
        throw new Error('MongoEntity::findBy: criteria must be an object');
      }
      const db = await getDb();
      const collection = await db.collection<T, Tid>(collectionName);
      return collection.findOne(criteria);
    },
    findById: (idOrObject) =>
      entity.findBy({
        [idProperty]: getId(idProperty, idOrObject),
      }),
    update: async (idOrObject, attrs) => {
      const db = await getDb();
      const collection = await db.collection(collectionName);
      const id = getId(idProperty, idOrObject);

      const record = opts.onUpdate
        ? await opts.onUpdate(attrs, id, entity)
        : attrs;

      const recordChanges = { $set: record };

      const changes = opts.onUpdateChanges
        ? opts.onUpdateChanges(recordChanges)
        : recordChanges;

      const criteria = { [idProperty]: id };

      await collection.updateOne(criteria, changes);

      return (await entity.findBy(criteria)) as T;
    },
  };

  return entity;
};

export default create;
