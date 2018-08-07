import fetch from 'node-fetch';
import { SetupFnArgs } from '../types';
import { Entity, EntityOptions } from './types';
import { getId } from './util';

interface Doc<T> {
  _index: string;
  _type: string;
  _id: string;
  _version: number;
  _source: T;
}

interface QueryResults<T> {
  hits: {
    hits: Doc<T>[];
  };
}

const request = async <T>(
  method: 'DELETE'|'GET'|'POST'|'PUT',
  path: string,
  body?: any,
  bulletproof = false,
): Promise<T> => {
  const res = await fetch(path, {
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    method,
  });

  if (!bulletproof && !res.ok) {
    throw { status: res.status, error: await res.text() };
  }

  return await res.json();
};

const create = <T, Tid extends keyof T>(
  indexUri: string,
  indexSuffix: string,
  idProperty: Tid,
  opts: EntityOptions<T, Tid> = {},
): Entity<T, Tid> => {
  const entity: Entity<T, Tid> = {
    create: async (attrs) => {
      const record = opts.onCreate
        ? await opts.onCreate(attrs)
        : (attrs || {} as T);

      await request(
        'PUT',
        `${indexUri}${indexSuffix}/${getId(idProperty, record)}`,
        record,
      );

      return record;
    },
    delete: idOrObject =>
      request(
        'DELETE',
        `${indexUri}${indexSuffix}/${getId(idProperty, idOrObject)}`,
      ),
    findBy: async (criteria) => {
      await request('POST', `${indexUri}/_flush`);
      const doc = await request<QueryResults<T>>(
        'POST',
        `${indexUri}${indexSuffix}/_search`,
        criteria,
      );
      return doc.hits.hits.map(h => h._source)[0];
    },
    findById: async (idOrObject) => {
      const doc = await request<Doc<T>>(
        'GET',
        `${indexUri}${indexSuffix}/${getId(idProperty, idOrObject)}`,
      );
      return doc._source;
    },
    update: async (idOrObject, attrs) => {
      const id = getId(idProperty, idOrObject);
      const record = (await entity.findById(idOrObject)) || {};
      const recordWithAttrs = { ...record, ...attrs as any };

      const recordWithChanges = opts.onUpdate
        ? await opts.onUpdate(recordWithAttrs, id, entity)
        : recordWithAttrs;

      await entity.create(recordWithChanges);

      return recordWithChanges;
    },
  };

  return entity;
};

export default create;

export const defineElasticSteps = (
  indexUri: string,
  {
    compare,
    getCtx,
    setCtx,
    Then,
    When,
  }: SetupFnArgs,
) => {
  When(
    'searching for',
    async (payload) => {
      await request('POST', `${indexUri}/_flush`);
      setCtx(
      '$search-results',
      await request('POST', `${indexUri}/_search`, JSON.parse(payload)),
      );
    },
    { inline: true },
  );
  Then(
    'the search results {op}',
    async (op, payload) => compare(op, getCtx('$search-results'), payload),
    { inline: true },
  );
};
