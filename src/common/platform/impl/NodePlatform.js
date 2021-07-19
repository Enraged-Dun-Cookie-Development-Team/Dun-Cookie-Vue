import AbstractPlatform from '../AbstractPlatform';
import {PLATFORM_NODE} from '../../Constants';
import {deepAssign} from '../../util/CommonFunctions';

const storageFile = 'storage.json';

export default class NodePlatform extends AbstractPlatform {
  // 这部分放在类里面的原因是我不知道放在外面会不会被意外执行导致报错
  fs = require("fs");

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
    super.saveLocalStorage(name, data);
  }

  sendMessage(type, data) {
    super.sendMessage(type, data);
  }

  addMessageListener(id, type, listener) {
    super.addMessageListener(id, type, listener);
  }

  setPopup(url) {
    super.setPopup(url);
  }

  getURLForExtensionFile(file) {
    super.getURLForExtensionFile(file);
  }

  createNotifications(id, iconUrl, title, message, imageUrl) {
    super.createNotifications(id, iconUrl, title, message, imageUrl);
  }

  addNotificationClickListener(listener) {
    super.addNotificationClickListener(listener);
  }

  addIconClickListener(listener) {
    super.addIconClickListener(listener);
  }

  createTab(url) {
    super.createTab(url);
  }

  createWindow(url, type, width, height) {
    super.createWindow(url, type, width, height);
  }

  removeWindow(windowId) {
    super.removeWindow(windowId);
  }

  download(url, filename, saveAs) {
    super.download(url, filename, saveAs);
  }

  addInstallListener(listener) {
    super.addInstallListener(listener);
  }
}
