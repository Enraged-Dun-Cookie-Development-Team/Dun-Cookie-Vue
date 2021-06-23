import StorageUtil from './StorageUtil';
import BrowserUtil from './BrowserUtil';
import {BROWSER_CHROME, BROWSER_FIREFOX, BROWSER_MOBILE_PHONE, MESSAGE_SETTINGS_UPDATE} from './Constants';
import {deepAssign} from './TmpUtil';

class Settings {
  // 插件初始化的时间
  initTime = new Date().getTime();
  source = [];

  /**
   * 蹲饼相关配置
   */
  dun = {
    /**
     * 是否启用通知推送(电脑右下角和通知栏的推送信息)
     */
    enableNotice: true,
    /**
     * 间隔时间(秒)
     */
    intervalTime: 15,
    /**
     * 是否启用低频模式(按时段自动进入/退出)
     */
    autoLowFrequency: false,
    /**
     * 低频模式时段
     * <p>
     * idx0 为起始时间(小时)<br/>
     * idx1 为结束时间(小时)<br/>
     * 只支持在当天12点到第二天12点范围内取值<br/>
     * 内部取值范围为0-24，0-11代表当天12点到当天23点，12-24代表第二天0点到第二天12点
     */
    lowFrequencyTime: [8, 20],
    /**
     * 是否显示转发的饼
     */
    showRetweet: true,
    /**
     * 对只有日期没有时间的饼的排序方式
     * <p>
     * 1 将饼视为00:00:00发送的处理<br/>
     * 2 将饼视为23:59:59发送的处理
     */
    sortModeForOnlyDate: 1,
  }

  /**
   * 显示相关配置
   */
  display = {
    /**
     * 字体大小
     * <p>
     * -1 小
     * 0 正常
     * 1 大
     * 2 特别大
     */
    fontSize: 0,
    /**
     * 将弹出菜单改为打开单独窗口
     */
    windowMode: false,
    /**
     * 夜间模式
     * <p>
     * 0 持续日间模式<br/>
     * 1 持续夜间模式<br/>
     * -1 18点到6点期间自动切换夜间模式，其它时候日间模式<br/>
     */
    darkMode: 0,
    /**
     * 是否显示饼的图片
     */
    showImage: true,
    /**
     * 按标签显示饼！
     */
    showByTag: false,
    /**
     * 默认显示的标签
     */
    defaultTag: null,
  }

  /**
   * 特性开关
   */
  feature = {
    /**
     * 是否允许更改设置
     */
    options: true,
    /**
     * 是否允许启用windowMode
     * @see display.windowMode
     */
    window: true,
    /**
     * 是否启用理智计算(自动提醒)
     */
    san: true,
  }

  /**
   * 理智设置
   */
  san = {
    /**
     * 是否在理智满的时候推送提示信息
     */
    noticeWhenFull: true,
    /**
     * 理智上限
     */
    maxValue: 135
  }

  /**
   * 获取颜色主题
   * <p>
   * 这里不使用getter的写法以避免被序列化
   * @see display.darkMode
   */
  getColorTheme() {
    const hour = new Date().getHours();
    if (this.display.darkMode === 1
      || (this.display.darkMode === -1 && (hour >= 18 || hour < 6))) {
      return 'dark';
    } else {
      return 'light';
    }
  }

  /**
   * 检查当前是否在低频模式时段内
   */
  checkLowFrequency() {
    if (!settings.dun.autoLowFrequency) {
      return false;
    }
    let currentHour = new Date().getHours();
    const time = this.dun.lowFrequencyTime;
    const starHour = time[0] < 12 ? time[0] + 12 : time[0] - 12;
    const endHour = time[1] < 12 ? time[1] + 12 : time[1] - 12;
    return currentHour >= starHour || currentHour < endHour;
  }

  /**
   * @see dun.sortModeForOnlyDate
   */
  getTimeBySortMode() {
    switch (this.dun.sortModeForOnlyDate) {
      case 1: return '23:59:59';
      case 2: return '00:00:00';
      default: throw `unknown sort mode ${this.dun.sortModeForOnlyDate}`;
    }
  }

  constructor() {
    BrowserUtil.addMessageListener('settings', MESSAGE_SETTINGS_UPDATE, data => deepAssign(this, data));
    this.reloadSettings().then(() => {
      // 这部分主要是初始化一些固定的配置信息，只需要初始化的时候执行一次

      // 特定的浏览器需要无视用户配置强行禁用某些功能
      switch (BrowserUtil.browserType) {
        case BROWSER_CHROME:
          break;
        case BROWSER_FIREFOX: {
          this.feature.options = false;
          this.feature.window = false;
          this.feature.san = false;
          break;
        }
        case BROWSER_MOBILE_PHONE: {
          this.feature.window = false;
          break;
        }
        default: {
          this.feature.window = false;
          break;
        }
      }
      // 根据被禁用的功能强行关闭配置
      // 虽然理论上应该保证被禁用的功能不会被用户开启，但是保险起见这里还是再设置一下
      if (!this.feature.window) {
        this.display.windowMode = false;
      }
    });
  }

  /**
   * 修改配置，内部使用deepAssign来进行修改
   * TODO 这个方法理应被优化掉
   */
  setAll(data) {
    deepAssign(this, data);
  }

  /**
   * 将配置储存到localStorage中。
   * <p>
   * 该方法会自动发送message通知其它页面更新配置<br/>
   * 返回的Promise可以不调用then()
   * @return {Promise}
   */
  saveSettings() {
    return StorageUtil.saveLocalStorage('settings', this)
      .then(() => BrowserUtil.sendMessage(MESSAGE_SETTINGS_UPDATE, this));
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
          deepAssign(this, value);
        }
        return this;
      });
  }
}

const settings = new Settings()
export {settings};