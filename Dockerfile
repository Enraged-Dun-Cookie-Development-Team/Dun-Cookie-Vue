# syntax=docker/dockerfile:1.2
FROM node:16.14
ADD package.json package-lock.json /app/
WORKDIR /app
RUN --mount=type=cache,target=/app/node_modules,id=my_app_npm_module,sharing=locked \
    --mount=type=cache,target=/root/.npm,id=npm_cache \
        npm i
ADD . /app
WORKDIR /app/nodejs
CMD [ "node", "--experimental-loader", "./loader.mjs", "./index.js"]
