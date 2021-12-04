import Settings from '../common/Settings';
import NotificationUtil from '../common/util/NotificationUtil';
import DunInfo from '../common/sync/DunInfo';
import SanInfo from '../common/sync/SanInfo';
import {
    IS_DEBUG,
    MESSAGE_CARD_LIST_GET,
    MESSAGE_CARD_LIST_UPDATE,
    MESSAGE_DUN_INFO_GET,
    MESSAGE_FORCE_REFRESH,
    MESSAGE_SAN_GET,
    PAGE_POPUP_WINDOW,
    PAGE_UPDATE,
    PAGE_WELCOME, PLATFORM_FIREFOX,
    TEST_DATA_REFRESH_TIME,
    MESSAGE_CHANGE_COUNTDOWN,
    MESSAGE_GET_COUNTDOWN
} from '../common/Constants';
import DataSourceUtil from '../common/util/DataSourceUtil';
import PlatformHelper from '../common/platform/PlatformHelper';
import ServerUtil from "../common/util/ServerUtil";
import CountDown from '../common/sync/CountDownInfo';
import TimeUtil from "@/common/util/TimeUtil";

// 重构完成后的其它优化：
// TODO 多个提取出来的类要考虑能否合并(指互相通信的那部分)
// TODO vue数据更新相关的问题，要确认各个页面的数据能正常更新，并且尽量提高更新相关的可读性


// 开启弹出菜单窗口化时的窗口ID
let popupWindowId = null;

// 缓存获取到的饼
const cardListCache = {};

/**
 * 蹲饼！
 */
function tryDun(settings) {
    DunInfo.lastDunTime = new Date().getTime();
    const promiseList = [];
    // 由于删除也算更新，所以用一个flag标记来判断是否有更新，而不能只用promise返回值判断
    let hasUpdated = false;
    for (const key in cardListCache) {
        if (cardListCache.hasOwnProperty(key)) {
            // 如果缓存的key不在启用列表中则删除缓存
            if (!settings.currentDataSources[key]) {
                delete cardListCache[key];
                hasUpdated = true;
            }
        }
    }
    for (const dataName in settings.currentDataSources) {
        if (settings.currentDataSources.hasOwnProperty(dataName)) {
            const source = settings.currentDataSources[dataName];
            DunInfo.counter++;
            const promise = source.fetchData()
                .then(newCardList => {
                    let oldCardList = cardListCache[dataName];
                    let isNew = kazeFun.JudgmentNew(oldCardList, newCardList, source.title);
                    if (newCardList && newCardList.length > 0) {
                        cardListCache[dataName] = newCardList;
                    }
                    if (isNew) {
                        hasUpdated = true;
                    }
                })
                .catch(e => console.error(e))
                .finally(() => {
                    if (!cardListCache[dataName]) {
                        cardListCache[dataName] = [];
                    }
                });
            promiseList.push(promise);
        }
    }
    Promise.allSettled(promiseList).then(() => {
        if (hasUpdated) {
            PlatformHelper.Message.send(MESSAGE_CARD_LIST_UPDATE, cardListCache);
        }
    }).finally(() => DunInfo.saveUpdate());
}

let dunTimeoutId = null;

/**
 * 启动蹲饼timer，会立刻请求一次然后按Settings.dun.intervalTime的值进行延时轮询
 */
function startDunTimer() {
    try {
        tryDun(Settings);
    } catch (e) {
        console.error(e);
    }

    let delay = IS_DEBUG ? TEST_DATA_REFRESH_TIME : Settings.dun.intervalTime;
    // 低频模式
    if (Settings.checkLowFrequency()) {
        delay *= Settings.dun.timeOfLowFrequency;
    }
    // 数据源尚未准备好的时候0.5秒刷新一次
    if (Object.keys(cardListCache).length === 0 && Object.keys(Settings.currentDataSources).length === 0) {
        delay = 0.5;
    }
    dunTimeoutId = setTimeout(() => {
        startDunTimer();
    }, delay * 1000);
}

