#!/bin/bash

waitFor() {
  I=10
  echo -n "Waiting for $1"
  while true; do
    curl -q "$1" 1>/dev/null 2>/dev/null
    if [ $? -eq 0 ]; then echo "OK"; exit 0; fi
    I=$((I-1))
    if [ $I -eq 0 ]; then echo "Gave up"; exit 1; fi
    sleep 5
    echo -n .
  done
}

waitFor "$ELASTIC_URI"