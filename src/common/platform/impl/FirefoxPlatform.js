import { PLATFORM_FIREFOX } from '../../Constants';
import ChromeFirefoxCommonPlatform from './ChromeFirefoxCommonPlatform';

// 火狐无法储存被vue监视的对象，故在内部做json编解码
const _InternalJsonCompatible = '__INTERNAL_JSON__';

// noinspection JSUnresolvedVariable
export default class FirefoxPlatform extends ChromeFirefoxCommonPlatform {
  constructor() {
    super();
  }

  get PlatformType() {
    return PLATFORM_FIREFOX;
  }

  getLocalStorage(name) {
    return browser.storage.local.get(name).then((result) => {
      // 自动解码json
      const keys = Object.keys(result);
      for (const key of keys) {
        if (result.hasOwnProperty(key)) {
          const val = result[key];
          if (typeof val === 'string') {
            let len = _InternalJsonCompatible.length;
            if (val.length > len && val.substring(0, len) === _InternalJsonCompatible) {
              result[key] = JSON.parse(val.substring(len));
            }
          }
        }
      }
      if (typeof name === 'string') {
        result = result[name];
      }
      return result;
    });
  }

  saveLocalStorage(name, data) {
    const val = {};
    // 自动编码json
    if (typeof data === 'object') {
      data = _InternalJsonCompatible + JSON.stringify(data);
    }
    val[name] = data;
    return browser.storage.local.set(val);
  }

  addMessageListener(id, type, listener) {
    return browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const value = this.__handleReceiverMessage(id, type, message, listener);
      if (value !== undefined) {
        // 根据W3C规范，异步回复消息允许直接返回Promise
        // 参考文档：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
        if (value.constructor === Promise) {
          return value;
        } else {
          sendResponse(value);
        }
      }
    });
  }

  download(url, filename, saveAs) {
    const options = {
      url: url,
    };
    if (filename && typeof filename === 'string') {
      options.filename = filename;
    }
    if (typeof saveAs === 'boolean') {
      // 安卓版的Firefox不能提供saveAs=true，否则会报错，参考：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
      if (!(this.isMobile && saveAs)) {
        options.saveAs = saveAs;
      }
    }
    return browser.downloads.download(options);
  }
}
