import fetch from 'node-fetch';
import { SetupFnArgs } from '../types';
import { Entity, EntityOptions, IdOrObject } from './types';
import { getId } from './util';

interface Doc<T> {
  _id: string;
  _index: string;
  _routing?: string;
  _source: T;
  _type: string;
  _version: number;
}

interface QueryResults<T> {
  hits: {
    hits: Doc<T>[];
  };
}

interface Options<T, Tid extends keyof T> extends EntityOptions<T, Tid> {
  getRouting?: (record: T) => string | undefined;
  verbose?: true;
}

const request = async <T>(
  method: 'DELETE'|'GET'|'POST'|'PUT',
  path: string,
  body?: unknown,
): Promise<T> => {
  const res = await fetch(path, {
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    method,
  });

  if (!res.ok) {
    throw {
      body,
      error: await res.text(),
      method,
      path,
      status: res.status,
    };
  }

  return await res.json();
};

const create = <T, Tid extends keyof T>(
  indexUri: string,
  indexSuffix: string,
  idProperty: Tid,
  opts: Options<T, Tid> = {},
): Entity<T, Tid> => {

  const flush = () => request('POST', `${indexUri}/_flush`);

  const search = async (criteria: object) => {
    await flush();
    const docs = await request<QueryResults<T>>(
      'POST',
      `${indexUri}/_search`,
      criteria,
    );
    return docs.hits.hits[0];
  };
  const getSource = (doc: Doc<T> | undefined) => doc && doc._source;
  const getById = (idOrObject: T|T[Tid]) =>
    search({ query: { term: { _id: `${getId(idProperty, idOrObject)}` } } });

  const getRecordUri = (
    routing: string | undefined,
    record: IdOrObject<T, Tid>,
  ) => {
    const uri = routing
      ? `${indexUri}/${routing}${indexSuffix}`
      : `${indexUri}${indexSuffix}`;
    return `${uri}/${getId(idProperty, record)}`;
  };

  const entity: Entity<T, Tid> = {
    create: async (attrs) => {
      const record = opts.onCreate
        ? await opts.onCreate(attrs)
        : (attrs || {} as T);

      const routing = opts.getRouting && opts.getRouting(record);
      await request('PUT', getRecordUri(routing, record), record);
      await flush();
      return record;
    },
    delete: async (idOrObject) => {
      const doc = await getById(idOrObject);
      if (!doc) return;
      await request(
        'DELETE',
        getRecordUri(doc._routing, doc._source),
      );
      await flush();
    },
    findBy: async criteria =>
      getSource(await search(criteria)),
    findById: async idOrObject =>
      getSource(await getById(idOrObject)),
    update: async (idOrObject, attrs) => {
      const id = getId(idProperty, idOrObject);
      const record = (await entity.findById(idOrObject)) || {};
      const recordWithAttrs = { ...record, ...attrs as any };

      const recordWithChanges = opts.onUpdate
        ? await opts.onUpdate(recordWithAttrs, id, entity)
        : recordWithAttrs;

      await entity.create(recordWithChanges);
      await flush();
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
