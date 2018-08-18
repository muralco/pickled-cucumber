import BUILT_IN_ALIASES from '../aliases';
import { Aliases, Context } from '../types';
import { getDeep } from '../util';
import { Step, StepFn, StepKind, StepOptions } from './types';

// For each key `var` in `ctx`, replaces all occurrences of `${var}` in `str`
// with `ctx[var]` .
const expand = (ctx: Context) => (str: string) =>
   str && str.toString().replace(
    /\$\{([^}]+)\}/g,
    (_, path) => `${getDeep(ctx, path)}`,
  );

const replaceAll = (s: string, find: string, replace: string): string =>
  s.split(find).join(replace);

// Resolve shorthand expressions into actual regexps
const resolveRegExp = (
  aliases: Aliases,
  regexpString: string,
) =>
  Object.keys(aliases).reduce(
    (acc, k) => replaceAll(acc, `{${k}}`, `(${aliases[k].source})`),
    regexpString,
  );

// Creates a proxy of fn that calls `expand` on every argument
const proxyFnFor = (
  getCtx: () => Context,
  fn: StepFn,
  argCount: number,
) => {
  // tslint:disable-next-line prefer-array-literal
  const args = new Array(argCount).fill(undefined).map((_, i) => `a${i}`);
  const body = `{
    const { fn, expand } = this;
    const ex = expand(this.getCtx());
    return fn(${args.map(a => `ex(${a})`).join(',')});
  }`;
  // tslint:disable-next-line no-function-constructor-with-string-args
  return new Function(...args, body).bind({ getCtx, expand, fn });
};

// Generates a cucumber step, with some additional features:
//
// - the `regexp` string is transformed to replace some shorthand expressions
//   (e.g. `{int}` => `\d+`, etc) and to add boundary anchors (`^$`).
//
// - every step argument is passed through `expand` to replace variable
//   expansion expressions (e.g. `${varName}`) with the corresponding value in
//   the test context (obtained through a call to `getCtx()`).
//
// - setting `opt.inline` to `true`, will generate two versions of the step, one
//   that takes the last argument inline, and one that takes it as a docstring
//   (i.e. in the next line, surrounded by `"""`).
//
// - setting `opt.optional to `true` or a string, will generate an additional
//   version of the step that does not include the last argument. Also, when
//   `optional` is a string, that string is appended to all other version of
//    this step. Note that setting `optional` implies `inline`
export default (
  aliases: Aliases,
  getCtx: () => Context,
) => (
  kind: StepKind,
  regexpString: string,
  fn: StepFn,
  opt: StepOptions = {},
): Step[] => {
  // Generate a proxy of fn that calls `expand` on every argument
  const proxyFn = proxyFnFor(getCtx, fn, fn.length);

  const allAliases = { ...BUILT_IN_ALIASES, ...aliases };

  const rawRegExp = resolveRegExp(allAliases, regexpString);
  const suffix = opt.optional && opt.optional !== true
    ? ` ${opt.optional}`
    : '';

  const steps: Step[] = [];

  if (opt.optional) {
    // Generate a step without suffix or last argument
    const proxyFnWithoutLastArg = proxyFnFor(
      getCtx,
      fn,
      fn.length - 1 - (suffix.match(/(\([^)]*\))/g) || []).length,
    );
    steps.push({
      fn: proxyFnWithoutLastArg,
      kind,
      name: regexpString,
      regexp: new RegExp(`^${rawRegExp}$`),
    });
  }

  if (suffix || !opt.optional) {
    // Generate the normal step
    steps.push({
      fn: proxyFn,
      kind,
      name: `${regexpString}${suffix}`,
      regexp: new RegExp(`^${rawRegExp}${suffix}$`),
    });
  }

  if (opt.inline || opt.optional) {
    // Generate a step the accepts the last argument inline
    steps.push({
      fn: proxyFn,
      kind,
      name: `${regexpString}${suffix} (.+)`,
      regexp: new RegExp(`^${rawRegExp}${suffix} (.+)$`),
    });
  }

  return steps;
};
