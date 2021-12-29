import AbstractPlatform from '../AbstractPlatform';
import { DEBUG_LOG, PLATFORM_NODE } from '../../Constants';
import { deepAssign } from '../../util/CommonFunctions';

const storageFile = 'storage.json';

function node_require(module) {
    // 使用eval是为了避免被webpack给优化掉
    return eval(`require("${module}")`);
}

export default class NodePlatform extends AbstractPlatform {
    // 这部分放在类里面的原因是放在外面会被意外执行导致报错
    fs = node_require('fs/promises');
    fs_callback = node_require('fs');
    path = node_require('path');
    http = node_require('http');
    https = node_require('https');
    worker_threads;
    workerParent;

    weiboCookie;

    constructor() {
        super();
        this.worker_threads = node_require('worker_threads');
        this.workerParent = this.worker_threads.parentPort;
        this.getLocalStorage("weiboCookie").then(value => this.weiboCookie = value);
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
        const file = await this.fs.open(storageFile, this.fs_callback.constants.O_RDONLY | this.fs_callback.constants.O_CREAT);
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

    storageSaveLock = false

    async saveLocalStorage(name, data) {
        const current = await this.getLocalStorage();
        current[name] = data;
        while (this.storageSaveLock) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        this.storageSaveLock = true;
        const result = await this.fs.writeFile(storageFile, JSON.stringify(current), 'UTF-8');
        this.storageSaveLock = false;
        return result;
    }

    sendMessage(type, data) {
        const message = super.__buildMessageToSend(type, data);

        return new Promise((resolve, reject) => {
            this.workerParent.postMessage(message);
            resolve('Node环境暂不支持响应消息');
        });
    }

    addMessageListener(id, type, listener) {
        this.workerParent.on('message', (message) => {
            const value = super.__handleReceiverMessage(type, message, listener);
            if (value !== undefined) {
                if (value.constructor === Promise) {
                    value.then(result => this.workerParent.postMessage({ type: message.type, data: result }));
                } else {
                    this.workerParent.postMessage({ type: message.type, data: value });
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

    createWindow(url, type, width, height, state) {
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

    updateWindow(winId, width, height) {
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
            if (this.weiboCookie && url.indexOf("weibo") !== -1) {
                options.headers = {
                    'Cookie': this.weiboCookie
                }
            }
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

    setBadgeText(text) {
        if (DEBUG_LOG) {
            console.log('Node环境不支持Badge');
        }
        // 无事发生
        return new Promise((resolve, _) => resolve());
    }

    setBadgeBackgroundColor(color) {
        if (DEBUG_LOG) {
            console.log('Node环境不支持Badge');
        }
        // 无事发生
        return new Promise((resolve, _) => resolve());
    }

    getHtmlParser() {
        const { JSDOM } = node_require('jsdom');
        const { window } = new JSDOM("");
        return node_require('jquery')(window);
    }

    generateShareImage(dataItem, imageUrl) {
        if (DEBUG_LOG) {
            console.log('Node环境暂不支持生成图片');
        }
        // 无事发生
        return new Promise((resolve, _) => resolve());
    }
}
