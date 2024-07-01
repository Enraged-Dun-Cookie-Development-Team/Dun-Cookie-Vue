import { PLATFORM_CHROME } from '../../Constants';
import BrowserPlatform from './BrowserPlatform';
import DebugUtil from '../../util/DebugUtil';
import { name } from 'jsdom/lib/jsdom/living/helpers/validate-names';

// noinspection JSUnresolvedVariable
export default class ChromePlatform extends BrowserPlatform {
  constructor() {
    super();
  }

  get PlatformType() {
    return PLATFORM_CHROME;
  }

  getPlatformInfo() {
    return new Promise((resolve) => {
      chrome.runtime.getPlatformInfo((info) => resolve(info));
    });
  }

  getExtensionInfo() {
    return new Promise((resolve) => {
      chrome.management.getSelf((result) => resolve(result));
    });
  }

  getAllWindow() {
    return new Promise((resolve) => {
      chrome.windows.getAll({}, function (data) {
        resolve(data);
      });
    });
  }

  async getLocalStorage(name) {
    const result = await chrome.storage.local.get(name);
    if (typeof name === 'string') {
      return result[name];
    } else {
      return result;
    }
  }

  saveLocalStorage(name, data) {
    const val = {};
    val[name] = data;
    return chrome.storage.local.set(val);
  }

  removeLocalStorage(keys) {
    return chrome.storage.local.remove(keys);
  }

  sendMessage(type, data) {
    const message = this.__buildMessageToSend(type, data);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (this.__shouldIgnoreMessageError(chrome.runtime.lastError.message)) {
            DebugUtil.debugLog(8, `response - ${type} - ignore error: ${chrome.runtime.lastError.message}`);
            resolve();
          } else {
            reject(chrome.runtime.lastError);
          }
          return;
        }
        resolve(this.__transformResponseMessage(type, response));
      });
    });
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

  setPopup(url) {
    return new Promise((resolve, reject) => {
      chrome.action.setPopup({ popup: url }, () => {
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
    let options = {
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
    return chrome.action.onClicked.addListener(listener);
  }

  createTab(url) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url: url }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  createWindow(url, type, width, height, state) {
    const $this = this;
    return new Promise((resolve, reject) => {
      chrome.windows.getCurrent(function (win) {
        const createData = $this.__buildCreateData(win, url, type, width, height, state);
        chrome.windows.create(createData, (window) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(window);
        });
      });
    });
  }

  updateWindow(winId, width, height) {
    return new Promise((resolve, reject) => {
      chrome.windows.update(winId, { width: width, height: height }, (window) => {
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
      url: url,
    };
    if (filename && typeof filename === 'string') {
      options.filename = filename;
    }
    if (typeof saveAs === 'boolean') {
      options.saveAs = saveAs;
    }
    return new Promise((resolve, reject) => {
      chrome.downloads.download(options, (downloadId) => {
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

  setBadgeText(text) {
    return new Promise((resolve, reject) => {
      chrome.action.setBadgeText({ text: text }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  setBadgeBackgroundColor(color) {
    return new Promise((resolve, reject) => {
      chrome.action.setBadgeBackgroundColor({ color: color }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  createAlarm(name, alarmInfo) {
    return chrome.alarms.create(name, alarmInfo);
  }

  getAlarm(name) {
    return chrome.alarms.get(name);
  }

  clearAlarm(name) {
    return chrome.alarms.clear(name);
  }

  clearAllAlarms() {
    return chrome.alarms.clearAll();
  }

  addAlarmsListener(listener) {
    chrome.alarms.onAlarm.addListener(listener);
  }

  declarativeNetRequestUpdateSessionRules(options) {
    return chrome.declarativeNetRequest.updateSessionRules(options);
  }

  offscreenCreateDocument(parameters) {
    return chrome.offscreen.createDocument(parameters);
  }

  offscreenCloseDocument() {
    return chrome.offscreen.closeDocument();
  }
}
