/**
 * This module abstract the mechanism to get the right host dependencies
 *
 * This is required to register the steps on the right cucumber instance.
 *
 * Cucumber holds a lot of state on modules (seems they are using them as singletons)
 * https://git.io/J3EF8
 */
import PickleRunner from '@cucumber/cucumber/lib/runtime/pickle_runner';
import {
  IDefineSupportCodeMethods,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';

import importCwd from 'import-cwd';

interface RunnerImport {
  default: typeof PickleRunner;
}

export const HostPickleRunner = (importCwd(
  '@cucumber/cucumber/lib/runtime/pickle_runner',
) as RunnerImport).default ;

export const {
    After, AfterAll, Before, BeforeAll,
    Given, setDefaultTimeout, Then, When,
} = importCwd('@cucumber/cucumber') as IDefineSupportCodeMethods;
