import StorageUtil from './StorageUtil';
import BrowserUtil from './BrowserUtil';

class Settings {
  time = 15;
  source = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  fontsize = 0;
  imgshow = true;
  isTag = false;
  tagActiveName = null;
  isTop = true;
  isPush = true;
  darkshow = 0;// 黑暗模式按钮
  outsideClass = "light";// 默认白天
  lowfrequency = false;// 低频模式按钮
  lowfrequencyTime = [8, 20];// 低频模式时段 需要转换
  islowfrequency = false; // 是否正处于低频模式状态下
  retweeted = true;// 是否查看转发
  sanShow = true; //是否需要理智提醒
  saneMax = 135;//理智上限
  isWindow = false;

  constructor() {
    this.reloadSettings();
  }

  /**
   * 修改配置，内部使用Object.assign来进行修改
   * TODO 这个方法理应被优化掉
   */
  setAll(data) {
    Object.assign(this, data);
  }

  /**
   * 将配置储存到localStorage中。
   * <p>
   * 返回的Promise可以不调用then()
   * @return {Promise}
   */
  saveSettings() {
    return StorageUtil.saveLocalStorage('settings', this).then(() => BrowserUtil.sendMessage({info: "setting"}));
  }

  /**
   * 从localStorage中读取配置。
   * <p>
   * localStorage中有的配置会覆盖现有配置，localStorage中没有的配置会继续使用现有配置
   * <br/>
   * 返回的Promise可以不调用then()
   * @return {Promise<Settings>}
   */
  reloadSettings() {
    return StorageUtil.getLocalStorage('settings')
      .then(value => {
        if (value != null) {
          Object.assign(this, value);
        }
        return this;
      });
  }
}

const settings = new Settings()
export {settings};
