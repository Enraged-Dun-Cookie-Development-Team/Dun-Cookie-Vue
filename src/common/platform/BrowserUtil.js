import PlatformHelper from './PlatformHelper';

/**
 * 浏览器工具。
 * <p>
 * TODO 实现不同平台浏览器类型的独特接口，并在完成后删除本类，所有外部调用都改用PlatformHelper
 * <br>
 * TODO 还有一些存在于其它文件中的chrome调用，也要记得处理(如果是注释可以直接删掉)
 */
class BrowserUtil {

  static get isBackground() { return PlatformHelper.isBackground; };

  static get browserType() {
    return PlatformHelper.PlatformType;
  }

  static getLocalStorage(name) {
    return PlatformHelper.Storage.getLocalStorage(name);
  }

  static saveLocalStorage(name, data) {
    return PlatformHelper.Storage.saveLocalStorage(name, data);
  }

  static sendMessage(type, data) {
    return PlatformHelper.Message.send(type, data);
  }

  static addMessageListener(id, type, listener) {
    return PlatformHelper.Message.registerListener(id, type, listener);
  }

  static setPopup(detail) {
    return PlatformHelper.BrowserAction.setPopupURL(detail.popup);
  }

  static getExtensionURL(file) {
    return PlatformHelper.Extension.getURL(file);
  }

  static addNotificationClickListener(listener) {
    return PlatformHelper.Notification.addClickListener(listener);
  }

  static addIconClickListener(listener) {
    return PlatformHelper.BrowserAction.addIconClickListener(listener);
  }

  static createExtensionTab(file) {
    return PlatformHelper.Tabs.createWithExtensionFile(file);
  }

  static createTab(url) {
    return PlatformHelper.Tabs.create(url);
  }

  static addInstallListener(listener) {
    return PlatformHelper.Lifecycle.addInstalledListener(listener);
  }
}

export default BrowserUtil;
