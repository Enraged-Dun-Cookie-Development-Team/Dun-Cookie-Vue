import ChromePlatform from './impl/ChromePlatform';
import FirefoxPlatform from './impl/FirefoxPlatform';
import EdgePlatform from './impl/EdgePlatform';
import UnknownPlatform from './impl/UnknownPlatform';
import { PLATFORM_CHROME, PLATFORM_EDGE, PLATFORM_FIREFOX, PLATFORM_UNKNOWN } from '../Constants';
import { Http } from '@enraged-dun-cookie-development-team/common/request';
import { LOG_LEVEL, Logger } from '../util/Logger';
import { PlatformType } from './PlatformType';
import { Base64 } from 'js-base64';

/**
 * @type AbstractPlatform
 */
let currentPlatform;
switch (PlatformType) {
  case PLATFORM_EDGE: {
    currentPlatform = new EdgePlatform();
    break;
  }
  case PLATFORM_CHROME: {
    currentPlatform = new ChromePlatform();
    break;
  }
  case PLATFORM_FIREFOX: {
    currentPlatform = new FirefoxPlatform();
    break;
  }
  case PLATFORM_UNKNOWN: {
    currentPlatform = new UnknownPlatform();
    break;
  }
}

/**
 * 帮助类，本文件相关方法的所有注释可参考AbstractPlatform。
 * <p>
 * 为了在门面模式和易用性方面做权衡，Helper方法有部分是为实际方法做了包装的，但是做包装的时候务必注意不能增加任何新行为，最好只有帮助提供"默认参数"的用途
 */
export default class PlatformHelper {
  static get isBackground() {
    return currentPlatform.isBackground;
  }

  static get isMobile() {
    return currentPlatform.isMobile;
  }

  /**
   * @return {string}
   */
  static get PlatformType() {
    return currentPlatform.PlatformType;
  }

  /**
   * @return {Promise<any>}
   */
  static getPlatformInfo() {
    return currentPlatform.getPlatformInfo();
  }

  static async osIsMac() {
    const os = (await PlatformHelper.getPlatformInfo()).os;
    return os === 'mac' || os === 'darwin';
  }

  static async osIsWindows() {
    const os = (await PlatformHelper.getPlatformInfo()).os;
    return os === 'win' || os === 'win32';
  }

  static get PlatformInstance() {
    return currentPlatform;
  }

  static get Message() {
    return messageHelper;
  }

  static get Storage() {
    return storageHelper;
  }

  static get BrowserAction() {
    return browserActionHelper;
  }

  static get Extension() {
    return extensionHelper;
  }

  static get Tabs() {
    return tabsHelper;
  }

  static get Notification() {
    return notificationHelper;
  }

  /**
   * (这个不是指Windows系统，而是指浏览器的窗口
   */
  static get Windows() {
    return windowsHelper;
  }

  static get Downloads() {
    return downloadsHelper;
  }

  static get Lifecycle() {
    return lifecycleHelper;
  }

  static get Alarms() {
    return alarmHelper;
  }

  static get Http() {
    return httpHelper;
  }

  static get HtmlParser() {
    return currentPlatform.getHtmlParser();
  }

  static get Img() {
    return imgHelper;
  }
}

// 以下为分类API Helper

class MessageHelper {
  send(type, data) {
    return currentPlatform.sendMessage(type, data).then((result) => {
      Logger.logLevel(LOG_LEVEL.TRACE_MEDIUM, 'sendMessage response：', result);
    });
  }

  registerListener(id, type, listener) {
    return currentPlatform.addMessageListener(id, type, listener);
  }
}

class StorageHelper {
  getLocalStorage(name) {
    return currentPlatform.getLocalStorage(name);
  }

  saveLocalStorage(name, data) {
    return currentPlatform.saveLocalStorage(name, data);
  }

  removeLocalStorage(keys) {
    return currentPlatform.removeLocalStorage(keys);
  }

  clearLocalStorage() {
    return currentPlatform.clearLocalStorage();
  }
}

class BrowserActionHelper {
  removePopup() {
    return this.setPopupURL('');
  }

  setPopupURL(url) {
    if (!url || typeof url !== 'string') {
      url = '';
    }
    return currentPlatform.setPopup(url);
  }

  addIconClickListener(listener) {
    return currentPlatform.addIconClickListener(listener);
  }

  /**
   * @param text {string}
   * @param color {[number,number,number,number]} rgba(range 0-255)
   */
  setBadge(text, color) {
    currentPlatform.setBadgeText(text);
    currentPlatform.setBadgeBackgroundColor(color);
  }
}

class ExtensionHelper {
  getURL(file) {
    return currentPlatform.getURLForExtensionFile(file);
  }

