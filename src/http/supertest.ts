import { promisify } from 'util';
import { mapRequest } from './common';
import { Headers, HttpFn, Options, Response } from './types';

interface SuperTestResponse {
  headers: Headers;
  on: (e: 'data'|'end', f: (chunk: string) => void) => void;
  setEncoding: (e: 'binary') => void;
  statusCode: number;
  body: string;
}

type ParseFn = (
  res: SuperTestResponse,
  cb: (error: unknown, text: string) => void,
) => void;

interface SuperTestRequest {
  send: (payload: unknown) => SuperTestRequest;
  set: (headerName: string, headerValue: string) => SuperTestRequest;
  buffer: (b: true) => SuperTestRequest;
  parse: (fn: ParseFn) => SuperTestRequest;
  end: (cb: (err: Error | null, res: SuperTestResponse) => void) => void;
}

type SuperTestFn = (path: string) => SuperTestRequest;

type SuperTest = {
  delete: SuperTestFn;
  get: SuperTestFn;
  patch: SuperTestFn;
  post: SuperTestFn;
  put: SuperTestFn;
};

const binaryParser: ParseFn = (res, callback) => {
  res.setEncoding('binary');
  let text = '';
  res.on('data', (chunk) => { text += chunk; });
  res.on('end', () => callback(null, text));
};

const applyHeaders = (
  headers: Headers,
  req: SuperTestRequest,
): SuperTestRequest =>
  Object.keys(headers)
    .reduce(
      (acc, k) => (headers[k] ? acc.set(k, headers[k]) : acc),
      req,
    )
    .buffer(true)
    .parse(binaryParser);

const wrap = (
  superTest: SuperTest,
  opts: Options = {},
): HttpFn => async (originalReq) => {
  const req = await mapRequest(originalReq, opts);

  const k = req.method.toLowerCase() as keyof SuperTest;

  const reqMethod = superTest[k](req.path);
  const reqPayload = req.body
    ? reqMethod.send(req.body)
    : reqMethod;

  const reqObject = req.headers
    ? applyHeaders(req.headers, reqPayload)
    : reqPayload;

  const resObject = await promisify(reqObject.end.bind(reqObject))();

  const res: Response = {
    headers: resObject.headers,
    status: resObject.statusCode,
    text: resObject.body,
  };

  return res;
};

export default wrap;
