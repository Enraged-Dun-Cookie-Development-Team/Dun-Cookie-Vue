/**
 * 浏览器工具。
 * <p>
 * 需要根据浏览器类型调用chrome(Chrome)/browser(Firefox)
 * <br>
 * TODO 还有一些作为注释出现的对chrome对象的调用存在于其它文件中，由于暂时不清楚作用先不管，但是之后需要确认并重构掉
 */
class BrowserUtil {
  static sendMessage(message) {
    console.log('sendMessage');
    console.log(message);

    return new Promise(resolve => {
      chrome.runtime.sendMessage(message, (response) => {
        // 需要注意的是，在提供了callback参数后，如果没有可用的监听器，那么会抛异常lastError。
        // 不提供callback参数时如果没有监听器只会默默失败
        // 所以这里要进行判断
        if (!chrome.runtime.lastError) {
          resolve(response);
        }
      });
    });
  }

  /**
   * 监听message
   * @param id 监听器ID，暂时的用途只有调试输出
   * @param type 如果不提供type或者type为false则监听所有信息，否则只监听对应type的信息
   * @param listener 监听器，接收一个参数处理信息
   */
  static addMessageListener(id, type, listener) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      let data;
      if (!type) {
        data = message;
      } else if (message.type === type) {
        // TODO 把info优化掉
        data = message.data || {info: message.info};
      }
      if (data !== undefined) {
        console.log(`${id} - ${type} - receiverMessage`);
        console.log(message);
        const value = listener(data);
        if (value !== null && value !== undefined) {
          if (value.constructor === Promise) {
            value.then(res => sendResponse(res));
            return true;
          } else {
            sendResponse(value);
          }
        }
      }
    });
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
    let promise = new Promise(resolve => chrome.downloads.download(options, data => resolve(data)));
    if (typeof callback == 'function') {
      promise = promise.then(callback);
    }
    return promise;
  }
}

export default BrowserUtil;
