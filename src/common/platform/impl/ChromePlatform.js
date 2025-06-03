import { PLATFORM_CHROME } from '../../Constants';
import ChromeFirefoxCommonPlatform from './ChromeFirefoxCommonPlatform';

// noinspection JSUnresolvedVariable
export default class ChromePlatform extends ChromeFirefoxCommonPlatform {
  constructor() {
    super();
  }

  get PlatformType() {
    return PLATFORM_CHROME;
  }

  addMessageListener(id, type, listener) {
    return chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const value = this.__handleReceiverMessage(id, type, message, listener);
      if (value !== undefined) {
        if (value.constructor === Promise) {
          // Chromium内核中必须用return true的方式进行异步返回，不支持直接返回Promise
          // 参考兼容性表格：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
          value.then((result) => sendResponse(result)).catch((reason) => sendResponse(reason));
          return true;
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
      options.saveAs = saveAs;
    }
    return chrome.downloads.download(options);
  }
}
