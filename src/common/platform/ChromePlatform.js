import {BROWSER_CHROME, BROWSER_FIREFOX, BROWSER_MOBILE_PHONE, BROWSER_UNKNOWN, DEBUG_LOG} from '../Constants';
import BrowserUtil from './BrowserUtil';

// 判断当前url中是否包含background(已知的其它方法都是Promise，都不能保证在isBackground被使用之前完成判断)
const _isBackground = window.document.URL.indexOf('background') !== -1;
console.log(`Current isBackground: ${_isBackground}`);

export default class ChromePlatform extends AbstractPlatform {

  get isBackground() {
    return _isBackground;
  };

  get platformType() {
    // TODO 只是简单的将原来的代码copy了过来，做多平台兼容的时候要记得修改这边
    // 修改方式：这边直接return BROWSER_CHROME; 其它平台各自返回相应的值
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

  getLocalStorage(name) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(name, (result) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(lastError);
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
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(lastError);
          return;
        }
        resolve(true);
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
        // 需要注意的是，在提供了callback参数后，如果没有可用的监听器，那么会抛异常lastError。
        // 不提供callback参数时如果没有监听器只会默默失败
        // 所以这里要进行判断
        if (!chrome.runtime.lastError) {
          if (DEBUG_LOG) {
            console.log(`response - ${type}`);
            console.log(response);
          }
          resolve(response);
        } else {
          resolve(null);
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
  addMessageListener(id, type, listener) {
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

  setPopup(detail) {
    return chrome.browserAction.setPopup(detail);
  }

  getExtensionURL(file) {
    return chrome.extension.getURL(file);
  }

  createNotifications(id, iconUrl, title, message, imageUrl) {
    var options = {
      type: 'basic',
      iconUrl: iconUrl,
      message: message,
      title: title,
    };
    // TODO 参考 https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications/TemplateType，完成Firefox的兼容的时候不需要这一块，直接忽略掉imageUrl这个参数
    if (imageUrl) {
      options.type = 'image';
      options.imageUrl = imageUrl;
    }
    return chrome.notifications.create(id, options);
  }

  addNotificationClickListener(listener) {
    return chrome.notifications.onClicked.addListener(listener);
  }

  /**
   * 监听浏览器中的插件图标点击事件。
   * <p>
   * <strong>注意：当设置了弹出菜单的时候不会触发监听器</strong>
   */
  addIconClickListener(listener) {
    return chrome.browserAction.onClicked.addListener(listener);
  }

  /**
   * 在新标签页中打开拓展内置页面
   */
  createExtensionTab(url) {
    return chrome.tabs.create({url: BrowserUtil.getExtensionURL(url)});
  }

  /**
   * 在新标签页中打开指定url
   */
  createTab(url) {
    return chrome.tabs.create({url: url});
  }

  createWindow(url, type, width, height) {
    var createData = {
      url: url,
      type: type,
      width: width,
      height: height
    };
    return new Promise(resolve => chrome.windows.create(createData, data => resolve(data)));
  }

  removeWindow(windowId) {
    return chrome.windows.remove(windowId);
  }

  download(url, filename, saveAs) {
    var options = {
      url: url
    };
    if (filename && typeof filename === 'string') {
      options.filename = filename;
    }
    if (saveAs && typeof saveAs === 'boolean') {
      options.saveAs = saveAs;
    }
    return new Promise(resolve => chrome.downloads.download(options, data => resolve(data)));
  }

  addInstallListener(listener) {
    return chrome.runtime.onInstalled.addListener(listener);
  }
}
