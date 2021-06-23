import BrowserUtil from '../BrowserUtil';
import StorageUtil from '../StorageUtil';
import TimeUtil from '../TimeUtil';
import {settings} from '../Settings';
import {MESSAGE_SAN_GET, MESSAGE_SAN_UPDATE, SAN_RECOVERY_SPEED} from '../Constants';
import {deepAssign} from '../TmpUtil';

class SanInfo {
  /**
   * 当前理智值
   */
  __currentSan = settings.san.maxValue;
  /**
   * 当前理智更新时间
   */
  updateTime = new Date().getTime();

  set currentSan(san) {
    this.__currentSan = san;
    this.updateTime = new Date().getTime();
  }

  get currentSan() {
    return this.__currentSan;
  }

  constructor() {
    this.loadFromStorage();
    BrowserUtil.sendMessage(MESSAGE_SAN_GET).then(data => {
      deepAssign(this, data);
    });
    BrowserUtil.addMessageListener('sanInfo', MESSAGE_SAN_UPDATE, (message) => {
      deepAssign(this, message);
    })
  }

  calcRemainingTime() {
    if (this.currentSan >= settings.san.maxValue) {
      return '已经回满';
    }
    const endTime = new Date(new Date().getTime() + (settings.san.maxValue - this.currentSan) * SAN_RECOVERY_SPEED);

    // 由于理智回满最多13个小时多，所以只可能是今天或明天回满
    const tomorrow = endTime.getDay() !== new Date(this.updateTime).getDay() ? '明天' : '';

    return `预计${tomorrow}${TimeUtil.format(endTime, 'hh:mm')}回满，剩${TimeUtil.calcDiff(this.updateTime, endTime)}`;
  }

  saveUpdate() {
    StorageUtil.saveLocalStorage('san', this);
    BrowserUtil.sendMessage(MESSAGE_SAN_UPDATE, this);
  }

  loadFromStorage() {
    StorageUtil.getLocalStorage('san').then(data => {
      if (data) {
        deepAssign(this, data);
      }
    });
  }

}
const instance = new SanInfo();
export default instance;
