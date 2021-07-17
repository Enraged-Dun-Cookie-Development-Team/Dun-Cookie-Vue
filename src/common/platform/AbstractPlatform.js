/**
 * 抽象平台
 */
class AbstractPlatform {

  /**
   * 是否是后台进程
   * @return boolean
   */
  get isBackground() { throw "unsupported"; };

  /**
   * 浏览器类型
   * @return string
   */
  get platformType() { throw "unsupported"; };

  /**
   * 获取本地储存中的内容
   * @param {string|string[]|object} name
   * @return Promise
   */
  getLocalStorage(name) { throw "unsupported"; };

  /**
   * 将数据储存到本地
   * @param {string} name
   * @param data
   * @return Promise
   */
  saveLocalStorage(name, data) { throw "unsupported"; };

  // TODO 根据MDN中的兼容性表格中的说明，Edge会将message发给同一个页面的onMessageListener，实现Edge兼容时需要考虑进行特殊处理(比如在每个页面生成一个唯一id，接收时进行判断)
  // https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage#browser_compatibility
  sendMessage(type, data) { throw "unsupported"; };

  /**
   * 监听message
   * @param id 监听器ID，暂时的用途只有调试输出
   * @param type 如果不提供type或者type为false则监听所有信息，否则只监听对应type的信息
   * @param listener 监听器，接收一个参数处理信息
   */
  addMessageListener(id, type, listener) { throw "unsupported"; };

  setPopup(detail) { throw "unsupported"; };

  getExtensionURL(file) { throw "unsupported"; };

  createNotifications(id, options) { throw "unsupported"; };

  addNotificationClickListener(listener) { throw "unsupported"; };

  addInstallListener(listener) { throw "unsupported"; };

  /**
   * 监听浏览器中的插件图标点击事件。
   * <p>
   * <strong>注意：当设置了弹出菜单的时候不会触发监听器</strong>
   */
  addIconClickListener(listener) { throw "unsupported"; };

  /**
   * 在新标签页中打开扩展插件的内置页面
   */
  createExtensionTab(url) { throw "unsupported"; };

  /**
   * 在新标签页中打开指定url
   */
  createTab(url) { throw "unsupported"; };

  createWindow(createData) { throw "unsupported"; };

  removeWindow(windowId) { throw "unsupported"; };

  downloadFile(options, callback) { throw "unsupported"; };
}

