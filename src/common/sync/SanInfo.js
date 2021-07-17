import BrowserUtil from '../platform/BrowserUtil';
import TimeUtil from '../util/TimeUtil';
import Settings from '../Settings';
import {
  DEBUG_LOG,
  MESSAGE_SAN_GET,
  MESSAGE_SAN_UPDATE,
  MESSAGE_SETTINGS_UPDATE,
  SAN_RECOVERY_SPEED
} from '../Constants';
import { deepAssign } from '../util/CommonFunctions';
import NotificationUtil from '../util/NotificationUtil';

// region 理智计算(自动提醒)

let sanTimerId = null;
// 理智计算流程：
// 在弹出页面点击"开始计算"会启动理智计算，当理智满了之后才会停止
// 在设置页面重新设置理智最大值后，会停止理智计算
// 在插件重启后如果之前理智计算是启动的则会尝试恢复理智计算
// 需要注意的是：目前san-update代表当前理智的相关信息修改，而settings-update代表可能有最大理智相关信息修改

function sanRecovery(san) {
  san.currentSan++;
  if (san.currentSan >= Settings.san.maxValue) {
    san.currentSan = Settings.san.maxValue;
    NotificationUtil.SendNotice(`理智已满`, `理智已经满了，请博士赶快上线清理智！`, null, new Date().getTime());
    clearTimeout(sanTimerId);
    sanTimerId = null;
  }
  san.saveUpdate();
  if (DEBUG_LOG) {
    console.log(`当前理智：${san.currentSan}`);
  }
}

// 理智计算timer
function startSanRecovery(san, delay) {
  // 如果提供了时间参数则依照提供的参数延时，便于插件重启后正确更新
  if (!delay) {
    delay = SAN_RECOVERY_SPEED;
  }
  sanTimerId = setTimeout(() => {
    // 将实际恢复逻辑放进setTimeout中，如果放在外面就会出现第一次会立刻恢复1理智(而没有等待恢复时间)的问题
    sanRecovery(san);
    if (san.currentSan < Settings.san.maxValue) {
      startSanRecovery(san);
    }
  }, delay);
}

function handleSanUpdate(san, settings) {
  // 先停止旧的计时器再判断是否需要启动新计时器
  if (sanTimerId) {
    clearTimeout(sanTimerId);
    sanTimerId = null;
  }
  if (san.currentSan < settings.san.maxValue) {
    if (settings.feature.san) {
      startSanRecovery(san);
    }
  } else {
    NotificationUtil.SendNotice(`哼哼！理智已满！`, `理智已经满了，请博士不要再逗我玩了`, null, new Date().getTime());
  }
}

// 由于现在Settings的更新message不能识别更新了哪些内容，故此处加一个变量来识别，<=0代表尚未更新过
let oldMaxSan = -1;

function handleSettingsUpdate(san, settings) {
  // 如果功能被禁用或者理智最大值有更新，则停止计时器并将当前理智设置为最大值
  if (!settings.feature.san ||
    (oldMaxSan > 0 && oldMaxSan !== settings.san.maxValue)) {
    if (sanTimerId) {
      clearTimeout(sanTimerId);
      sanTimerId = null;
    }
    san.currentSan = settings.san.maxValue;
    san.saveUpdate();
  }
}

// 虽然目前的设计是可以保证只调用一次的，但是想想还是加个flag吧
let reloadFlag = false;

