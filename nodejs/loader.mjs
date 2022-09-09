// 文档：https://nodejs.org/docs/latest-v16.x/api/esm.html#loadurl-context-defaultload

import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';

const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = __dirname + sep + 'src';
const nodejsDir = __dirname + sep + 'nodejs';

export async function load(url, context, defaultLoad) {
  if (url.startsWith('file:')) {
    const path = fileURLToPath(url);
    if (path.startsWith(srcDir) || path.startsWith(nodejsDir)) {
      context.format = 'module';
    }
  }
  return defaultLoad(url, context, defaultLoad);
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier[0] === '.' && !specifier.endsWith('.js')) {
    specifier += '.js';
  }
  return defaultResolve(specifier, context, defaultResolve);
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.require = require;
