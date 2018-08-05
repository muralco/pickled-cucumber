import { Step } from './types';

const kindOrder = {
  Given: 1,
  Then: 3,
  When: 2,
};

const orderSteps = (a: Step, b: Step) =>
  a.kind === b.kind
    ? a.name <= b.name ? -1 : 1
    : kindOrder[a.kind] <= kindOrder[b.kind] ? -1 : 1;

export default (steps: Step[]): string =>
  [...steps]
    .sort(orderSteps)
    .map(s => `${s.kind} ${s.name}\n`)
    .join('');