// 重启后尝试恢复理智计算，该方法在启动后只能调用一次
function tryReload(san, settings) {
  if (reloadFlag) return;
  reloadFlag = true;
  if (san.currentSan < settings.san.maxValue) {
    const timeElapsed = new Date().getTime() - san.updateTime;
    const recovery = Math.floor(timeElapsed / SAN_RECOVERY_SPEED);
    let shouldStartTimer = false;
    if (recovery >= 1) {
      const newSan = san.currentSan + recovery;
      if (newSan < settings.san.maxValue) {
        // 插件被关闭的那段时间中恢复了一些理智但是没有完全恢复，正常启动计时器继续计时
        san.currentSan = newSan;
        shouldStartTimer = true;
      } else if ((newSan - settings.san.maxValue) <= 5) {
        // 插件被关闭的那段时间中理智已经完全恢复了并且不超过半小时(5 * 6分钟), 则直接推送提醒且不启动计时器
        san.currentSan = settings.san.maxValue;
        NotificationUtil.SendNotice(`理智已满`, `理智已经满了，请博士赶快上线清理智！`, null, new Date().getTime());
      }
    } else {
      // 插件被关闭的那段时间中一点理智都没恢复(被关闭的时间小于理智恢复间隔)，正常启动计时器继续计时
      shouldStartTimer = true;
    }

    if (shouldStartTimer) {
      startSanRecovery(san, SAN_RECOVERY_SPEED - timeElapsed % SAN_RECOVERY_SPEED);
    }
  }
}

// endregion

/**
 * 理智数据
 */
class SanInfo {
  /**
   * 当前理智值
   */
  __currentSan = Settings.san.maxValue;
  /**
   * 当前理智更新时间
   */
  updateTime = new Date().getTime();

  remainTimeIntervalId = 0;

  remainTime = `-`;

  set currentSan(san) {
    this.__currentSan = san;
    this.updateTime = new Date().getTime();
  }

  get currentSan() {
    return this.__currentSan;
  }


  constructor() {

    this.reloadFromStorage().then(() => {
      BrowserUtil.sendMessage(MESSAGE_SAN_GET).then(data => deepAssign(this, data));
      // 仅在后台页面进行理智计算
      if (BrowserUtil.isBackground) {
        tryReload(this, Settings);
        BrowserUtil.addMessageListener('sanInfo', MESSAGE_SAN_UPDATE, data => {
          deepAssign(this, data);
          handleSanUpdate(this, Settings);
        });
        BrowserUtil.addMessageListener('sanInfo', MESSAGE_SETTINGS_UPDATE, data => handleSettingsUpdate(this, data));
      } else {
        BrowserUtil.addMessageListener('sanInfo', MESSAGE_SAN_UPDATE, data => deepAssign(this, data));
      }
    });

    this.startReloadTime();
    this.calcRemainingTime();
  }

  calcRemainingTime() {
    if (this.currentSan >= Settings.san.maxValue) {
      // 停止计时
      if (this.remainTimeIntervalId != 0) {
        clearInterval(this.remainTimeIntervalId);
        this.remainTimeIntervalId = 0;
      }
      this.remainTime = '已经回满';
      return;
    }
    const endTime = new Date(this.updateTime + (Settings.san.maxValue - this.currentSan) * SAN_RECOVERY_SPEED);

    // 由于理智回满最多13个小时多，所以只可能是今天或明天回满
    const tomorrow = endTime.getDay() !== new Date(this.updateTime).getDay() ? '明天' : '';

    this.remainTime = `预计${tomorrow}${TimeUtil.format(endTime, 'hh:mm')}回满，剩${TimeUtil.calcDiff(endTime, this.updateTime)}`;
  }

  saveUpdate() {
    const promise = BrowserUtil.saveLocalStorage('san', this);
    promise.then(() => BrowserUtil.sendMessage(MESSAGE_SAN_UPDATE, this));
    return promise;
  }

  reloadFromStorage() {
    return BrowserUtil.getLocalStorage('san').then(data => {
      if (data) {
        deepAssign(this, data);
      }
      return this;
    });
  }

  // 通过计时器每分钟刷新当前剩余的时间
  startReloadTime() {

    this.remainTimeIntervalId = setInterval(() => {
      this.calcRemainingTime();
    }, SAN_RECOVERY_SPEED / 12);
    console.log('启动计时器', this.remainTimeIntervalId);
  }
}

const instance = new SanInfo();
export default instance;
