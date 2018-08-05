import { RequireMockMap } from './types';

const Module = require('module');

const setup = (requireMockMap: RequireMockMap, profile = true) => {
  const originalRequire = Module.prototype.require;
  Module.prototype.require = (path: string) => {
    const m = requireMockMap[path];
    if (m !== undefined) return m;
    if (!profile) return originalRequire(path);

    const s = Date.now();
    const v = originalRequire(path);
    const e = Date.now();
    if (e - s > 1000) {
      console.log(`Slow require: '${path}' = ${(e - s) / 1000.0}s`);
    }

    return v;
  };
};

export default setup;
