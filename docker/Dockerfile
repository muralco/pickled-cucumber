FROM node:8.9.4-slim

WORKDIR /usr/src

COPY ["package.json", "package-lock.json", "/usr/src/"]

RUN npm i --loglevel=warn --porcelain --progress=false

RUN npm i --no-save --loglevel=warn --porcelain --progress=false mongodb@2.2.27

COPY ["tsconfig.json", "docker/wait.sh", "/usr/src/"]

CMD ./wait.sh && ./node_modules/.bin/cucumber-js --require-module ts-node/register -r src/test.ts -t "not @ignore"
