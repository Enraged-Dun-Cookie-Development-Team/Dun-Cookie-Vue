import AbstractPlatform from '../AbstractPlatform';
import {DEBUG_LOG, PLATFORM_NODE} from '../../Constants';
import {deepAssign} from '../../util/CommonFunctions';

const storageFile = 'storage.json';

function node_require(module) {
  // 使用eval是为了避免被webpack给优化掉
  return eval(`require("${module}")`);
}

export default class NodePlatform extends AbstractPlatform {
  // 这部分放在类里面的原因是放在外面会被意外执行导致报错
  fs = node_require('fs/promises');
  path = node_require('path');
  http = node_require('http');
  https = node_require('https');
  worker_threads;
  workerParent;

  constructor() {
    super();
    this.worker_threads = node_require('worker_threads');
    this.workerParent = this.worker_threads.parentPort;
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

  getAllWindow() {
    return Promise.reslove([]);
  }

  async getLocalStorage(name) {
    const file = await this.fs.open(storageFile, 'w+');
    const content = await file.readFile('UTF-8') || '{}';
    await file.close();
    const json = JSON.parse(content);
    if (!name) {
      return json;
    } else if (typeof name === 'string') {
      return json[name];
    } else if (Array.isArray(name)) {
      const result = {};
      for (const key of name) {
        if (key !== undefined && typeof json[key] !== undefined) {
          result[key] = json[key]
        }
      }
      return result;
    } else {
      const result = deepAssign({}, name);
      for (const key in name) {
        if (name.hasOwnProperty(key)) {
          if (key !== undefined && typeof json[key] !== undefined) {
            result[key] = json[key]
          }
        }
      }
      return result;
    }
  }

  async saveLocalStorage(name, data) {
    const current = await this.getLocalStorage();
    current[name] = data;
    return await this.fs.writeFile(storageFile, JSON.stringify(current), 'UTF-8');
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
      this.workerParent.postMessage(message);
      resolve('Node环境暂不支持响应消息');
    });
  }

  addMessageListener(id, type, listener) {
    this.workerParent.on('message', (message) => {
      let value;

      if (!type || message.type === type) {
        if (DEBUG_LOG) {
          console.log(`${id} - ${type}|${message.type} - receiverMessage`);
          console.log(message);
        }
        if (!type) {
          value = listener(message);
        } else {
          value = listener(message.data);
        }

        if (value !== null && value !== undefined) {
          if (DEBUG_LOG) {
            console.log(`${id} - ${type}|${message.type} - receiverMessage - response`);
            console.log(value);
          }
          if (value.constructor === Promise) {
            value.then(result => this.workerParent.postMessage(result));
          } else {
            this.workerParent.postMessage(value);
          }
        } else {
          if (DEBUG_LOG) {
            console.log(`${id} - ${type}|${message.type} - receiverMessage - responseEmpty`);
          }
        }
      }
    });
  }

  setPopup(url) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Popup');
    }
    // 无事发生
    return new Promise((resolve, _) => resolve());
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
    // 无事发生
    return new Promise((resolve, _) => resolve());
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
    // 无事发生
    return new Promise((resolve, _) => resolve());
  }

  createWindow(url, type, width, height) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Window');
    }
    // 无事发生
    return new Promise((resolve, _) => resolve());
  }

  removeWindow(windowId) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Window');
    }
    // 无事发生
    return new Promise((resolve, _) => resolve());
  }

  download(url, filename, saveAs) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Download');
    }
    // 无事发生
    return new Promise((resolve, _) => resolve());
  }

  addInstallListener(listener) {
    if (DEBUG_LOG) {
      console.log('Node环境不支持Install Listener');
    }
  }

  sendHttpRequest(url, method) {
    return new Promise((resolve, reject) => {
      const options = {
        method: method,
      };
      let web;
      if (url.indexOf('https') === 0) {
        web = this.https;
      } else {
        web = this.http;
      }

      const req = web.request(url, options, (res) => {
        if (res.statusCode === 200) {
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            try {
              resolve(rawData);
            } catch (e) {
              reject(e.message);
            }
          });
        } else {
          reject(`status: ${res.statusCode}`);
          res.resume();
        }
      });

      req.on('error', reject);
      req.end();
    });
  }
}
