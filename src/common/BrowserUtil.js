/**
 * 浏览器工具。
 * <p>
 * 基本上都可以直接把chrome替换成browser就可以通用(大概？需要逐个确认参数是否一致，特别是提供对象参数的)，chrome和browser方法签名不一样的会用注释标出来
 * <br>
 * TODO 还有一些作为注释出现的对chrome对象的调用存在于其它文件中，由于暂时不清楚作用先不管，但是之后需要确认并重构掉
 */
class BrowserUtil {
  static sendMessage(message) {
    return chrome.runtime.sendMessage(message);
  }

  static addMessageListener(listener) {
    return chrome.runtime.onMessage.addListener(listener);
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

  static addIconClickListener(listener) {
    return chrome.browserAction.onClicked.addListener(listener);
  }

  static createTab(url) {
    return chrome.tabs.create({url: url});
  }

  static createWindow(createData) {
    return chrome.windows.create(createData);
  }

  static removeWindow(windowId) {
    return chrome.windows.remove(windowId);
  }

  static downloadFile(options, callback) {
    // browser.downloads.download(options): Promise 与 chrome.downloads.download(options, callback): void 方法签名不兼容
    let promise = new Promise(resolve => chrome.downloads.download(options, data => resolve(data)));
    if (typeof callback == 'function') {
      promise = promise.then(callback);
    }
    return promise;
  }
}

export default BrowserUtil;
