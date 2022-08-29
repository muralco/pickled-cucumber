#!/bin/sh

# We assume you've run `npm run dist`

cd $(dirname $0)/..

echo "Setting token"
npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN

echo "Publishing"
npm publish
