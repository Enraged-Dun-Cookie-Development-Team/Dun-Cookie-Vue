import {BROWSER_CHROME, BROWSER_FIREFOX, BROWSER_MOBILE_PHONE, BROWSER_UNKNOWN, DEBUG_LOG} from './Constants';

/**
 * 浏览器工具。
 * <p>
 * 需要根据浏览器类型调用chrome(Chrome)/browser(Firefox)
 * <br>
 * TODO 还有一些作为注释出现的对chrome对象的调用存在于其它文件中，由于暂时不清楚作用先不管，但是之后需要确认并重构掉
 */
class BrowserUtil {

  static get browserType() {
    let head = navigator.userAgent;
    if (head.indexOf("Chrome") > 1) {
      return BROWSER_CHROME;
    } else if (head.indexOf("Firefox") > 1) {
      return BROWSER_FIREFOX;
    } else if (head.indexOf("Android") > 1 || head.indexOf("iPhone") > 1) {
      return BROWSER_MOBILE_PHONE;
    } else {
      return BROWSER_UNKNOWN;
    }
  }

  // TODO 之前好像看到Firefox浏览器的sendMessage会发给同一个页面的onMessageListener，而Chrome则不会。但是找不到文档了，需要确认，如果属实则考察是否需要加一个随机ID字段保证不监听自己
  static sendMessage(type, data) {
    if (DEBUG_LOG) {
      console.log(`sendMessage - ${type}`);
      console.log(data);
    }
    const message = {type: type};
    if (data) {
      message.data = data;
    }

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
        data = message.data;
      }
      if (data !== undefined) {
        if (DEBUG_LOG) {
          console.log(`${id} - ${type} - receiverMessage`);
          console.log(message);
        }
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

  /**
   * 监听浏览器中的插件图标点击事件。
   * <p>
   * <strong>注意：当设置了弹出菜单的时候不会触发监听器</strong>
   */
  static addIconClickListener(listener) {
    return chrome.browserAction.onClicked.addListener(listener);
  }

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
