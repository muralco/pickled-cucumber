import { Entity } from './types';

type Criteria<T, Tid extends keyof T> =
  | { [id: string]: T[Tid] }
  | Partial<T>
  ;

type Update<T> =
  | { $set: Partial<T> }
  ;

interface MongoClient {
  collection: <T, Tid extends keyof T>(s: string) => Promise<{
    deleteOne: (criteria: Criteria<T, Tid>) => Promise<void>;
    insertOne: (o: T) => Promise<void>;
    findOne: (criteria: Criteria<T, Tid>) => Promise<T|null>;
    updateOne: (Criteria: Criteria<T, Tid>, delta: Update<T>) => Promise<void>;
  }>;
}

interface MongoEntityOptions<T, Tid extends keyof T> {
  onCreate?: (
    attrs: Partial<T> | undefined,
  ) => T|Promise<T>;
  onUpdate?: (
    attrs: Partial<T> | undefined,
    id: T[Tid],
    entity: Entity<T, Tid>,
  ) => Partial<T>|Promise<Partial<T>>;
}

const isId = <T extends {}, Tid extends keyof T>(
  idOrObject: T|T[Tid],
): idOrObject is T[Tid] => typeof idOrObject !== 'object';

const getId = <T extends {}, Tid extends keyof T>(
  idProperty: Tid,
  idOrObject: T|T[Tid],
): T[Tid] => isId<T, Tid>(idOrObject)
  ? idOrObject
  : idOrObject[idProperty];

const create = <T, Tid extends keyof T>(
  getDb: () => Promise<MongoClient>,
  collectionName: string,
  idProperty: Tid,
  opts: MongoEntityOptions<T, Tid> = {},
): Entity<T, Tid> => {
  const entity: Entity<T, Tid> = {
    create: async (attrs) => {
      const db = await getDb();
      const collection = await db.collection<T, Tid>(collectionName);
      const record = opts.onCreate
        ? await opts.onCreate(attrs)
        : (attrs || {} as T);
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
    findById: idOrObject => entity.findBy({
      [idProperty]: getId(idProperty, idOrObject),
    }),
    update: async (idOrObject, attrs) => {
      const db = await getDb();
      const collection = await db.collection(collectionName);
      const id = getId(idProperty, idOrObject);
      const record = opts.onUpdate
        ? await opts.onUpdate(attrs, id, entity)
        : attrs;

      const criteria = { [idProperty]: id };

      await collection.updateOne(criteria, { $set: record });

      return (await entity.findBy(criteria)) as T;
    },
  };

  return entity;
};

export default create;
