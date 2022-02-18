// 文档：https://nodejs.org/docs/latest-v16.x/api/esm.html#loadurl-context-defaultload

export async function load(url, context, defaultLoad) {
  if (url.indexOf('/Dun-Cookie-Vue/src/') !== -1 || url.indexOf('/Dun-Cookie-Vue/nodejs/') !== -1) {
    context.format = 'module';
  }
  return defaultLoad(url, context, defaultLoad);
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier[0] === '.' && !specifier.endsWith('.js')) {
    specifier += '.js';
  }
  return defaultResolve(specifier, context, defaultResolve);
}

import { createRequire } from "module";
const require = createRequire(import.meta.url);
global.require = require;
