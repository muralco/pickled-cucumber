import { RequireMockMap } from './types';

const Module = require('module');

// tslint:disable no-invalid-this

const setup = (requireMockMap: RequireMockMap, profile = true) => {
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function require(path: string) {
    const m = requireMockMap[path];
    if (m !== undefined) return m;
    if (!profile) return originalRequire.apply(this, arguments);

    const s = Date.now();
    const v = originalRequire.apply(this, arguments);
    const e = Date.now();
    if (e - s > 1000) {
      console.log(`Slow require: '${path}' = ${(e - s) / 1000.0}s`);
    }

    return v;
  };
};

export default setup;
