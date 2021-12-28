import ChromePlatform from './ChromePlatform';
import { PLATFORM_UNKNOWN } from '../../Constants';
import AbstractPlatform from '../AbstractPlatform';

/**
 * 鉴于之前用Chrome在各平台一直没啥问题，因此未知平台的所有行为直接调用ChromePlatform
 */
export default class UnknownPlatform extends AbstractPlatform {

    defPlatform;

    constructor() {
        super();
        this.defPlatform = new ChromePlatform();
    }

    get PlatformType() {
        return PLATFORM_UNKNOWN;
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

    sendMessage(type, data) {
        return this.defPlatform.sendMessage(type, data);
    }

    addMessageListener(id, type, listener) {
        return this.defPlatform.addMessageListener(id, type, listener);
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

    loadImages(obj) {
        return this.defPlatform.loadImages(obj);
    }
}
