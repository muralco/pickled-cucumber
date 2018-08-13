import fetch from 'node-fetch';
import { mapRequest } from './common';
import { Headers, HttpFn, Options, Response } from './types';

type FetchFn = typeof fetch;

const wrap = (
  fetchFn: FetchFn,
  opts: Options = {},
): HttpFn => async (originalReq) => {
  const req = await mapRequest(originalReq, opts);

  const fetchRes = await fetchFn(req.path, {
    body: req.body
      ? JSON.stringify(req.body)
      : undefined,
    headers: req.headers,
    method: req.method,
  });

  const fetchHeaders = fetchRes.headers.raw();

  const res: Response = {
    headers: Object.keys(fetchHeaders).reduce(
      (acc, k) => {
        acc[k] = fetchHeaders[k] && fetchHeaders[k][0];
        return acc;
      },
      {} as Headers,
    ),
    status: fetchRes.status,
    text: await fetchRes.text(),
  };

  return res;
};

export default wrap;