// 通用方法
const kazeFun = {
    //判断是否为最新 并且在此推送
    // JudgmentNew(oldList, newList, title) {
    //     //判断方法 取每条的第一个判定字段  如果新的字段不等于旧的且大于旧的 判定为新条目
    //     if (oldList
    //         && newList
    //         && oldList.length > 0
    //         && newList.length > 0
    //         && oldList[0].id != newList[0].id
    //     ) {
    //         let newInfo = newList[0];
    //         let timeNow = new Date()
    //         let notice = newInfo.content.replace(/\n/g, "");
    //         DunInfo.cookieCount++;
    //         console.log(title, `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}-${timeNow.getDate()} ${timeNow.getHours()}：${timeNow.getMinutes()}：${timeNow.getSeconds()}`, newInfo, oldList[0]);
    //         // 是否推送
    //         if (Settings.dun.enableNotice) {
    //             NotificationUtil.SendNotice(`小刻在【${title}】里面找到了一个饼！`, notice, newInfo.coverImage, newInfo.id)
    //         }
    //         return true;
    //     }
    //     else if (newList && newList.length > (oldList ? oldList.length : 0)) {
    //         return true;
    //     }
    //     return false
    // },
    // 考虑删除公告推送的情况
    JudgmentNew(oldList, newList, title) {
        //判断方法 取每条的第一个判定字段  如果新的字段不等于旧的且大于旧的 判定为新条目
        if (oldList
            && newList
            && oldList.length > 0
            && newList.length > 0
        ) {
            let newAnnouncement = true;
            for (let i = 0; i < oldList.length; i++) {
                if (oldList[i].id == newList[0].id) {
                    newAnnouncement = false;
                }
            }
            if (newAnnouncement) {
                let newInfo = newList[0];
                let timeNow = new Date()
                let notice = newInfo.content.replace(/\n/g, "");
                DunInfo.cookieCount++;
                console.log(title, `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}-${timeNow.getDate()} ${timeNow.getHours()}：${timeNow.getMinutes()}：${timeNow.getSeconds()}`, newInfo, oldList[0]);
                // 是否推送
                if (Settings.dun.enableNotice) {
                    NotificationUtil.SendNotice(`小刻在【${title}】里面找到了一个饼！`, notice, newInfo.coverImage, newInfo.id)
                }
                return true;
            } else if (newList && newList.length > (oldList ? oldList.length : 0)) {
                return true;
            }
            return false;
        }
        return false;
    },

    // 初始化
    Init() {
        // PlatformHelper.BrowserAction.setBadge('Beta', [255, 0, 0, 255]);
        // 开始蹲饼！
        Settings.doAfterInit(() => {
            startDunTimer();
            setTimeout(() => {
                ServerUtil.checkOnlineInfo(true);
            }, 600000);
        });

        Settings.doAfterUpdate(() => {
            // 由于更新配置后数据源/蹲饼频率可能改变，所以重启蹲饼timer
            // TODO 最好能判断配置更新的情况，只有更新了数据源/蹲饼频率的时候才刷新，避免无意义的网络请求
            if (dunTimeoutId) {
                clearTimeout(dunTimeoutId);
                dunTimeoutId = null;
            }
            startDunTimer();
        });

        // 监听前台事件
        PlatformHelper.Message.registerListener('background', null, (message) => {
            if (message.type) {
                switch (message.type) {
                    case MESSAGE_FORCE_REFRESH:
                        tryDun(Settings);
                        return;
                    case MESSAGE_DUN_INFO_GET:
                        return DunInfo;
                    case MESSAGE_CARD_LIST_GET:
                        return cardListCache;
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
            let item = DataSourceUtil.mergeAllData(cardListCache, false).find(x => x.id === id);
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
    },
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

kazeFun.Init();
countDown.Start();
