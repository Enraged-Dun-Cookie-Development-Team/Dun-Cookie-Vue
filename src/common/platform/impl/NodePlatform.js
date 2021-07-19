import AbstractPlatform from '../AbstractPlatform';
import {DEBUG_LOG, PLATFORM_NODE} from '../../Constants';
import {deepAssign} from '../../util/CommonFunctions';

const storageFile = 'storage.json';

export default class NodePlatform extends AbstractPlatform {
  fs;
  path;

  constructor() {
    super();
    // 这部分放在类里面的原因是放在外面会被意外执行导致报错
    this.fs = require("fs");
    this.path = require("path");
    console.log(this.fs);
  }

  get isBackground() {
    return true;
  }

  get isMobile() {
    return false;
  }

  get PlatformType() {
    return PLATFORM_NODE;
  }

  getLocalStorage(name) {
    return new Promise((resolve, reject) => {
      this.fs.readFile(storageFile, function (err, data) {
        if (err) {
          reject(err);
          return;
        }
        const json = JSON.parse(data.toString());
        if (!name) {
          resolve(json);
        } else if (typeof name === 'string') {
          resolve(json[name]);
        } else if (Array.isArray(name)) {
          const result = {};
          for (const key of name) {
            if (key !== undefined && typeof json[key] !== undefined) {
              result[key] = json[key]
            }
          }
          resolve(result);
        } else {
          const result = deepAssign({}, name);
          for (const key in name) {
            if (name.hasOwnProperty(key)) {
              if (key !== undefined && typeof json[key] !== undefined) {
                result[key] = json[key]
              }
            }
          }
          resolve(result);
        }
      });
    });
  }

  saveLocalStorage(name, data) {
    return new Promise((resolve, reject) => {
      this.getLocalStorage().then(json => {
        json[name] = data;
        this.fs.writeFile(storageFile, JSON.stringify(json),  function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }).catch(reject);
    });
  }

  sendMessage(type, data) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Message');
    }
    return new Promise((_, reject) => reject('Node环境不支持Message'));
  }

  addMessageListener(id, type, listener) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Message');
    }
    return new Promise((_, reject) => reject('Node环境不支持Message'));
  }

  setPopup(url) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Popup');
    }
    return new Promise((_, reject) => reject('Node环境不支持Popup'));
  }

  getURLForExtensionFile(file) {
    file = this.path.normalize(file);
    if (file.indexOf('..') !== -1) {
      throw 'illegal path: ' + file;
    }
    return this.path.resolve(file);
  }

  createNotifications(id, iconUrl, title, message, imageUrl) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Notification');
    }
    return new Promise((_, reject) => reject('Node环境不支持Notification'));
  }

  addNotificationClickListener(listener) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Notification');
    }
  }

  addIconClickListener(listener) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持扩展图标');
    }
  }

  createTab(url) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Tab');
    }
    return new Promise((_, reject) => reject('Node环境不支持Tab'));
  }

  createWindow(url, type, width, height) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Window');
    }
    return new Promise((_, reject) => reject('Node环境不支持Window'));
  }

  removeWindow(windowId) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Window');
    }
    return new Promise((_, reject) => reject('Node环境不支持Window'));
  }

  download(url, filename, saveAs) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Download');
    }
    return new Promise((_, reject) => reject('Node环境不支持Download'));
  }

  addInstallListener(listener) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Install Listener');
    }
  }
}
