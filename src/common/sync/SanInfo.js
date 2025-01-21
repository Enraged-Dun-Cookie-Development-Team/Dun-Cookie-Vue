import TimeUtil from '../util/TimeUtil';
import Settings from '../Settings';
import {
  DEBUG_LOG,
  MESSAGE_SAN_GET,
  MESSAGE_SAN_UPDATE,
  MESSAGE_SETTINGS_UPDATE,
  SAN_RECOVERY_SPEED,
} from '../Constants';
import { deepAssign } from '../util/CommonFunctions';
import NotificationUtil from '../util/NotificationUtil';
import PlatformHelper from '../platform/PlatformHelper';

// region 理智计算(自动提醒)
const alarmKeySanRecovery = 'tools:san-recovery';

// 理智计算流程：
// 在弹出页面点击"开始计算"会启动理智计算，当理智满了之后才会停止
// 在设置页面重新设置理智最大值后，会停止理智计算
// 在插件重启后如果之前理智计算是启动的则会尝试恢复理智计算
// 需要注意的是：目前san-update代表当前理智的相关信息修改，而settings-update代表可能有最大理智相关信息修改

function sanRecovery(san) {
  const timeElapsed = new Date().getTime() - san.updateTime;
  // 时间超长时可能是休眠导致延时了，用经过时间除以6分钟来判断理智恢复数量以避免出问题
  if (timeElapsed > SAN_RECOVERY_SPEED) {
    const recovery = Math.floor(timeElapsed / SAN_RECOVERY_SPEED);
    san.currentSan += recovery;
  } else {
    san.currentSan++;
  }
  if (Settings.san.maxValue - san.currentSan === 3) {
    noticeSan(`理智快满啦`, `博士！！博士！！理智还差不到18分钟就满啦！快点上线清理智噢！`);
  }
  if (san.currentSan >= Settings.san.maxValue) {
    san.currentSan = Settings.san.maxValue;
    noticeSan(`理智已满`, `理智已经满了！！请博士赶快上线清理智，不要浪费啦！`);
    void PlatformHelper.Alarms.clear(alarmKeySanRecovery);
  }
  san.saveUpdate();
  if (DEBUG_LOG) {
    console.log(`当前理智：${san.currentSan}`);
  }
}

let remainTimeIntervalId = 0;

// 理智计算timer
function startSanRecovery(san, delay) {
  // 如果提供了时间参数则依照提供的参数延时，便于插件重启后正确更新
  if (!delay) {
    // 偏移时间 用于将理智恢复时间对准6分钟
    const offsetTime = (new Date().getTime() - san.updateTime) % SAN_RECOVERY_SPEED;
    if (offsetTime > 0) {
      // 将理智更新时间也对准6分钟
      san.updateTime -= offsetTime;
      delay = SAN_RECOVERY_SPEED - offsetTime;
    } else {
      delay = SAN_RECOVERY_SPEED;
    }
  }
  if (remainTimeIntervalId === 0) san.startReloadTime();
  // 将实际恢复逻辑放进alarm中，如果放在外面就会出现第一次会立刻恢复1理智(而没有等待恢复时间)的问题
  void PlatformHelper.Alarms.create(alarmKeySanRecovery, {
    delayInMinutes: delay / (60 * 1000),
  });
}

function handleSanUpdate(san, settings) {
  // 先停止旧的计时器再判断是否需要启动新计时器
  PlatformHelper.Alarms.clear(alarmKeySanRecovery).finally(() => {
    if (san.currentSan < settings.san.maxValue) {
      if (settings.feature.san) {
        startSanRecovery(san);
      }
    } else {
      noticeSan(`哼哼！理智已满！`, `理智已经满了，请博士不要再逗我玩了`);
    }
  });
}

// 由于现在Settings的更新message不能识别更新了哪些内容，故此处加一个变量来识别
let oldMaxSan = Settings.san.maxValue;

