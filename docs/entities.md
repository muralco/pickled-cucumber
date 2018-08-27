Entities Module
===============

The _entities module_ allows you to test data persistence in your apps.

## Usage

```js
const options = {
  entities: {
    user: someUserEntityDefinition, // see below
  },
};

const fn = (args) => {
  // define your steps here using args
}

setup(fn, options);
```

You can define as many entities as you want as long as their name is unique. Do
note that for the steps to make sense the entity name must be singular (e.g. 
_user_ instead of _users_), also note that the entity name can have spaces (e.g.
_user projection_).

## Description

Consider the following test:

```gherkin
Given a user U with { "id": 1, "name": "John" }
When PATCH /api/users/1 with payload { "name": "Ringo" }
Then the document for user U at name is "Ringo"
```

Assuming that the `When` step was defined, defining a `user` entity gives you
both `Given` and `Then` steps above and many more.

## Specifying entities

In a real life scenario, rather than having `someUserEntityDefinition` as in the
example above, you would have something like this:

```js
const options = {
  entities: {
    user: createSomeSqlEntity('users'), // table
    'user projection': createSomeNoSqlEntity('users'), // collection
    
    // more entities here
  },
};
```

That is, you use a function that creates an entity given some
implementation-specific parameters (e.g. _table name_).

`pickled-cucumber` provides a couple of default entity implementations (listed
below), but you can easily define you own. If you do, and use a standard,
non-proprietary technology, please consider submitting your implementation as a
pull request.

The sections below describe the built-in entity implementations and also how
you would implement your own entity.

### MongoDB

To use a MongoDB entity all you need to do is the following:

```js
const mongo = require('mongodb');
const createMongoEntity = require('pickled-cucumber/entities/mongodb');
const { promisify } = require('util');

// You probably already have this function defined somewhere in your code, we
// are including it here for completeness' sake.
let client;
let connected = false;
const getDb = async () => {
  if (client) return client;
  client = promisify(mongo.MongoClient.connect)(
    'mongodb://localhost:27017/test',
  );
  await client;
  connected = true;
  return client;
};

const options = {
  entities: {
    user: createMongoEntity(
      getDb,
      'users', // collection
      'email', // id field
      { // this whole object and all its keys are optional

        // called before creating a document, `attrs` is a partial user and
        // we need to return a full user with all the required attributes set
        // to suitable defaults (if they are missing in `attrs`).
        onCreate: attrs =>
          ({ email: `${Date.now()}@mail.com`, ...attrs }),

        // called before updating a document, `attrs` is a partial user and
        // we can augment that `attrs` with some generated change (like the
        // `updated` field below). This function returns another partial user
        // (or a promise of the partial user). `id` is the id of the user being
        // updated and `entity` is the whole entity definition (see "Custom
        // entities" below).
        onUpdate: (attrs, id, entity) =>
          ({ ...attrs, updated: Date.now() }),

        // called before updating a document, `changes` is a mongo update object
        // (e.g. { $set: {}, $push: {}, ... }). This function returns another
        // update object.
        onUpdateChanges: (changes) =>
          ({ ...changes, $push: { changeDates: Date.now() } }),
      },
    ),
    // one without all the fuzz
    address: createMongoEntity(getDb, 'addresses', 'id'),
  },
}
```

### ElasticSearch

To use an ElasticSearch entity all you need to do is the following:

```js
const createElasticEntity = require('pickled-cucumber/entities/elasticsearch');

const INDEX_URI = 'http://localhost:9200/test-index';

const options = {
  entities: {
    user: createElasticEntity(
      INDEX_URI, // Elastic URI including index name
      '/test-type', // index suffix (i.e. type if any)
      'id', // id field
      { // this whole object and all its keys are optional

        // called before creating a document, `attrs` is a partial user and
        // we need to return a full user with all the required attributes set
        // to suitable defaults (if they are missing in `attrs`).
        onCreate: attrs =>
          ({ id: Date.now, ...attrs }),

        // called before updating a document, `attrs` is a partial user and
        // we can augment that `attrs` with some generated change (like the
        // `updated` field below). This function returns another partial user
        // (or a promise of the partial user). `id` is the id of the user being
        // updated and `entity` is the whole entity definition (see "Custom
        // entities" below).
        onUpdate: (attrs, id, entity) =>
          ({ ...attrs, updated: Date.now() }),

        // called to compute the `routing` of `record`. This function should
        // return a string or undefined. When it returns a string, the routing
        // string will be interpolated between the `indexUri` and the 
        // `indexSuffix` as in `${indexUri}/${routing}${indexSuffix}`. In the
        // example below this means `.../test-index/stuff/test-type`.
        getRouting: record => 'stuff';
      },
    ),
    // one without all the fuzz
    address: createElasticEntity(INDEX_URL, '/addresses', 'id'),
  },
}
```

### Custom entities

Given:

```js
const options = {
  entities: {
    user: createSomeSqlEntity('users'),
  },
};
```

Here how one of those `create*Entity` functions would be implemented:

```js
const createSomeSqlEntity = (tableName) => ({
  // for the examples below let's assume that `tableName` is 'users'.
  create: (attrs) => {
    // `attrs` is a partial user

    // we should merge `attrs` with a default user and insert in our DB
    // then we need to return a promise of the user inserted (potentially
    // augmented with a database-generated id)
  },
  delete: (idOrObject) => {
    // `idOrObject` is a user id or a full user

    // we should delete the user from our DB and return a promise
  },
  findBy: (criteria) => {
    // `criteria` is a JSON object, this can be anything that is specified
    // in your tests, make sure your entity and your tests are consistent.
    // If your DB supports a JSON query language, then it would be a good
    // idea to use that as `criteria`, otherwise (e.g. SQL) you could
    // provide some sort of mapping.

    // we should search the DB for a `user` matching `criteria` and return
    // a promise of that `user` or `null` or `undefined` if not found (your
    // choice). If multiple records match, return the first one.
  },
  findById: (idOrObject) => {
    // `idOrObject` is a user id or a full user

    // we should search the DB just like `findBy` above, except that we
    // search by id instead of by `criteria`.
  },
  update: (idOrObject, attrs) => {
    // `idOrObject` is a user id or a full user, `attrs` is a partial user

    // we should update the `user` with `attrs` and return a promise of the
    // updated user. You might need to query the DB after the update to get
    // the updated `user`, that is OK.
  },
});
```

Do note that just like `tableName` you can specify any number of arguments you
need in order to define your entity. Check the _built-in_ implementations for
inspiration.

Also remember to contribute your custom entities in a PR!
