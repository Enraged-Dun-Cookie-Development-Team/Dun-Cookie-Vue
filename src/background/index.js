import DebugUtil from '../common/util/DebugUtil';
import {
  ENABLE_FEATURES,
  MESSAGE_GET_COUNTDOWN,
  MESSAGE_SAN_GET,
  MESSAGE_WEIBO_ADD_REFERER,
  PAGE_POPUP_WINDOW,
  PAGE_UPDATE,
  PAGE_WELCOME,
  PLATFORM_FIREFOX,
} from '../common/Constants';
import Settings from '../common/Settings';
import PlatformHelper from '../common/platform/PlatformHelper';
import ServerUtil from '../common/util/ServerUtil';
import { stopFetch, updateFetch } from './fetcher';
import SanInfo from '../common/sync/SanInfo';
import { registerUrlToAddReferer } from './request_interceptor';
import CardList from '../common/sync/CardList';
import NotificationUtil from '../common/util/NotificationUtil';
import CountDown from '../common/sync/CountDownInfo';
import { UserUtil } from '../common/util/UserUtil';
import PenguinStatistics from '../common/sync/PenguinStatisticsInfo';
import { JsonValidator } from '@enraged-dun-cookie-development-team/common/json';

// 第一时间调用以生成uuid
void UserUtil.getClientId();
// TODO 因为ajv用到了eval，所以只能全局禁止验证
JsonValidator.validate = () => true;

const alarmKeyCheckUpdate = 'core:check-extension-update';
const alarmKeyCheckServerInfoCache = 'core:check-serverinfo-cache';
const alarmKeyAliveCheck = 'core:alive-check';

// 记录启动时间
const startTime = new Date().getTime();

function alarmHandler(alarm) {
  if (!alarm || !alarm.name) return;
  switch (alarm.name) {
    case alarmKeyCheckUpdate: {
      void checkExtensionUpdate();
      break;
    }
    case alarmKeyCheckServerInfoCache: {
      void ServerUtil.checkServerDataSourceInfoCache();
      break;
    }
    case alarmKeyAliveCheck: {
      // 3秒内视为这次闹钟触发的时候已经死了
      if (Math.abs(new Date().getTime() - startTime) < 3000) {
        DebugUtil.debugLog(0, '恢复蹲饼');
        updateFetch();
      }
      break;
    }
    default: {
      if (alarm.name.startsWith('countdown_')) {
        const countDownName = name.split('|')[0].substring('countdown_'.length);
        NotificationUtil.SendNotice(
          `倒计时完毕`,
          `${countDownName} 到点了！`,
          null,
          'countdown_' + new Date().getTime()
        );
        void CountDown.removeCountDownByName(countDownName);
      }
      break;
    }
  }
}

async function checkExtensionUpdate() {
  const extensionInfo = await PlatformHelper.Extension.getExtensionInfo();
  // 商店安装的不检查更新
  if (extensionInfo.installType !== 'normal') {
    void ServerUtil.getVersionInfo();
  }
  void ServerUtil.getAnnouncementInfo(true);
}

PlatformHelper.Alarms.addListener(alarmHandler);

// 监听前台事件
PlatformHelper.Message.registerListener('background', null, (message) => {
  if (message.type) {
    const data = message.data;
    switch (message.type) {
      case MESSAGE_SAN_GET:
        return SanInfo;
      // TODO 暂未启用Countdown
      // case MESSAGE_CHANGE_COUNTDOWN:
      //   countDown.Change();
      //   return;
      case MESSAGE_GET_COUNTDOWN:
        return [];
      //   return countDown.GetAllCountDown();
      case MESSAGE_WEIBO_ADD_REFERER:
        if (data.urls && data.urls.length > 0) {
          data.urls.forEach((src) => registerUrlToAddReferer(src, 'https://m.weibo.cn/'));
        }
        return;
      default:
        return;
    }
  }
});

// 监听标签
PlatformHelper.Notification.addClickListener((id) => {
  let item = CardList.getFirstPageList().find((x) => x.id === id);
  if (item) {
    void PlatformHelper.Tabs.create(item.jumpUrl);
  } else if (id === 'update') {
    void PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
  } else if (id.slice(0, 12) === 'announcement') {
    alert('博士，你点下去的是条重要公告噢，打开列表就可以看到啦');
  } else {
    alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
  }
});

// 监听安装更新
PlatformHelper.Lifecycle.addInstalledListener((details) => {
  Settings.doAfterInit(() => {
    if (details.reason === 'install' || !Settings.agreeLicense) {
      void PlatformHelper.Tabs.createWithExtensionFile(PAGE_WELCOME);
    }
    if (details.reason === 'update' || details.reason === 'install') {
      void PlatformHelper.Storage.saveLocalStorage('version-notice', false);
    }
  });
});

// 监听扩展图标被点击，用于打开窗口化的弹出页面
PlatformHelper.BrowserAction.addIconClickListener(async () => {
  const popupWindowIdStorageKey = 'runtime.popupWindowId';
  if (Settings.display.windowMode) {
    const popupWindowId = await PlatformHelper.Storage.getLocalStorage(popupWindowIdStorageKey);
    if (popupWindowId) {
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
      (tab) => PlatformHelper.Storage.saveLocalStorage(popupWindowIdStorageKey, tab.id)
    );
  }
});

function ExtensionInit() {
  DebugUtil.debugLog(0, '插件启动...');
  if (ENABLE_FEATURES.length > 0) {
    DebugUtil.debugLog(0, '已启用特性：', ENABLE_FEATURES);
  }

  // 开始蹲饼！
  Settings.doAfterInit((initSettings) => {
    if (initSettings.open) {
      DebugUtil.debugLog(0, '开始蹲饼');
      updateFetch();
    } else {
      DebugUtil.debugLog(0, '蹲饼开关已关闭');
    }
  });

  Settings.doAfterInit((initSettings) => {
    void PlatformHelper.Alarms.createIfNotExists(alarmKeyCheckUpdate, {
      delayInMinutes: 60,
      periodInMinutes: 60,
    });
  });

  Settings.doAfterUpdate((settings, changed) => {
    // 只有更新了数据源/蹲饼频率/蹲饼开关的时候才刷新，避免无意义的网络请求
    // prettier-ignore
    if (
      !changed.enableDataSources
      && !changed.dun
      && !changed.open
      /* IFTRUE_feature__custom_datasource */
      && !changed.extraFeature?.enableCustomDataSources
      /* FITRUE_feature__custom_datasource */
    ) {
      return;
    }
    if (settings.open) {
      DebugUtil.debugLog(0, '开始蹲饼');
      updateFetch();
    } else {
      stopFetch();
      // 都不蹲饼了还保什么活(
      void PlatformHelper.Alarms.clear(alarmKeyAliveCheck);
    }
  });

  // 启动时的缓存检查在AvailableDataSourceMeta
  // 每隔6小时检查一遍缓存
  void PlatformHelper.Alarms.createIfNotExists(alarmKeyCheckServerInfoCache, {
    delayInMinutes: 6 * 60,
    periodInMinutes: 6 * 60,
  });

  // 拿一次企鹅物流数据
  PenguinStatistics.GetNewItems();
}

ExtensionInit();

// 每半分钟进行一次保活检查
void PlatformHelper.Alarms.create(alarmKeyAliveCheck, {
  delayInMinutes: 0.5,
  periodInMinutes: 0.5,
});
