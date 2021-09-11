import {PLATFORM_FIREFOX, DEBUG_LOG} from '../../Constants';
import AbstractPlatform from '../AbstractPlatform';

let _isBackground;
let _isMobile;

export default class FirefoxPlatform extends AbstractPlatform {

    constructor() {
        super();
        // 这部分放在类里面的原因是放在外面会被意外执行导致报错
        // 判断当前url中是否包含background(已知的其它方法都是Promise，都不能保证在isBackground被使用之前完成判断)
        _isBackground = window.document.URL.indexOf('background') !== -1;
        console.log(`Current isBackground: ${_isBackground}`);

        const head = navigator.userAgent;
        _isMobile = head.indexOf("Android") > 1 || head.indexOf("iPhone") > 1;
    }

    get isBackground() {
        return _isBackground;
    }

    get isMobile() {
        return _isMobile;
    }

    get PlatformType() {
        return PLATFORM_FIREFOX;
    }

    getAllWindow() {
        return browser.windows.getAll();
    }

    getLocalStorage(name) {
        return browser.storage.local.get(name).then(result => {
            if (typeof name === 'string') {
                result = result[name];
            }
            return result;
        });
    }

    saveLocalStorage(name, data) {
        const val = {};
        val[name] = data;
        return browser.storage.local.set(val);
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

        return browser.runtime.sendMessage(message).then(response => {
            if (response === AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE) {
                return;
            }
            if (DEBUG_LOG) {
                console.log(`response - ${type}`);
                console.log(response);
            }
            return response;
        });
    }

    addMessageListener(id, type, listener) {
        return browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            let value;

            if (!type || message.type === type) {
                if (DEBUG_LOG) {
                    console.log(`${id} - ${type} - receiverMessage`);
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
                    // 根据W3C规范，异步回复消息应该直接返回Promise
                    // 参考文档：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
                    if (value.constructor === Promise) {
                        return value;
                    } else {
                        sendResponse(value);
                    }
                } else {
                    if (DEBUG_LOG) {
                        console.log(`${id} - ${type}|${message.type} - receiverMessage - responseEmpty`);
                    }
                    // 必须要返回点什么东西来避免报错
                    sendResponse(AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE);
                }
            }
        });
    }

    setPopup(url) {
        return new Promise((resolve, reject) => {
            // 虽然不知道为啥Firefox这个不返回Promise，但是Firefox文档里这个确实没写返回值
            browser.browserAction.setPopup({popup: url});
            resolve();
        });
    }

    getURLForExtensionFile(file) {
        return browser.runtime.getURL(file);
    }

    createNotifications(id, iconUrl, title, message, imageUrl) {
        var options = {
            type: 'basic',
            iconUrl: iconUrl,
            message: message,
            title: title,
        };
        // Firefox暂时不支持image类型的通知，参考：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications/TemplateType
        return browser.notifications.create(id, options);
    }

    addNotificationClickListener(listener) {
        return browser.notifications.onClicked.addListener(listener);
    }

    addIconClickListener(listener) {
        return browser.browserAction.onClicked.addListener((tab, OnClickData) => {
            // 忽略OnClickData是为了和Chrome的行为一致(准确来讲应该是和AbstractPlatform中注释规定的行为一致)
            return listener(tab);
        });
    }

    createTab(url) {
        return browser.tabs.create({url: url});
    }

    createWindow(url, type, width, height, state) {
        const $this = this;
        return new Promise((resolve, reject) => {
            browser.windows.getCurrent().then(win => {
                const createData = $this.__buildCreateData(win, url, type, width, height, state);
                browser.windows.create(createData).then(resolve).catch(reject);
            });
        });
    }

    removeWindow(windowId) {
        return browser.windows.remove(windowId);
    }

    updateWindow(winId, width, height) {
        return browser.windows.update(winId, {width, height});
    }

    download(url, filename, saveAs) {
        var options = {
            url: url
        };
        if (filename && typeof filename === 'string') {
            options.filename = filename;
        }
        if (typeof saveAs === 'boolean') {
            // 安卓版的Firefox不能提供saveAs=true，否则会报错，参考：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
            if (!this.isMobile || !saveAs) {
                options.saveAs = saveAs;
            }
        }
        return browser.downloads.download(options);
    }

    addInstallListener(listener) {
        return browser.runtime.onInstalled.addListener(listener);
    }

    sendHttpRequest(url, method) {
        return super.__sendXhrRequest(url, method);
    }

    setBadgeText(text) {
        return browser.browserAction.setBadgeText({text: text});
    }

    setBadgeBackgroundColor(color) {
        return browser.browserAction.setBadgeBackgroundColor({color: color});
    }
}
