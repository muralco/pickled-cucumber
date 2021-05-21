export interface Headers {
  [name: string]: string;
}

export type Method = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export interface Request {
  body?: unknown;
  credentials?: unknown;
  headers?: Headers;
  method: Method;
  path: string;
}

export interface Response {
  headers: Headers;
  status: number;
  text: string;
}

export type HttpFn = (request: Request) => Promise<Response>;

type ApplyCredentialsFn = (request: Request) => Request | Promise<Request>;

export interface Options {
  applyCredentials?: ApplyCredentialsFn;
  baseUri?: string;
}
