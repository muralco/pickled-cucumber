Pickled cucumber
===============
[![npm version](https://badge.fury.io/js/pickled-cucumber.svg)](https://badge.fury.io/js/pickled-cucumber)
[![Build Status](https://travis-ci.com/muralco/pickled-cucumber.svg?branch=master)](https://travis-ci.com/muralco/pickled-cucumber)

## Description

Pickled cucumber is a Gherkin implementation with several condiments.

## Installation

```sh
npm i pickled-cucumber
```

## Usage

```js
const setup = require('pickled-cucumber').default; // note: `.default` here!

const options = {
  // opt-in into aliases, entities, documentation, etc.
};

const fn = ({ Given, When, Then }) => {
  // define your steps here
};

setup(fn, options);
```

In the most basic usage all you need to do is define cucumber steps. Besides the
`Given`, `When` and `Then` above you also have some other options,
[check here](src/types.ts#L35).

To run tests you just need to execute:

```sh
node ./node_modules/.bin/cucumber-js -r path/to/file/above.js
```

This will run all your `.feature` files in the `features/` directory. You can
also pass files and directories to the `cucumber-js` binary to control exactly
which tests should be executed.

## Modules

`pickled-cucumber` has serveral modules you can opt-in during setup by specifying
different configurations in the `options` argument to `setup`. In this section
we'll go through these modules one by one.

### Core Module

The core module is what you get for free just by using `pickled-cucumber`
without any additional configuration.

The core module includes:
- Variables and context
- Built-in aliases
- Comparison functions and built-in operators
- Tear down

##### Variables and test context

Variables are variables :). Variables have scenario scope (i.e. they are not
shared across scenarios). This scenario scope is called the _context_. We'll
cover how to manipulate the context in this section in a moment.

As with regular variables in most programming languages there are two things you
want to do with variables: assign them a value, and read the value from the
variable.

To assign a value to a variable you can use the built-in cucumber step:

```gherkin
Given variable {variable} is (.+)`
```

This assigns whatever is after the `is` to the variable named `{variable}`.

For example:

```gherkin
Given variable A is "hello, world"
```

As with most steps in `pickled-cucumber` you have two variants of the same step:
one with an inline value (the one above), and one that accepts the value in a
docstring in the next line(s). For example:

```gherkin
Given variable Person is
  """
  {
    "first": "John",
    "last": "Smith"
  }
  """
```

Alternatively, you can programatically assign a value to a variable inside a step
definition, using the `setCtx` function. For example:

```js
const fn = ({ setCtx, Given }) => {
  Given('my name is (.+)', name => setCtx('N', name));
};

setup(fn);
```

With this definition, both steps below do the same thing:

```gherkin
Given my name is John
Given variable N is "John"
```

Assigning a variable programmatically can be useful to store the result of
processing a `When` step. Later, the result can be tested using `Then`
steps.

Now here is where things get really interesting: variables can be interpolated
into any steps in `pickled-cucumber` in a similar fashion as how strings
are interpolated in JavaScript.

For example:

```gherkin
Given variable Name is "John"
Then say hi to ${Name}
Then say hi to John
```

Both `Then` steps above execute the same code.

Here's a more complex example:

```gherkin
Given variable P is
  """
  {
    "first": "John",
    "last": "Smith"
  }
  """
Then say hi to ${P.first} ${P.last}
Then say hi to John Smith
```

And a more realistic example:
```gherkin
Given a user U
When GET /api/profiles/${U.id}
...more stuff here...
```

The cool part about automatic variable interpolation is that you do not need to
do anything special while writing your steps to make it work.

As with `setCtx`, you can also programatically read the value of a variable
using the `getCtx` function.

For example:

```js
const fn = ({ getCtx, Then }) => {
  Then('the user (.+) was deleted from the DB', async varName => {
    const user = getCtx(varName);
    // assert that `user` was deleted from the DB, something like:
    // assert(await doesNotExist(user.id));
  });
};

setup(fn);
```

##### Built-in aliases

Let's pick up from the last example:

```js
const fn = ({ getCtx, Then }) => {
  Then(
    'the user (.+) was deleted from the DB',
    async varName => { },
  });
};

setup(fn);
```

The step text is a string that represents a regular expression (hence the
`(.+)`). While this is very flexible, it can be quite hard to understand.

To  address this issue, `pickled-cucumber` comes with built-in aliases that make
step definitions a lot easier to read.

The step above could be rewritten to be:

```js
Then(
  'the user {variable} was deleted from the DB',
  async varName => { },
});
```

These two ways of defining the step are functionally equivalent.

The built-in aliases include:
```
{boolean}:   true|false
{int}:       \d+
{op}:        contain|contains|exists|has keys|include|includes|is|matches|starts with|at [\w.\[\]\$\{\}-]+ (?:contain|contains|exists|has keys|include|includes|is|matches|starts with)
{variable}:  \w+
{variables}: \w+(?:,\s*\w+|\s+and\s+\w+)*
{word}:      \S+
```

For now ignore `{op}`, we'll get back to that one in the next section. Also know
that you can define custom aliases that operate exactly like the built-in ones.
More on that in a bit.

##### Comparison functions and built-in operators

One key aspect of assertion (i.e. `Then`) steps is that you'll need to compare
some _expected_ value given to the step with some _actual_ value presumably
generated or somewhat affected by a `When` step.

`pickled-cucmber` comes with two things that makes writing these `Then`
assertion steps super easy: the `{op}` alias and the `compare` function.

Here's an example:

```js
const fn = ({ compare, Then }) => {
  Then(
    'the user with id {int} {op} (.*)',
    async (id, op, payload) => {
      const user = await getUserById(id);
      compare(op, user, payload);
    },
  });
};

setup(fn);
```

```gherkin
  Then the user with id 1 is { "id": 1, "name": "John" }
  Then the user with id 1 at name is "John"
  Then the user with id 1 at name contains "Jo"
  Then the user with id 1 includes { "name": "John" }
```

The built-in operators include:

```
a contain b:     checks that the string representation of 'a' contains 'b'
a contains b:    checks that the string representation of 'a' contains 'b'
a exists any:    checks that 'a' is truthy
a has keys b:    checks that the object 'a' has all the keys in array 'b'
a include b:     checks that the array or object 'a' contains the partial 'b'
a includes b:    checks that the array or object 'a' contains the partial 'b'
a is b:          checks that 'a' deep equals 'b'
a matches b:     checks that the string representation of 'a' matches regex 'b'
a starts with b: checks that the string representation of 'a' starts with 'b'
```

Additionally, the `at` operator allows you to compare a (deeply nested) property
of `actual`. The syntax for `at` is: `at {path}` where path is a property name
a series of property names separated by dots (e.g. `address.zipCode`).

If a key of the `actual` object happens to contain one or more `.`s you can
quote the `at` path segment with `"` to target the element. For example, the `1`
in `{ "a": { "b.c": 1 } }` can be targeted with `a."b.c"`.

##### Tear down

Let's say that you have a `Given a user {variable}` step that creates a user in
your database (DB) and stores the user in the variable. After a test finishes, it would
be polite for your step to delete that user from the DB to keep things tidy.

You can accomplish this by registering tear-down logic using the `onTearDown`
function.

For example:

```js
const fn = ({ onTearDown, setCtx, Given }) => {
  Given(
    'a user {variable}',
    async (varName) => {
      const user = generateRandomUser();
      await insertUser(user);
      onTearDown(() => deleteUser(user.id));
    },
  });
};

setup(fn);
```

### Usage Module

The _usage module_ prints reference documentation of all steps, operators and
aliases available for writing tests.

To enable the _usage module_ just specify `usage: true` in the setup options.

For example:

```js
const options = {
  usage: true,
};

const fn = (args) => {
  // define your steps here using args
}

setup(fn, options);
```

This produces something like:

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

### Alias Module

The _alias module_ allows you to (re-)define regular expression aliases that you
can use to define steps with less clutter.

To enable the _alias module_ just specify `aliases` in the setup options.

For example:

```js
const options = {
  aliases: {
    'proper-name': /[A-Z][a-z]+/
    // Note: this a mapping from string to regexp
  },
};

const fn = ({ When }) => {
  // Note: when using the alias you wrap it in `{}` instead of `()`.
  When('I say hi to {proper-name}', (name) => { });
}

setup(fn, options);
```

### Initial context module

The _inititial context module_ allows you to inject some variables in the
context of every test.

To enable the _initial context module_ just specify `initialContext` in the
setup options. `initialContext` is a function that returns the initial context.
The function will be called once for each scenario (in the `Before` hook).

For example:

```js
const options = {
  initialContext: () => ({
    random: getSomeFancyRandomString(),
    now: Date.now(),
  })
};

const fn = (args) => {
  // define your steps here using args
}

setup(fn, options);
```

And in your tests:


```gherkin
When creating a user with email "${random}@email.com"
Then the user at creationDate is ${now}
```

### Entities Module

The _entities module_ allows you to test data persistence in your apps.

For example, consider the following test:

```gherkin
Given a user U with { "id": 1, "name": "John" }
When PATCH /api/users/1 with payload { "name": "Ringo" }
Then the document for user U at name is "Ringo"
```

Assuming that the `When` step was defined somehow (e.g. by the _http module_),
defining a `user` entity gives you both `Given` and `Then` steps above and
many more.

To enable the _entities module_ just specify `entities` in the setup options.

For example:

```js
const options = {
  entities: {
    user: someUserEntityDefinition,
  },
};

const fn = (args) => {
  // define your steps here using args
}

setup(fn, options);
```

Because there is a lot more to this module, we have more detailed
documentation in a separate place, see:

> [Entities Module](docs/entities.md#entities-module).

### Output Module

The _output module_ enables capture and suppression of stdout and stderr when tests are runned.

To enable the _output module_ you have the following options:

```js
const options = {
  captureOutput: true  // Will present captured stdout and stderr if an step fails
  suppressOutput: true  // Will hide stdout and stderr emitted by each step
};

const fn = (args) => {
  // define your steps here using args
}

setup(fn, options);
```

Reported output will be like the following example (only if a test fails):
```
Failures:

1) Scenario: { "a": 1 } at a is 2 # features/operators/at.feature:8
   ✔ Before # src/index.ts:62
   ✔ Before # src/output.ts:47
   ✔ Given A is { "a": 1 } # src/index.ts:144
   ✔ When asserting that A at a is 2 # src/index.ts:146
   ✔ Then the assertion fails with 1 is not 2 # src/index.ts:145
   ✖ And the full actual value is { "a": 7} # src/index.ts:145
       AssertionError [ERR_ASSERTION] [ERR_ASSERTION]: Expected values to be loosely deep-equal:

       {
         a: 7
       }

       should loosely deep-equal

       {
         a: 1
       }
           + expected - actual

            {
           -  "a": 7
           +  "a": 1
            }

           at Then.inline (pickled-cucumber/src/test.ts:127:22)
           at Object.eval (eval at proxyFnFor (pickled-cucumber/src/steps/constructor.ts:48:32), <anonymous>:6:12)

       Captured Output
       ===============
       Std Err
       -------
       <Nothing was captured>

       Std Out
       -------
       If your are seing this tests are broken
```
#### Caveats
Deprecation warnings, and output emitted from `v8` or `c++` modules will not be captured.

### Formatters

You can use the custom formatter by adding:
`--format pickled-cucumber/formatter/<formatter-name>` to the cli invocation

Valid formatters are:
 - `progress-and-profile`: Shows status and time spent on each scenario
 - `profile-jsonl`: Output json lines with duration information of each scenario 


### Operators Module

TBD

### `require` mocks

TBD

## Development
To test your local copy run `npm run pack` and install the package like this:
`npm install ../pickled-cucumber/dist/pickled-cucumber-<version>.tgz`
