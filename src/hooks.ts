import { EventEmitter } from 'events';

enum Events {
  BEFORE_INIT = 'before-init',
  AFTER_INIT = 'after-init',
  BEFORE_TEARDOWN = 'before-teardown',
  AFTER_TEARDOWN = 'after-teardown',
}

const hooks = new EventEmitter();

type Callback = () => void;

export const BeforeInitialContext = (fn: Callback): void => {
  hooks.on(Events.BEFORE_INIT, fn);
};
export const AfterInitialContext = (fn: Callback): void => {
  hooks.on(Events.AFTER_INIT, fn);
};
export const BeforeTeardown = (fn: Callback): void => {
  hooks.on(Events.BEFORE_TEARDOWN, fn);
};
export const AfterTeardown = (fn: Callback): void => {
  hooks.on(Events.AFTER_TEARDOWN, fn);
};

export const triggerBeforeInitialContext = (): void => {
  hooks.emit(Events.BEFORE_INIT);
};

export const triggerAfterInitialContext = (): void => {
  hooks.emit(Events.AFTER_INIT);
};

export const triggerBeforeTeardown = (): void => {
  hooks.emit(Events.BEFORE_TEARDOWN);
};

export const triggerAfterTeardown = (): void => {
  hooks.emit(Events.AFTER_TEARDOWN);
};