function handleSettingsUpdate(san, settings) {
  // 如果功能被禁用或者理智最大值有更新，则停止计时器并将当前理智设置为最大值
  if (!settings.feature.san || oldMaxSan !== settings.san.maxValue) {
    oldMaxSan = settings.san.maxValue;
    void PlatformHelper.Alarms.clear(alarmKeySanRecovery);
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
      } else if (newSan - settings.san.maxValue <= 5) {
        // 插件被关闭的那段时间中理智已经完全恢复了并且不超过半小时(5 * 6分钟), 则直接推送提醒且不启动计时器
        san.currentSan = settings.san.maxValue;
        noticeSan(`理智已满`, `理智都满一会啦！！！这可是20合成玉呀！`);
      } else {
        // 插件被关闭的那段时间中理智已经完全恢复了并且超过半小时(5 * 6分钟), 则将理智设置满且不启动计时器
        san.currentSan = settings.san.maxValue;
      }
    } else {
      // 插件被关闭的那段时间中一点理智都没恢复(被关闭的时间小于理智恢复间隔)，正常启动计时器继续计时
      shouldStartTimer = true;
    }
    san.calcRemainingTime();
    if (shouldStartTimer) {
      startSanRecovery(san, SAN_RECOVERY_SPEED - (timeElapsed % SAN_RECOVERY_SPEED));
    }
  }
}

// 判断是否需要推送
function noticeSan(title, message) {
  if (Settings.san.noticeWhenFull) {
    NotificationUtil.SendNotice(title, message, null, new Date().getTime());
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
      PlatformHelper.Message.send(MESSAGE_SAN_GET).then((data) => deepAssign(this, data));
      // 仅在后台页面进行理智计算
      if (PlatformHelper.isBackground) {
        tryReload(this, Settings);
        PlatformHelper.Message.registerListener('sanInfo', MESSAGE_SAN_UPDATE, (data) => {
          deepAssign(this, data);
          handleSanUpdate(this, Settings);
        });
        PlatformHelper.Message.registerListener('sanInfo', MESSAGE_SETTINGS_UPDATE, (data) =>
          handleSettingsUpdate(this, data)
        );
      } else {
        PlatformHelper.Message.registerListener('sanInfo', MESSAGE_SAN_UPDATE, (data) => deepAssign(this, data));
      }
    });
  }

  calcRemainingTime() {
    if (this.currentSan >= Settings.san.maxValue) {
      // 停止计时
      if (this.remainTimeIntervalId !== 0) {
        clearInterval(this.remainTimeIntervalId);
        this.remainTimeIntervalId = 0;
      }
      this.remainTime = '已经回满';
    } else {
      const endTime = new Date(this.updateTime + (Settings.san.maxValue - this.currentSan) * SAN_RECOVERY_SPEED);

      // 由于理智回满最多13个小时多，所以只可能是今天或明天回满
      const now = new Date();
      const isSameDay = endTime.getDay() !== now.getDay();
      const tomorrow = isSameDay ? '明天' : '';

      this.remainTime = `预计${tomorrow}${TimeUtil.format(endTime, 'hh:mm')}回满，剩${TimeUtil.calcDiff(
        endTime,
        now.getTime()
      )}`;
    }
    this.saveUpdate();
  }

  saveUpdate() {
    const promise = PlatformHelper.Storage.saveLocalStorage('san', this);
    promise.then(() => PlatformHelper.Message.send(MESSAGE_SAN_UPDATE, this));
    return promise;
  }

  reloadFromStorage() {
    return PlatformHelper.Storage.getLocalStorage('san').then((data) => {
      if (data) {
        deepAssign(this, data);
      }
      return this;
    });
  }

  // 通过计时器每分钟刷新当前剩余的时间
  startReloadTime() {
    remainTimeIntervalId = setInterval(() => {
      this.calcRemainingTime();
    }, 1000);
  }
}

const instance = new SanInfo();
PlatformHelper.Alarms.addListener((alarm) => {
  if (alarm.name !== alarmKeySanRecovery) return;
  sanRecovery(instance);
  if (instance.currentSan < Settings.san.maxValue) {
    startSanRecovery(instance);
  }
});

export default instance;
