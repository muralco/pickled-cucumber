import * as filters from '@cucumber/cucumber/lib/stack_trace_filter';
import path from 'path';

export const monkeypatchStackFilters = (): void => {
  const projectRootPath = path.join(__dirname, '..');
  const projectChildDirs = ['src'];

  const originalIsFilenameInCucumber = filters.isFileNameInCucumber;

  const isFileNameInPickledCucumber = (fileName: string): boolean =>
    originalIsFilenameInCucumber(fileName) ||
    projectChildDirs.some((dir) =>
      fileName.startsWith(path.join(projectRootPath, dir)),
    );

  (filters as {
    isFileNameInCucumber: (f: string) => boolean;
  }).isFileNameInCucumber = isFileNameInPickledCucumber;
};
