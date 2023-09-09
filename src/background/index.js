import Settings from '../common/Settings';
import NotificationUtil from '../common/util/NotificationUtil';
import SanInfo from '../common/sync/SanInfo';
import {
  MESSAGE_CHANGE_COUNTDOWN,
  MESSAGE_FORCE_REFRESH,
  MESSAGE_GET_COUNTDOWN,
  MESSAGE_SAN_GET,
  PAGE_POPUP_WINDOW,
  PAGE_UPDATE,
  PAGE_WELCOME,
  PLATFORM_FIREFOX,
} from '../common/Constants';
import PlatformHelper from '../common/platform/PlatformHelper';
import ServerUtil from '../common/util/ServerUtil';
import CountDown from '../common/sync/CountDownInfo';
import TimeUtil from '../common/util/TimeUtil';
import PenguinStatistics from '../common/sync/PenguinStatisticsInfo';
import CardList from '../common/sync/CardList';
import { CookieFetchManager, registerFetcher } from './fetcher/CookieFetcherManager';
import { FetchConfig, FetcherStrategy } from './fetcher/FetchConfig';
import { CeobeCanteenCookieFetcher } from './fetcher/impl/CeobeCanteenCookieFetcher';
import { LocalCookieFetcher } from './fetcher/impl/LocalCookieFetcher';
import DebugUtil from '../common/util/DebugUtil';

// 开启弹出菜单窗口化时的窗口ID
let popupWindowId = null;

const cookieFetcherManager = new CookieFetchManager();

registerFetcher('server', CeobeCanteenCookieFetcher);
registerFetcher('local', LocalCookieFetcher);

/**
 * TODO 之后这个要改成能够自定义的
 *
 * @return {FetchConfig}
 */
function buildMainCookieFetchConfig(enable = true) {
  return new FetchConfig(
    enable,
    Settings.enableDataSources,
    Settings.dun.intervalTime,
    Settings.dun.autoLowFrequency
      ? Settings.dun.lowFrequencyTime.map((it) => {
          let realHour;
          if (it < 12) realHour = it + 12;
          else realHour = it - 12;
          return realHour;
        })
      : undefined,
    Settings.dun.autoLowFrequency ? Settings.dun.timeOfLowFrequency : 1,
    [new FetcherStrategy('default', 'server'), new FetcherStrategy('default', 'local')]
  );
}

const MAIN_FETCH_CONFIG_KEY = 'main';

function ExtensionInit() {
  // PlatformHelper.BrowserAction.setBadge('Beta', [255, 0, 0, 255]);
  // 开始蹲饼！
  Settings.doAfterInit(() => {
    DebugUtil.debugLog(0, '开始蹲饼');
    if (Settings.open) cookieFetcherManager.updateFetchConfig(MAIN_FETCH_CONFIG_KEY, buildMainCookieFetchConfig(true));
    setTimeout(() => {
      ServerUtil.getVersionInfo();
      ServerUtil.getAnnouncementInfo(true);
    }, 600000);
  });

  Settings.doAfterUpdate((settings, changed) => {
    // 只有更新了数据源/蹲饼频率的时候才刷新，避免无意义的网络请求
    if (!changed.enableDataSources && !changed.customDataSources && !changed.dun) {
      return;
    }
    if (Settings.open) cookieFetcherManager.updateFetchConfig(MAIN_FETCH_CONFIG_KEY, buildMainCookieFetchConfig(true));
  });

  // 监听前台事件
  PlatformHelper.Message.registerListener('background', null, (message) => {
    if (message.type) {
      switch (message.type) {
        // TODO 不接受强制刷新 后续要清理相关代码
        case MESSAGE_FORCE_REFRESH:
          return false;
        case MESSAGE_SAN_GET:
          return SanInfo;
        case MESSAGE_CHANGE_COUNTDOWN:
          countDown.Change();
          return;
        case MESSAGE_GET_COUNTDOWN:
          return countDown.GetAllCountDown();
        default:
          return;
      }
    }
  });

  // 监听标签
  PlatformHelper.Notification.addClickListener((id) => {
    let item = CardList.list.find((x) => x.id === id);
    if (item) {
      PlatformHelper.Tabs.create(item.jumpUrl);
    } else if (id === 'update') {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
    } else if (id.slice(0, 12) === 'announcement') {
      alert('博士，你点下去的是条重要公告噢，打开列表就可以看到啦');
    } else {
      alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
    }
  });

  // 监听安装更新
  PlatformHelper.Lifecycle.addInstalledListener((details) => {
    if (details.reason === 'install') {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_WELCOME);
    }
    if (details.reason === 'update' || details.reason === 'install') {
      PlatformHelper.Storage.saveLocalStorage('version-notice', false);
    }
  });

  // 监听扩展图标被点击，用于打开窗口化的弹出页面
  PlatformHelper.BrowserAction.addIconClickListener(() => {
    if (Settings.display.windowMode) {
      if (popupWindowId != null) {
        PlatformHelper.Windows.getAllWindow().then((allWindow) => {
          if (allWindow.findIndex((x) => x.id == popupWindowId) > 0) {
            PlatformHelper.Windows.remove(popupWindowId);
          }
        });
      }
      const width = 800;
      let height = 950;
      if (PlatformHelper.PlatformType === PLATFORM_FIREFOX) {
        height = 850;
      }
      PlatformHelper.Windows.createPopupWindow(PlatformHelper.Extension.getURL(PAGE_POPUP_WINDOW), width, height).then(
        (tab) => (popupWindowId = tab.id)
      );
    }
  });

  PlatformHelper.Alarms.addListener((alarm) => {
    /**
     * @type {string|undefined}
     */
    const name = alarm.name;
    countDownDebugLog(`alarm监听器触发[${name}]：`, alarm);
    if (name && name.startsWith('countdown_')) {
      const countDownName = name.split('|')[0].substring('countdown_'.length);
      NotificationUtil.SendNotice(`倒计时完毕`, `${countDownName} 到点了！`, null, 'countdown_' + new Date().getTime());
      CountDown.removeCountDownByName(countDownName);
    }
  });
}

