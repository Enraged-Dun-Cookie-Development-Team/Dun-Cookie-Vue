
// 其实这玩意不是很有必要提取成常量，但是提取了也没坏处(至少修改起来比较方便)
const unsupportedTip = "该平台未实现该接口！请联系[小刻食堂]开发者解决该问题";

// TODO 实现子类时，如果是callback的方法(Chrome v2)，务必检查runtime.lastError。如果是Promise的方法(Chrome v3、Firefox)，务必catch。
//  所有接口的返回值务必使用Promise(catch放在哪里的问题可以再考虑)
//  当所有接口检查过确认进行了上述的错误处理后，才能删掉这条TODO
/**
 * 抽象平台.
 * <p>
 * 需要注意的是：如果是无法实现的接口，也应由子类主动实现一个空方法，如果子类不实现就会抛异常，这种设计的目的是为了避免子类忘记实现接口(所以说js没有抽象方法真的惨)
 */
class AbstractPlatform {

  /**
   * 是否是后台线程(后台线程应该有且只有一个，尽量将需要计算的内容都放入后台线程)
   * @return boolean
   */
  get isBackground() { throw unsupportedTip; };

  /**
   * 浏览器类型
   * @return string
   */
  get platformType() { throw unsupportedTip; };

  /**
   * 获取本地储存中的内容
   * @param {string|string[]|object} name
   * @return Promise
   */
  getLocalStorage(name) { throw unsupportedTip; };

  /**
   * 将数据储存到本地
   * @param {string} name
   * @param data
   * @return Promise
   */
  saveLocalStorage(name, data) { throw unsupportedTip; };

  // TODO 根据MDN中的兼容性表格中的说明，Edge会将message发给同一个页面的onMessageListener，实现Edge兼容时需要考虑进行特殊处理(比如在每个页面生成一个唯一id，接收时进行判断)
  // https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage#browser_compatibility
  sendMessage(type, data) { throw unsupportedTip; };

  /**
   * 监听message
   * @param id 监听器ID，暂时的用途只有调试输出
   * @param type 如果不提供type或者type为false则监听所有信息，否则只监听对应type的信息
   * @param listener 监听器，接收一个参数处理信息
   */
  addMessageListener(id, type, listener) { throw unsupportedTip; };

  setPopup(detail) { throw unsupportedTip; };

  getExtensionURL(file) { throw unsupportedTip; };

  createNotifications(id, iconUrl, title, message, imageUrl) { throw unsupportedTip; };

  addNotificationClickListener(listener) { throw unsupportedTip; };

  /**
   * 监听浏览器中的插件图标点击事件。
   * <p>
   * <strong>注意：当设置了弹出菜单的时候不会触发监听器</strong>
   */
  addIconClickListener(listener) { throw unsupportedTip; };

  /**
   * 在新标签页中打开扩展插件的内置页面
   */
  createExtensionTab(url) { throw unsupportedTip; };

  /**
   * 在新标签页中打开指定url
   */
  createTab(url) { throw unsupportedTip; };

  createWindow(url, type, width, height) { throw unsupportedTip; };

  removeWindow(windowId) { throw unsupportedTip; };

  /**
   * 下载指定url的内容
   * // TODO 实现Firefox For Android的时候需要注意，安卓版的Firefox不能提供saveAs=true，否则会报错，参考 https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
   * @param url 目标url
   * @param filename 文件名，如果传入空字符串或者非string类型的值则使用浏览器默认的文件名
   * @param saveAs 是否提供文件选择对话框，true->提供，false->不提供，非boolean类型的值->使用浏览器默认设置
   * @return Promise
   */
  download(url, filename, saveAs) { throw unsupportedTip; };

  addInstallListener(listener) { throw unsupportedTip; };
}

