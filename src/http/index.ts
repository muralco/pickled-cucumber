import * as assert from 'assert';
import { STATUS_CODES } from 'http';
import { URL } from 'url';
import { SetupFnArgs } from '../types';
import { getDeep } from '../util';
import { Headers, HttpFn, Method, Request, Response } from './types';

const setup = (
  httpFn: HttpFn,
  { compare, getCtx, Given, setCtx, Then, When }: SetupFnArgs,
) => {
  const getHeaders = () => getCtx<Headers>('$req-headers');
  const getResponse = () => getCtx<Response>('$res');
  const getResponseBody = (raw: boolean) =>
    raw
      ? getResponse().text
      : JSON.parse(getResponse().text || '{}');

  Given(
    'the request header {word} is "{any}"',
    (name, value) => {
      const headers = getHeaders() || {};
      headers[name] = value;
      setCtx('$req-headers', headers);
    },
  );

  When(
    '(GET|POST|PUT|PATCH|DELETE) {word}(?: as {variable})?',
    async (method, path, varName, payload) => {
      const credentials = varName && getCtx(varName);

      const req: Request = {
        body: payload ? JSON.parse(payload) : undefined,
        credentials,
        headers: getHeaders(),
        method: method as Method,
        path,
      };

      const res = await httpFn(req);

      setCtx('$req', req);
      setCtx('$res', res);
    },
    { optional: 'with payload' },
  );

  const withStatusCode = (status: number) =>
    `${status} (${STATUS_CODES[status] || 'Unknown'})`;

  const assertStatus = (status: number) => {
    const res = getResponse();
    assert.equal(
      withStatusCode(res.status),
      withStatusCode(Number(status)),
      `
      Unexpected API response:
      ${res.status}
      ${res.text}
      `,
    );
  };
  const assertPayload = (raw: boolean, op: string, payload: string) => compare(
    op,
    getResponseBody(raw),
    payload,
  );

  Then(
    'the response is {int}',
    status => assertStatus(Number(status)),
  );
  Then(
    'the( raw)? response payload {op}',
    (raw, op, payload) => assertPayload(!!raw, op, payload),
    { inline: true },
  );
  Then(
    'the response text {op}',
    (op, payload) => compare(
      op,
      getResponse().text,
      payload,
    ),
    { inline: true },
  );
  Then(
    'the response headers {op}',
    (op, payload) => compare(
      op,
      getResponse().headers,
      payload,
    ),
    { inline: true },
  );
  Then(
    'the response is {int} and the( raw)? payload {op}',
    (status, raw, op, payload) => {
      assertStatus(Number(status));
      assertPayload(!!raw, op, payload);
    },
    { inline: true },
  );
  Then(
    'store the( raw)? response payload in {variable}',
    (raw, id) => setCtx(
      id,
      getResponseBody(!!raw),
    ),
  );
  Then(
    'store the response payload at ([\\w_.-]+) in {variable}',
    (path, id) => setCtx(id, getDeep(getResponseBody(false), path)),
  );
  Then(
    'extract the response location query string argument (.+) into {variable}',
    (arg, id) => setCtx(
      id,
      new URL(getResponse().headers.location).searchParams.get(arg),
    ),
  );

};

export default setup;
