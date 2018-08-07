const setup = require('../dist').default; // note the `.default` here!
setup(
  ({ Given }) => {
    Given('I shout ([a-z ]+!)', what => console.log(what.toUpperCase()));
  },
  { usage: true },
);
