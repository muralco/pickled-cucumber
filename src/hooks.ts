import { EventEmitter } from 'events';

enum Events {
  BEFORE_INIT = 'before-init',
  AFTER_INIT = 'after-init',
  BEFORE_TEARDOWN = 'before-teardown',
  AFTER_TEARDOWN = 'after-teardown',
}

const hooks = new EventEmitter();

type Callback = () => void;

export const BeforeInitialContext = (fn: Callback) => {
  hooks.on(Events.BEFORE_INIT, fn);
};
export const AfterInitialContext = (fn: Callback) => {
  hooks.on(Events.AFTER_INIT, fn);
};
export const BeforeTeardown = (fn: Callback) => {
  hooks.on(Events.BEFORE_TEARDOWN, fn);
};
export const AfterTeardown = (fn: Callback) => {
  hooks.on(Events.AFTER_TEARDOWN, fn);
};

export const triggerBeforeInitialContext = () => {
  hooks.emit(Events.BEFORE_INIT);
};

export const triggerAfterInitialContext = () => {
  hooks.emit(Events.AFTER_INIT);
};

export const triggerBeforeTeardown = () => {
  hooks.emit(Events.BEFORE_TEARDOWN);
};

export const triggerAfterTeardown = () => {
  hooks.emit(Events.AFTER_TEARDOWN);
};
