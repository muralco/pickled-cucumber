const setup = require('../dist').default; // note the `.default` here!
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
