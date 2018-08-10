#!/bin/sh

ELASTIC=http://localhost:9200

cd $(dirname $0)/..

WITH_MONGODB=$(test -d node_modules/mongodb && echo 1)
WITH_ELASTIC=$(curl -fs "$ELASTIC" > /dev/null && echo "$ELASTIC")

IFS="
"

TAGS="not @ignore"
if [ -z "$WITH_MONGODB" ]; then TAGS="$TAGS and not @mongodb"; fi
if [ -z "$WITH_ELASTIC" ]; then TAGS="$TAGS and not @elasticsearch"; fi

runTest() {
  MONGODB=$WITH_MONGODB \
  ELASTIC_URI=$WITH_ELASTIC \
  ./node_modules/.bin/cucumber-js \
    --require-module ts-node/register \
    -r src/test.ts \
    $*
}

if [ ! -z "$TAGS" ]; then
  runTest -t "$TAGS" $*
else
  runTest $*
fi
