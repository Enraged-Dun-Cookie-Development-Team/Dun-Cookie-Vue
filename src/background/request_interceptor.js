const refererMap = new Map();

/**
 *
 * @param url {string}
 * @param referer {string}
 */
export function registerUrlToAddReferer(url, referer) {
  refererMap.set(url, referer);
}

/**
 *
 * @param details {{url: string, requestHeaders: HttpHeaders}}
 */
export function interceptBeforeSendHeaders(details) {
  if (!refererMap.has(details.url)) return {};
  for (let i = 0; i < details.requestHeaders.length; i++) {
    const header = details.requestHeaders[i];
    if (header.name.toLowerCase() === 'referer') {
      details.requestHeaders.splice(i, 1);
    }
  }
  details.requestHeaders.push({ name: 'Referer', value: refererMap.get(details.url) });
  return { requestHeaders: details.requestHeaders };
}
