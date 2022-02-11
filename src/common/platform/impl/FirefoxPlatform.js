import {PLATFORM_FIREFOX} from '../../Constants';
import BrowserPlatform from "./BrowserPlatform";

export default class FirefoxPlatform extends BrowserPlatform {

    constructor() {
        super();
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
        const message = this.__buildMessageToSend(type, data);

        return browser.runtime.sendMessage(message).then(response => {
            return this.__transformResponseMessage(type, response);
        }).catch(err => {
            if (this.__shouldIgnoreMessageError(err.message)) {
                return;
            }
            return Promise.reject(err);
        });
    }

    addMessageListener(id, type, listener) {
        return browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const value = this.__handleReceiverMessage(id, type, message, listener);
            if (value !== undefined) {
                // 根据W3C规范，异步回复消息应该直接返回Promise
                // 参考文档：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
                if (value.constructor === Promise) {
                    return value;
                } else {
                    sendResponse(value);
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

    setBadgeText(text) {
        return browser.browserAction.setBadgeText({text: text});
    }

    setBadgeBackgroundColor(color) {
        return browser.browserAction.setBadgeBackgroundColor({color: color});
    }

}
