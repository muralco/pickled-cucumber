
import setup, { SetupFn } from '../src/index';

const fn: SetupFn = ({ Given, Then }) => {
  Given('message (.*) is written to stdout', (msg) => console.log(msg));
  Given('message (.*) is written to stderr', (msg) => console.error(msg));
  Then('no error', () => {});
  Then('error', () => {throw new Error('Error')});
}

setup(fn, {
  ...{"suppressOutput":true},
  initialContext: () => {
    console.log('logged-on-initial-context-stdout');
    console.error('logged-on-initial-context-stderr');
    return {};
  },
});
    