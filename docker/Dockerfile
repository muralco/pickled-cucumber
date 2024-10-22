FROM node:18.19.1

WORKDIR /usr/src

COPY ["package.json", "package-lock.json", "/usr/src/"]

RUN npm i --loglevel=warn --porcelain --progress=false

RUN npm i --no-save --loglevel=warn --porcelain --progress=false mongodb@5.8.1

COPY ["tsconfig.json", "docker/wait.sh", "/usr/src/"]

CMD ./wait.sh && TS_NODE_FILES=true ./node_modules/.bin/cucumber-js --require-module ts-node/register -r src/test.ts -t "not @ignore"
