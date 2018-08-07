Picked cucumber
===============

## Descirption

Pickled cucumber is a Gherkin implementation with several condiments.

## Installation

```sh
npm i pickled-cucumber
```

## Usage crash-course

The most basic usage of `pickled-cucumber` is:

```js
const setup = require('pickled-cucumber');

const options = {};

const fn = (args) => {
  // define your steps here using args, e.g. args.Given
}

setup(fn, options);
```

Inside `fn` you would define all your steps (or pass `args`) along to functions
in other files.

In this scenario it might seem that nothing changed much, you are just defining
cucumber steps in a slightly different way, but in fact a lot has changed.

Lets start by adding a trivial option:

```js
// --- examples/usage.js ---------------------------------------------------- //
const setup = require('pickled-cucumber').default; // note the `.default` here!
setup(() => { /* no steps defined yet */ }, { usage: true });
```

If you run this with:

```sh
node ./node_modules/.bin/cucumber-js -r examples/usage.js
```

Then the output will be:

```
Step reference
--------------
Given variable {variable} is
Given variable {variable} is (.+)


Operators
---------
a contain b:     checks that the string representation of 'a' contains 'b'
a contains b:    checks that the string representation of 'a' contains 'b'
a exists any:    checks that 'a' is truthy
a has keys b:    checks that the object 'a' has all the keys in array 'b'
a include b:     checks that the array or object 'a' contains the partial 'b'
a includes b:    checks that the array or object 'a' contains the partial 'b'
a is b:          checks that 'a' deep equals 'b'
a matches b:     checks that the string representation of 'a' matches regex 'b'
a starts with b: checks that the string representation of 'a' starts with 'b'


Aliases
-------
{boolean}:   true|false
{int}:       \d+
{op}:        contain|contains|exists|has keys|include|includes|is|matches|starts with|at [\w.\[\]\$\{\}-]+ (?:contain|contains|exists|has keys|include|includes|is|matches|starts with)
{variable}:  \w+
{variables}: \w+(?:,\s*\w+|\s+and\s+\w+)*
{word}:      \S+



0 scenarios
0 steps
```

The first thing to note is that by passing `usage: true` in the options you get
a reference documentation of all your test steps.

The second thing to note is that even with the most basic configuration you get
two steps defined the `Given variable {variable} is`. Those steps allow you to
define variables that are local to each test scenario (more on this later).

The third thing to note is that the steps are defined using regular expressions
but you can define aliases for complex expressions to make your steps more
readable (e.g. `{variable}` instead of `\w+`).

Lets define a trivial step:

```js
// --- examples/tivial.js ----------------------------------------------------//
const setup = require('pickled-cucumber').default; // note the `.default` here!
setup(
  ({ Given }) => {
    Given('I shout ([a-z ]+!)', what => console.log(what.toUpperCase()));
  },
  { usage: true },
);
```

And a trival test:
```gherkin
// --- examples/tivial.feature -----------------------------------------------//
```

When we run this with:

```sh
node ./node_modules/.bin/cucumber-js -r examples/trivial.js examples/trivial.feature
```

We get an output that includes

```
Step reference
--------------
Given I shout ([a-z ]+!)
Given variable {variable} is
Given variable {variable} is (.+)

(...more stuff here...)

.HEY HO!
..

1 scenario (1 passed)
1 step (1 passed)
```

As you can see, the step works, but is kind of ugly with that embedded regex. We
can clean it up using a simple alias.

> An _alias_ is a mapping from a string to a regular expression. When using
aliases in step definitions, the alias string must be surounded by curly braces.

```js
// --- examples/tivial-alias.js ----------------------------------------------//
const setup = require('pickled-cucumber').default; // note the `.default` here!
setup(
  ({ Given }) => {
    Given('I shout {phrase}', what => console.log(what.toUpperCase()));
  },
  {
    aliases: {
      phrase: /[a-z ]+!/
    },
    usage: true,
  },
);
```

When we run this with:

```sh
node ./node_modules/.bin/cucumber-js -r examples/trivial-alias.js examples/trivial.feature
```

We get an output that includes

```
Step reference
--------------
Given I shout {phrase}
Given variable {variable} is
Given variable {variable} is (.+)

(...more stuff here...)

Aliases
-------
{boolean}:   true|false
{int}:       \d+
{op}:        contain|contains|exists|has keys|include|includes|is|matches|starts with|at [\w.\[\]\$\{\}-]+ (?:contain|contains|exists|has keys|include|includes|is|matches|starts with)
{phrase}:    [a-z ]+!
{variable}:  \w+
{variables}: \w+(?:,\s*\w+|\s+and\s+\w+)*
{word}:      \S+

.HEY HO!
..

1 scenario (1 passed)
1 step (1 passed)
```

Note how our `Given I shout {phrase}` step is much nicer now, but also note that
our `{phrase}` alias is listed in the _Aliases_ section for further reference.

