import * as assert from 'assert';
import { SetupFnArgs } from '../types';
import { EntityMap } from './types';

const setup = (
  entities: EntityMap,
  { compare, getCtx, Given, onTearDown, setCtx, Then }: SetupFnArgs,
) => {
  const entityNames = Object.keys(entities);
  if (!entityNames.length) return;
  const entitySpec = `(${entityNames.join('|')})`;

  Given(
    `an? ${entitySpec}(?: {variable})?`,
    async (entity, varName, payload) => {
      const record = await entities[entity].create(
        payload && JSON.parse(payload),
      );
      setCtx(varName, record);
      onTearDown(() => entities[entity].delete(record));
    },
    { optional: 'with' },
  );
  Given(
    `${entitySpec} {variable} also has`,
    async (entity, varName, payload) => {
      const record = getCtx(varName);
      const changes = JSON.parse(payload);
      await entities[entity].update(record, changes);
      setCtx(varName, (await entities[entity].findBy(record))[0]);
    },
    { inline: true },
  );

  Then(
    `the document for (${entitySpec}) {variable} {op}`,
    async (entity, id, op, payload) => {
      const doc = (await entities[entity].findBy(getCtx(id)))[0];
      compare(op, doc, payload);
      setCtx('$last-doc', doc);
    },
    { inline: true },
  );
  Then(
    `the document for the (${entitySpec}) with (\\{.*\\}) {op}`,
    async (entity, query, op, payload) => {
      const doc = (await entities[entity].findBy(JSON.parse(query)))[0];
      compare(op, doc, payload);
      setCtx('$last-doc', doc);
    },
    { inline: true },
  );
  Then(
    'that document {op}',
    (op, payload) => compare(op, getCtx('$last-doc'), payload),
    { inline: true },
  );
  Then(
    `the (${entitySpec}) {variable} was deleted`,
    async (entity, id) => assert.equal(
      (await entities[entity].findBy(getCtx(id)))[0],
      null,
    ),
  );
};

export default setup;