function countDownDebugLog(...data) {
  DebugUtil.debugConsoleOutput(0, 'debug', '%c 倒计时 ', 'color: white; background: #DA70D6', ...data);
}

const countDownThreshold = 5 * 60 * 1000;
let countDownFlag = false;
const countDown = {
  sendNoticeList: [],
  countDownList: [],
  Start() {
    CountDown.getCountDownLocalStorage().then((data) => {
      data = JSON.parse(data);
      if (data) {
        this.countDownList = [];
        data
          .map((x) => x.data)
          .forEach((item) => {
            this.countDownList.push(item);
            const endTime = new Date(item.stopTime).getTime();
            const delayTime = endTime - new Date().getTime();
            if (delayTime >= countDownThreshold) {
              countDownDebugLog(`设置alarm[${item.name}]-指定时间：${new Date(endTime).toLocaleString()}`);
              const uniqueName = 'countdown_' + item.name + '|' + Math.random().toFixed(3).substring(2, 5);
              PlatformHelper.Alarms.create(uniqueName, { when: endTime });
            } else {
              countDownDebugLog(`设置setTimeout[${item.name}]-延时：${delayTime}`);
              this.sendNoticeList.push(
                setTimeout((_) => {
                  NotificationUtil.SendNotice(
                    `倒计时完毕`,
                    `${item.name} 到点了！`,
                    null,
                    'countdown_' + new Date().getTime()
                  );
                  // 有过通知后从内存中删除计时器数据
                  CountDown.removeCountDown(item);
                }, delayTime)
              );
            }
          });
      }
    });
  },
  Change() {
    if (countDownFlag) {
      return;
    }
    countDownFlag = true;
    countDownDebugLog('清空setTimeout');
    this.sendNoticeList.forEach((id) => {
      clearTimeout(id);
    });
    this.sendNoticeList = [];
    countDownDebugLog('清空alarms');
    PlatformHelper.Alarms.clearAll().finally(() => {
      this.Start();
      countDownFlag = false;
    });
  },
  GetAllCountDown() {
    let list = [];
    this.countDownList.forEach((item) => {
      let value = TimeUtil.calcDiff(new Date(item.stopTime), new Date());
      if (value != '') {
        list.push({ ...item, timeStr: value, stopTime: TimeUtil.format(item.stopTime, 'yyyy-MM-dd hh:mm:ss') });
      }
    });
    return list;
  },
};

const penguinStatistics = {
  Init() {
    PenguinStatistics.GetNewItems();
  },
};

ExtensionInit();
countDown.Start();
PlatformHelper.osIsMac().then((isMac) => {
  if (isMac) {
    setInterval(() => countDown.Change(), 10 * 60 * 1000);
  }
});
penguinStatistics.Init();
