import { Headers, Options, Request } from './types';

export const mapRequest = async (
  originalReq: Request,
  opts: Options = {},
): Promise<Request> => {
  const req =
    originalReq.credentials && opts.applyCredentials
      ? await opts.applyCredentials(originalReq)
      : originalReq;

  const url = opts.baseUri ? `${opts.baseUri}${req.path}` : req.path;

  const contentType: Headers = req.body
    ? { 'content-type': 'application/json; charset=utf-8' }
    : {};

  return {
    ...req,
    headers: {
      ...contentType,
      ...req.headers,
    },
    path: url,
  };
};
