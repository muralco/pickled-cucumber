import Module from 'module';
import { RequireMockMap } from './types';

// tslint:disable no-invalid-this

const setup = (requireMockMap: RequireMockMap, profile = true): void => {
  const originalRequire = Module.prototype.require;
  // eslint-disable-next-line
  Module.prototype.require = function require(path: string): any {
    const m = requireMockMap[path];
    if (m !== undefined) return m;
    if (!profile) return originalRequire.apply(this, [path]);

    const s = Date.now();
    const v = originalRequire.apply(this, [path]);
    const e = Date.now();
    if (e - s > 1000) {
      console.log(`Slow require: '${path}' = ${(e - s) / 1000.0}s`);
    }

    return v;
  };
};

export default setup;
