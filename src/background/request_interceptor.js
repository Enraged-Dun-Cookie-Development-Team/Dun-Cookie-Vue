import PlatformHelper from '../common/platform/PlatformHelper';

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const extDomain = PlatformHelper.Extension.getExtensionInfo().then((it) => {
  return new URL(it.optionsUrl).hostname;
});

/**
 * 对指定的url设置referer
 *
 * @param id {number}
 * @param url {string}
 * @param referer {string}
 */
export async function registerUrlToAddReferer(id, url, referer) {
  id = id > 0 ? id : Math.abs(hashCode(url));
  void PlatformHelper.Http.updateSessionRules({
    removeRuleIds: [id],
    addRules: [
      {
        id: id,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'Referer',
              operation: 'set',
              value: referer,
            },
          ],
        },
        condition: {
          initiatorDomains: [await extDomain],
          urlFilter: url,
        },
      },
    ],
  });
}