  getExtensionInfo() {
    return currentPlatform.getExtensionInfo();
  }
}

class TabsHelper {
  create(url) {
    return currentPlatform.createTab(url);
  }

  createWithExtensionFile(file) {
    return this.create(PlatformHelper.Extension.getURL(file));
  }
}

class NotificationHelper {
  create(id, title, message, imageUrl) {
    return this.createWithSpecialIcon(
      id,
      PlatformHelper.Extension.getURL('/assets/image/' + Settings.logo),
      title,
      message,
      imageUrl
    );
  }

  /**
   * 一般使用create即可，只有需要显示特殊图标的时候才用这个方法
   */
  async createWithSpecialIcon(id, iconUrl, title, message, imageUrl) {
    const transformImageUrl = typeof imageUrl === 'string' && imageUrl.startsWith('http');
    if (transformImageUrl) {
      try {
        const blob = await Http.get(imageUrl, { responseTransformer: (r) => r.blob() });
        const canvas = new OffscreenCanvas(400, 200);
        const ctx = canvas.getContext('2d');
        const bitmap = await createImageBitmap(blob, { resizeWidth: canvas.width });
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const newBlob = await canvas.convertToBlob({
          type: 'image/png',
          quality: 0.5,
        });
        imageUrl = 'data:image/png;base64,' + Base64.fromUint8Array(new Uint8Array(await newBlob.arrayBuffer()));
        Logger.logVerbose(LOG_LEVEL.INFO, '%c 推送图片 ', 'color: #eee; background: #e5a335', `成功创建推送图片`);
      } catch (e) {
        Logger.logError('%c 推送图片 ', 'color: #eee; background: #e53935', `创建推送图片报错：`, e);
        imageUrl = undefined;
      }
    }
    return await currentPlatform.createNotifications(id, iconUrl, title, message, imageUrl);
  }

  addClickListener(listener) {
    return currentPlatform.addNotificationClickListener(listener);
  }
}

/**
 * (这个不是指Windows系统，而是指浏览器的窗口。
 * <p>
 * 虽然这个命名有歧义，但是为了尊重浏览器的扩展api命名所以还是选择这个名字
 * <p>
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows
 */
class WindowsHelper {
  create(url, type, width, height, state) {
    return currentPlatform.createWindow(url, type, width, height, state).catch((err) => {
      Logger.logWarn('创建窗口失败！');
      Logger.logError(err);
    });
  }

  createPopupWindow(url, width, height) {
    return this.create(url, 'popup', width, height);
  }

  createMaxPopupWindow(url) {
    return this.create(url, 'popup', 0, 0, 'maximized');
  }

  remove(windowId) {
    return currentPlatform.removeWindow(windowId);
  }

  update(winId, width, height) {
    return currentPlatform.updateWindow(winId, width, height);
  }

  getAllWindow() {
    return currentPlatform.getAllWindow();
  }
}

class DownloadsHelper {
  downloadURL(url, filename, saveAs) {
    return currentPlatform.download(url, filename, saveAs);
  }
}

class LifecycleHelper {
  addInstalledListener(listener) {
    return currentPlatform.addInstalledListener(listener);
  }
}

class AlarmHelper {
  create(name, alarmInfo) {
    return currentPlatform.createAlarm(name, alarmInfo);
  }

  async createIfNotExists(name, alarmInfo) {
    const alarm = await currentPlatform.getAlarm(name);
    if (!alarm) {
      return currentPlatform.createAlarm(name, alarmInfo);
    }
  }

  get(name) {
    return currentPlatform.getAlarm(name);
  }

  clear(name) {
    return currentPlatform.clearAlarm(name);
  }

  clearAll() {
    return currentPlatform.clearAllAlarms();
  }

  addListener(listener) {
    return currentPlatform.addAlarmsListener(listener);
  }
}

class HttpHelper {
  updateSessionRules(options) {
    return currentPlatform.declarativeNetRequestUpdateSessionRules(options);
  }
}

class ImgHelper {
  generateShareImage(dataItem, iconUrl, dataSource, imageUrl) {
    return currentPlatform.generateShareImage(dataItem, iconUrl, dataSource, imageUrl);
  }
}

const messageHelper = new MessageHelper();
const storageHelper = new StorageHelper();
const browserActionHelper = new BrowserActionHelper();
const extensionHelper = new ExtensionHelper();
const tabsHelper = new TabsHelper();
const notificationHelper = new NotificationHelper();
const windowsHelper = new WindowsHelper();
const downloadsHelper = new DownloadsHelper();
const lifecycleHelper = new LifecycleHelper();
const alarmHelper = new AlarmHelper();
const httpHelper = new HttpHelper();
const imgHelper = new ImgHelper();
globalThis.PlatformHelper = PlatformHelper;
