import {PLATFORM_CHROME, DEBUG_LOG} from '../../Constants';
import AbstractPlatform from '../AbstractPlatform';

let _isBackground;
let _isMobile;

export default class ChromePlatform extends AbstractPlatform {

  constructor() {
    super();
    // 这部分放在类里面的原因是放在外面会被意外执行导致报错
    // 判断当前url中是否包含background(已知的其它方法都是Promise，都不能保证在isBackground被使用之前完成判断)
    _isBackground = window.document.URL.indexOf('background') !== -1;
    console.log(`Current isBackground: ${_isBackground}`);

    const head = navigator.userAgent;
    _isMobile = head.indexOf("Android") > 1 || head.indexOf("iPhone") > 1;
  }

  get isBackground() {
    return _isBackground;
  }

  get isMobile() {
    return _isMobile;
  }

  get PlatformType() {
    return PLATFORM_CHROME;
  }

  getLocalStorage(name) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(name, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        if (typeof name === 'string') {
          resolve(result[name]);
        } else {
          resolve(result);
        }
      });
    });
  }

  saveLocalStorage(name, data) {
    const val = {};
    val[name] = data;
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(val, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  sendMessage(type, data) {
    if (DEBUG_LOG) {
      console.log(`sendMessage - ${type}`);
      console.log(data || 'no-data');
    }
    const message = {type: type};
    if (data) {
      message.data = data;
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        if (response === AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE) {
          if (DEBUG_LOG) {
            console.log(`response - ${type} - empty`);
          }
          resolve();
          return;
        }
        if (DEBUG_LOG) {
          console.log(`response - ${type}`);
          console.log(response);
        }
        resolve(response);
      });
    });
  }

  addMessageListener(id, type, listener) {
    return chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      let value;

      if (!type || message.type === type) {
        if (DEBUG_LOG) {
          console.log(`${id} - ${type}|${message.type} - receiverMessage`);
          console.log(message);
        }
        if (!type) {
          value = listener(message);
        } else {
          value = listener(message.data);
        }

        if (value !== null && value !== undefined) {
          if (DEBUG_LOG) {
            console.log(`${id} - ${type}|${message.type} - receiverMessage - response`);
            console.log(value);
          }
          // Chromium内核中必须用return true的方式进行异步返回，不支持直接返回Promise
          // 参考兼容性表格：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
          sendResponse(value);
          if (value.constructor === Promise) {
            return true;
          }
        } else {
          if (DEBUG_LOG) {
            console.log(`${id} - ${type}|${message.type} - receiverMessage - responseEmpty`);
          }
          // 必须要返回点什么东西来避免报错
          sendResponse(AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE);
        }
      }
    });
  }

  setPopup(url) {
    return new Promise((resolve, reject) => {
      chrome.browserAction.setPopup({popup: url}, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  getURLForExtensionFile(file) {
    return chrome.runtime.getURL(file);
  }

  createNotifications(id, iconUrl, title, message, imageUrl) {
    var options = {
      type: 'basic',
      iconUrl: iconUrl,
      message: message,
      title: title,
    };
    if (imageUrl) {
      options.type = 'image';
      options.imageUrl = imageUrl;
    }
    return new Promise((resolve, reject) => {
      chrome.notifications.create(id, options, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  addNotificationClickListener(listener) {
    return chrome.notifications.onClicked.addListener(listener);
  }

  addIconClickListener(listener) {
    return chrome.browserAction.onClicked.addListener(listener);
  }

  createTab(url) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({url: url}, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  createWindow(url, type, width, height) {
    var createData = {
      url: url,
      type: type,
      width: width,
      height: height
    };
    return new Promise((resolve, reject) => {
      chrome.windows.create(createData, window => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(window);
      });
    });
  }

  removeWindow(windowId) {
    return new Promise((resolve, reject) => {
      chrome.windows.remove(windowId, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  download(url, filename, saveAs) {
    var options = {
      url: url
    };
    if (filename && typeof filename === 'string') {
      options.filename = filename;
    }
    if (typeof saveAs === 'boolean') {
      options.saveAs = saveAs;
    }
    return new Promise((resolve, reject) => {
      chrome.downloads.download(options, downloadId => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(downloadId);
      });
    });
  }

  addInstallListener(listener) {
    return chrome.runtime.onInstalled.addListener(listener);
  }
}
