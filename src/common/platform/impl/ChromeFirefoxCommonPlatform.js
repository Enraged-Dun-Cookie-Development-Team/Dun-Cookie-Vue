import BrowserPlatform from './BrowserPlatform';
import { LOG_LEVEL, Logger } from '../../util/Logger';

if (typeof globalThis.browser === 'undefined') {
  globalThis.browser = globalThis.chrome;
}

// noinspection JSUnresolvedVariable
export default class ChromeFirefoxCommonPlatform extends BrowserPlatform {
  constructor() {
    super();
  }

  get PlatformType() {
    return 'Chrome/Firefox';
  }

  getPlatformInfo() {
    return browser.runtime.getPlatformInfo();
  }

  getExtensionInfo() {
    return browser.management.getSelf();
  }

  getAllWindow() {
    return browser.windows.getAll();
  }

  async getLocalStorage(name) {
    const result = await browser.storage.local.get(name);
    if (typeof name === 'string') {
      return result[name];
    } else {
      return result;
    }
  }

  saveLocalStorage(name, data) {
    const val = {};
    val[name] = data;
    return browser.storage.local.set(val);
  }

  removeLocalStorage(keys) {
    return browser.storage.local.remove(keys);
  }

  clearLocalStorage() {
    return browser.storage.local.clear();
  }

  sendMessage(type, data) {
    const message = this.__buildMessageToSend(type, data);

    return browser.runtime
      .sendMessage(message)
      .then((response) => {
        return this.__transformResponseMessage(type, response);
      })
      .catch((err) => {
        if (this.__shouldIgnoreMessageError(err.message)) {
          Logger.logLevel(LOG_LEVEL.TRACE_HIGH, `response - ${type} - ignore error: ${err.message}`);
          return;
        }
        throw err;
      });
  }

  addMessageListener(id, type, listener) {
    return browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const value = this.__handleReceiverMessage(id, type, message, listener);
      if (value !== undefined) {
        // 根据W3C规范，异步回复消息应该直接返回Promise
        // 参考文档：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
        if (value.constructor === Promise) {
          return value;
        } else {
          sendResponse(value);
        }
      }
    });
  }

  async setPopup(url) {
    // 这个方法在firefox中应该是一个返回undefined的同步方法，好在await undefined是合法的所以这样写可以通用
    return await browser.action.setPopup({ popup: url });
  }

  getURLForExtensionFile(file) {
    return browser.runtime.getURL(file);
  }

  createNotifications(id, iconUrl, title, message, imageUrl) {
    const options = {
      type: 'basic',
      iconUrl: iconUrl,
      message: message,
      title: title,
    };
    // Firefox暂时不支持image类型的通知，参考：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications/TemplateType
    // 但是Firefox会自动把image当做basic处理，所以这样做比较好，如果后期Firefox支持了image不需要修改就能自动生效
    if (imageUrl) {
      options.type = 'image';
      options.imageUrl = imageUrl;
    }
    return browser.notifications.create(id, options);
  }

  addNotificationClickListener(listener) {
    return browser.notifications.onClicked.addListener(listener);
  }

  addIconClickListener(listener) {
    return browser.action.onClicked.addListener((tab) => {
      // firefox支持ClickData来判断是否是shift点击等信息，不过暂时用不到这个特性，如果需要的话可以在FirefoxPlatform中继承
      return listener(tab);
    });
  }

  createTab(url) {
    return browser.tabs.create({ url: url });
  }

  async createWindow(url, type, width, height, state) {
    const currentWindow = await browser.windows.getCurrent();
    const createData = this.__buildCreateData(currentWindow, url, type, width, height, state);
    return browser.windows.create(createData);
  }

  updateWindow(winId, width, height) {
    return browser.windows.update(winId, { width, height });
  }

  removeWindow(windowId) {
    return browser.windows.remove(windowId);
  }

  addInstalledListener(listener) {
    return browser.runtime.onInstalled.addListener(listener);
  }

  setBadgeText(text) {
    return browser.action.setBadgeText({ text: text });
  }

  setBadgeBackgroundColor(color) {
    return browser.action.setBadgeBackgroundColor({ color: color });
  }

  createAlarm(name, alarmInfo) {
    return browser.alarms.create(name, alarmInfo);
  }

  getAlarm(name) {
    return browser.alarms.get(name);
  }

  clearAlarm(name) {
    return browser.alarms.clear(name);
  }

  clearAllAlarms() {
    return browser.alarms.clearAll();
  }

  addAlarmsListener(listener) {
    return browser.alarms.onAlarm.addListener(listener);
  }

  declarativeNetRequestUpdateSessionRules(options) {
    return browser.declarativeNetRequest.updateSessionRules(options);
  }
}
