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
  method: 'DELETE' | 'GET' | 'POST' | 'PUT',
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
  indexMapping: { properties: Record<string, unknown> },
  idProperty: Tid,
  opts: Options<T, Tid> = {},
): Entity<T, Tid> => {
  let indexExists = false;

  const ensureIndex = async () => {
    await request('GET', indexUri).catch(async () => {
      await request('PUT', `${indexUri}`, {
        mappings: indexMapping,
      });
    });

    indexExists = true;
  };

  // Refresh the index so that all operations performed since the last refresh
  // are available for search.
  // See https://www.elastic.co/guide/en/elasticsearch/reference/6.8/indices-refresh.html
  const refresh = () => request('POST', `${indexUri}/_refresh`);

  // eslint-disable-next-line @typescript-eslint/ban-types
  const search = async (criteria: object) => {
    // We need to call refresh here to account for the "subject under test" code
    // updating the index. When running our test-side queries we want to make
    // sure we are seeing the latest index to prevent race conditions. This can
    // be improved further if we detect that we just refreshed in the previous
    // step but that detection is proving difficult to implement consistently.
    await refresh();
    const docs = await request<QueryResults<T>>(
      'POST',
      `${indexUri}/_search`,
      criteria,
    );
    return docs.hits.hits;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  const searchOne = async (criteria: object) => (await search(criteria))[0];

  const getSource = (doc: Doc<T> | undefined) => doc && doc._source;
  const getSources = (docs: Doc<T>[]) => docs.map((doc) => doc._source);
  const getById = (idOrObject: T | T[Tid]) =>
    searchOne({ query: { term: { _id: `${getId(idProperty, idOrObject)}` } } });

  const getRecordUri = (
    routing: string | undefined,
    record: IdOrObject<T, Tid>,
  ) => {
    const uri = routing ? `${indexUri}/${routing}` : indexUri;
    return `${uri}/_doc/${getId(idProperty, record)}`;
  };

  const entity: Entity<T, Tid> = {
    create: async (attrs) => {
      if (!indexExists) {
        await ensureIndex();
      }

      const record = opts.onCreate
        ? await opts.onCreate(attrs)
        : attrs || ({} as T);

      const routing = opts.getRouting && opts.getRouting(record);
      await request('PUT', getRecordUri(routing, record), record);
      await refresh();
      return record;
    },
    delete: async (idOrObject) => {
      const doc = await getById(idOrObject);
      if (!doc) return;
      await request('DELETE', getRecordUri(doc._routing, doc._source));
      await refresh();
    },
    find: async (criteria) => getSources(await search(criteria)),
    findBy: async (criteria) => getSource(await searchOne(criteria)),
    findById: async (idOrObject) => getSource(await getById(idOrObject)),
    update: async (idOrObject, attrs) => {
      const id = getId(idProperty, idOrObject);
      const record = (await entity.findById(idOrObject)) || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recordWithAttrs = { ...record, ...(attrs as any) };

      const recordWithChanges = opts.onUpdate
        ? await opts.onUpdate(recordWithAttrs, id, entity)
        : recordWithAttrs;

      await entity.create(recordWithChanges);
      await refresh();
      return recordWithChanges;
    },
  };

  return entity;
};

export default create;

export const defineElasticSteps = (
  indexUri: string,
  { compare, getCtx, setCtx, Then, When }: SetupFnArgs,
): void => {
  When(
    'searching for',
    async (payload) => {
      await request('POST', `${indexUri}/_refresh`);
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
