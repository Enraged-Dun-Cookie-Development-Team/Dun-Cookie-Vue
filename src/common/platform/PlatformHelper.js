import ChromePlatform from './ChromePlatform';

/**
 * @type AbstractPlatform
 */
let currentPlatform;
// TODO 在这里做浏览器检测并使用相应的子类
//  需要注意的是，如果在这里初始化的话AbstractPlatform的子类不应该引用PlatformHelper，否则会造成循环依赖。
//  如果必须子类必须要依赖PlatformHelper的话，大概率是设计不当
currentPlatform = new ChromePlatform();

// 将API分类整理
const messageHelper = new MessageHelper(currentPlatform);
const storageHelper = new StorageHelper(currentPlatform);

/**
 * 帮助类，本文件相关方法的所有注释可参考AbstractPlatform
 */
export default class PlatformHelper {

  static get isBackground() { return currentPlatform.isBackground; };

  static get platformType() {
    return currentPlatform.platformType;
  }

  static get Message() {
    return messageHelper;
  }

  static get Storage() {
    return storageHelper;
  }
}

class MessageHelper {
  /**
   * @type AbstractPlatform
   */
  platform;

  constructor(platform) {
    this.platform = platform;
  }

  send(type, data) {
    return this.platform.sendMessage(type, data);
  }

  registerListener(id, type, listener) {
    return this.platform.addMessageListener(id, type, listener);
  }
}

class StorageHelper {
  /**
   * @type AbstractPlatform
   */
  platform;

  constructor(platform) {
    this.platform = platform;
  }

  getLocalStorage(name) {
    return this.platform.getLocalStorage(name);
  }

  saveLocalStorage(name, data) {
    return this.platform.saveLocalStorage(name, data);
  }
}
