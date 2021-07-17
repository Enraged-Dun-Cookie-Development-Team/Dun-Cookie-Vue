import {BROWSER_CHROME, BROWSER_FIREFOX, BROWSER_MOBILE_PHONE, BROWSER_UNKNOWN} from '../Constants';
import PlatformHelper from './PlatformHelper';

// 判断当前url中是否包含background(已知的其它方法都不能保证在isBackground被使用之前完成判断)
const _isBackground = window.document.URL.indexOf('background') !== -1;
console.log(`Current isBackground: ${_isBackground}`);

/**
 * 浏览器工具。
 * <p>
 * TODO 实现不同平台浏览器类型的独特接口，并在完成后删除本类，所有外部调用都改用PlatformHelper
 * <br>
 * TODO 还有一些存在于其它文件中的chrome调用，也要记得处理(如果是注释可以直接删掉)
 */
class BrowserUtil {

  /**
   * 是否是后台进程
   */
  static get isBackground() { return PlatformHelper.isBackground; };

  static get browserType() {
    return PlatformHelper.platformType;
  }

  static getLocalStorage(name) {
    return PlatformHelper.Storage.getLocalStorage(name);
  }

  static saveLocalStorage(name, data) {
    return PlatformHelper.Storage.saveLocalStorage(name, data);
  }

  static sendMessage(type, data) {
    return PlatformHelper.Message.send(type, data);
  }

  static addMessageListener(id, type, listener) {
    return PlatformHelper.Message.registerListener(id, type, listener);
  }

  static setPopup(detail) {
    return chrome.browserAction.setPopup(detail);
  }

  static getExtensionURL(file) {
    return chrome.extension.getURL(file);
  }

  static createNotifications(id, options) {
    return chrome.notifications.create(id, options);
  }

  static addNotificationClickListener(listener) {
    return chrome.notifications.onClicked.addListener(listener);
  }

  static addInstallListener(listener) {
    return chrome.runtime.onInstalled.addListener(listener);
  }

  /**
   * 监听浏览器中的插件图标点击事件。
   * <p>
   * <strong>注意：当设置了弹出菜单的时候不会触发监听器</strong>
   */
  static addIconClickListener(listener) {
    return chrome.browserAction.onClicked.addListener(listener);
  }

  /**
   * 在新标签页中打开拓展内置页面
   */
  static createExtensionTab(url) {
    return chrome.tabs.create({url: BrowserUtil.getExtensionURL(url)});
  }

  /**
   * 在新标签页中打开指定url
   */
  static createTab(url) {
    return chrome.tabs.create({url: url});
  }

  static createWindow(createData) {
    return new Promise(resolve => chrome.windows.create(createData, data => resolve(data)));
  }

  static removeWindow(windowId) {
    return chrome.windows.remove(windowId);
  }

  static downloadFile(options, callback) {
    let promise = new Promise(resolve => chrome.downloads.download(options, data => resolve(data)));
    if (typeof callback == 'function') {
      promise = promise.then(callback);
    }
    return promise;
  }
}

export default BrowserUtil;
