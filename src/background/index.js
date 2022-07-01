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
    PLATFORM_FIREFOX
} from '../common/Constants';
import DataSourceUtil from '../common/util/DataSourceUtil';
import PlatformHelper from '../common/platform/PlatformHelper';
import ServerUtil from "../common/util/ServerUtil";
import CountDown from '../common/sync/CountDownInfo';
import TimeUtil from "../common/util/TimeUtil";
import PenguinStatistics from "../common/sync/PenguinStatisticsInfo";
import CardList from "../common/sync/CardList";
import {restartDunTimer, tryDun} from "./DunController";

// 开启弹出菜单窗口化时的窗口ID
let popupWindowId = null;

function ExtensionInit() {
    // PlatformHelper.BrowserAction.setBadge('Beta', [255, 0, 0, 255]);
    // 开始蹲饼！
    Settings.doAfterInit(() => {
        restartDunTimer();
        setTimeout(() => {
            ServerUtil.checkOnlineInfo(true);
        }, 600000);
    });

    Settings.doAfterUpdate((settings, changed) => {
        // 只有更新了数据源/蹲饼频率的时候才刷新，避免无意义的网络请求
        if (!changed.enableDataSources && !changed.customDataSources && !changed.dun) {
            return;
        }
        restartDunTimer();
    });

    // 监听前台事件
    PlatformHelper.Message.registerListener('background', null, (message) => {
        if (message.type) {
            switch (message.type) {
                case MESSAGE_FORCE_REFRESH:
                    // TODO 根据promise返回对应的结果，需要popup.vue那边配合
                    tryDun(true);
                    return;
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
    PlatformHelper.Notification.addClickListener(id => {
        let item = DataSourceUtil.mergeAllData(CardList, false).find(x => x.id === id);
        if (item) {
            PlatformHelper.Tabs.create(item.jumpUrl);
        } else if (id === "update") {
            PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
        } else if (id.slice(0, 12) === "announcement") {
            alert('博士，你点下去的是条重要公告噢，打开列表就可以看到啦');
        } else {
            alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
        }
    });

    // 监听安装更新
    PlatformHelper.Lifecycle.addInstalledListener(details => {
        if (details.reason === 'install') {
            PlatformHelper.Tabs.createWithExtensionFile(PAGE_WELCOME);
        }
        if (details.reason === 'update' || details.reason === 'install') {
            PlatformHelper.Storage.saveLocalStorage("version-notice",false);
        }
    });

    // 监听扩展图标被点击，用于打开窗口化的弹出页面
    PlatformHelper.BrowserAction.addIconClickListener(() => {
        if (Settings.display.windowMode) {
            if (popupWindowId != null) {
                PlatformHelper.Windows.getAllWindow().then(allWindow => {
                    if (allWindow.findIndex(x => x.id == popupWindowId) > 0) {
                        PlatformHelper.Windows.remove(popupWindowId);
                    }
                });
            }
            const width = 800;
            let height = 950;
            if (PlatformHelper.PlatformType === PLATFORM_FIREFOX) {
                height = 850;
            }
            PlatformHelper.Windows
              .createPopupWindow(PlatformHelper.Extension.getURL(PAGE_POPUP_WINDOW), width, height)
              .then(tab => popupWindowId = tab.id);
        }
    });
}

const countDown = {
    sendNoticeList: [],
    countDownList: [],
    Start() {
        CountDown.getCountDownLocalStorage().then(data => {
            data = JSON.parse(data);
            if (data) {
                this.countDownList = [];
                data.map(x => x.data).forEach(item => {
                    this.countDownList.push(item);
                    this.sendNoticeList.push(
                        setTimeout(_ => {
                            NotificationUtil.SendNotice(`倒计时完毕`, `${item.name} 到点了！`, null, new Date().getTime());
                            // 有过通知后从内存中删除计时器数据
                            CountDown.removeCountDown(item);
                        }, new Date(item.stopTime) - new Date())
                    );
                })
            }
        })
    },
    Change() {
        this.sendNoticeList.forEach(id => {
            clearTimeout(id)
        });
        this.sendNoticeList = [];
        this.Start();
    },
    GetAllCountDown() {
        let list = [];
        this.countDownList.forEach(item => {
            let value = TimeUtil.calcDiff(new Date(item.stopTime), new Date())
            if (value != '') {
                list.push({ ...item, timeStr: value, stopTime: TimeUtil.format(item.stopTime, 'yyyy-MM-dd hh:mm:ss') });
            }
        })
        return list;
    }
}

const penguinStatistics = {
    Init() {
        PenguinStatistics.GetNewItems()
    }
};

ExtensionInit();
countDown.Start();
penguinStatistics.Init();
