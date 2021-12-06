import ChromePlatform from './ChromePlatform';
import { PLATFORM_EDGE, DEBUG_LOG } from '../../Constants';
import AbstractPlatform from '../AbstractPlatform';

const IGNORE_MESSAGE_ERROR_1 = 'Could not establish connection. Receiving end does not exist.';
const IGNORE_MESSAGE_ERROR_2 = 'The message port closed before a response was received.';

// 根据MDN中的兼容性表格中的说明，Edge会将message发给同一个页面的onMessageListener，因此在每个页面生成一个唯一id，接收时过滤掉相同页面的消息
// https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage#browser_compatibility
const _pageId = String(Math.floor(Math.random() * 1000000));

/**
 * 由于Edge内核是chromium，因此所有行为直接调用ChromePlatform，仅特殊部分进行单独处理
 */
export default class EdgePlatform extends AbstractPlatform {

    defPlatform;

    constructor() {
        super();
        this.defPlatform = new ChromePlatform();
    }

    get PlatformType() {
        return PLATFORM_EDGE;
    }

    sendMessage(type, data) {
        if (DEBUG_LOG) {
            console.log(`sendMessage - ${type}`);
            console.log(data || 'no-data');
        }
        const message = { type: type, page: _pageId };
        if (data) {
            message.data = data;
        }

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    if (chrome.runtime.lastError.message === IGNORE_MESSAGE_ERROR_1
                        || chrome.runtime.lastError.message === IGNORE_MESSAGE_ERROR_2) {
                        if (DEBUG_LOG) {
                            console.log(`response - ${type} - receiver not exists`);
                        }
                        resolve();
                    } else {
                        reject(chrome.runtime.lastError);
                    }
                    return;
                }
                if (response === AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE) {
                    resolve();
                    return;
                }
                if (DEBUG_LOG) {
                    console.log(`response - ${type}`);
                    console.log(response);
                }
                resolve(response);
            });
        });
    }

    addMessageListener(id, type, listener) {
        return chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            let value;

            if (message.page !== _pageId && (!type || message.type === type)) {
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
                    // Chromium内核中必须用return true的方式进行异步返回，不支持直接返回Promise
                    // 参考兼容性表格：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
                    sendResponse(value);
                    if (value.constructor === Promise) {
                        return true;
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

    // 以下为defPlatform的代理方法

    get isBackground() {
        return this.defPlatform.isBackground;
    }

    get isMobile() {
        return this.defPlatform.isMobile;
    }

    getAllWindow() {
        return this.defPlatform.getAllWindow();
    }

    getLocalStorage(name) {
        return this.defPlatform.getLocalStorage(name);
    }

    saveLocalStorage(name, data) {
        return this.defPlatform.saveLocalStorage(name, data);
    }

    setPopup(url) {
        return this.defPlatform.setPopup(url);
    }

    getURLForExtensionFile(file) {
        return this.defPlatform.getURLForExtensionFile(file);
    }

    createNotifications(id, iconUrl, title, message, imageUrl) {
        return this.defPlatform.createNotifications(id, iconUrl, title, message, imageUrl);
    }

    addNotificationClickListener(listener) {
        return this.defPlatform.addNotificationClickListener(listener);
    }

    addIconClickListener(listener) {
        return this.defPlatform.addIconClickListener(listener);
    }

    createTab(url) {
        return this.defPlatform.createTab(url);
    }

    createWindow(url, type, width, height, state) {
        return this.defPlatform.createWindow(url, type, width, height, state);
    }

    removeWindow(windowId) {
        return this.defPlatform.removeWindow(windowId);
    }

    updateWindow(winId, width, height) {
        return this.defPlatform.updateWindow(winId, width, height);
    }

    download(url, filename, saveAs) {
        return this.defPlatform.download(url, filename, saveAs);
    }

    addInstallListener(listener) {
        return this.defPlatform.addInstallListener(listener);
    }

    sendHttpRequest(url, method) {
        return this.defPlatform.sendHttpRequest(url, method);
    }

    setBadgeText(text) {
        return this.defPlatform.setBadgeText(text);
    }

    setBadgeBackgroundColor(color) {
        return this.defPlatform.setBadgeBackgroundColor(color);
    }
    getHtmlParser() {
        return this.defPlatform.getHtmlParser();
    }
}
