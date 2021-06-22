import defaultDataSources from '../common/DefaultDataSources';
import {settings} from '../common/Settings';
import BrowserUtil from '../common/BrowserUtil';
import NotificationUtil from '../common/NotificationUtil';
import DunInfo from '../common/sync/DunInfo';
import SanInfo from '../common/sync/SanInfo';
import {
    IS_TEST, MESSAGE_CARD_LIST_GET,
    MESSAGE_CARD_LIST_UPDATE, MESSAGE_DUN_INFO_GET,
    MESSAGE_DUN_INFO_UPDATE, MESSAGE_FORCE_REFRESH, MESSAGE_SAN_GET,
    MESSAGE_SAN_UPDATE,
    MESSAGE_SETTINGS_UPDATE,
    SAN_RECOVERY_SPEED,
    TEST_DATA_REFRESH_TIME
} from '../common/Constants';

// 重构完成后的其它优化：
// TODO 多个提取出来的类要考虑能否合并(指互相通信的那部分)
// TODO vue数据更新相关的问题，要确认各个页面的数据能正常更新，并且尽量提高更新相关的可读性


// 软件临时数据
let kazeData = {
    windowTabId: null,
}

// 缓存获取到的饼
const cardListCache = {};
// 理智计算timer
let sanIntervalId = null;

// 数据来源
let kazeSource = {
    bili: defaultDataSources[0],
    weibo: defaultDataSources[1],
    yj: defaultDataSources[2],
    cho3: defaultDataSources[3],
    ys3: defaultDataSources[4],
    sr: defaultDataSources[5],
    tl: defaultDataSources[6],
    gw: defaultDataSources[7],
    tlgw: defaultDataSources[8],
    wyyyy: defaultDataSources[9],
}
let kazeFun = {}
// 数据获取和处理
let kazeSourceProcess = {
    // 蹲饼入口
    GetData() {
        DunInfo.lastDunTime = new Date().getTime();
        const promiseList = [];
        // 由于删除也算更新，所以用一个flag标记来判断是否有更新，而不能只用promise返回值判断
        let hasUpdated = false;
        for (const idx in defaultDataSources) {
            const dataSource = defaultDataSources[idx];
            if (!settings.source.includes(parseInt(idx))) {
                if (cardListCache[dataSource.dataName]) {
                    delete cardListCache[dataSource.dataName];
                    hasUpdated = true;
                }
                continue;
            }
            DunInfo.counter++;
            promiseList.push(dataSource.fetchData().then(newCardList => {
                let oldCardList = cardListCache[dataSource.dataName];
                let isNew = kazeFun.JudgmentNew(oldCardList, newCardList, dataSource.title);
                if (isNew) {
                    cardListCache[dataSource.dataName] = newCardList;
                    hasUpdated = true;
                }
            }));
        }
        Promise.all(promiseList).then(() => {
            if (hasUpdated) {
                BrowserUtil.sendMessage(MESSAGE_CARD_LIST_UPDATE, cardListCache);
            }
        });
    },

}

// 通用方法
kazeFun = {
    //判断是否为最新 并且在此推送
    JudgmentNew(oldList, newList, title) {
        //判断方法 取每条的第一个判定字段  如果新的字段不等于旧的且大于旧的 判定为新条目
        if (oldList
            && newList
            && oldList.length > 0
            && newList.length > 0
            && oldList[0].judgment != newList[0].judgment
        ) {
            let newInfo = newList[0];
            let timeNow = new Date()
            let notice = newInfo.dynamicInfo.replace(/\n/g, "");
            console.log(title, `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}-${timeNow.getDate()} ${timeNow.getHours()}：${timeNow.getMinutes()}：${timeNow.getSeconds()}`, newInfo, oldList[0]);
            // 是否推送
            if (settings.isPush == true) {
                NotificationUtil.SendNotice(`小刻在【${title}】里面找到了一个饼！`, notice, newInfo.image, newInfo.id)
            }
            return true;
        }
        else if (!oldList) {
            return true;
        }
        return false
    },

    //蹲饼间隔时间 自带第一次请求 自带清除当前循环 秒
    settimeoutGetData(time) {
        kazeSourceProcess.GetData();
        this.checkDarkModel();
        this.checkLowfrequencyModel();
        BrowserUtil.sendMessage(MESSAGE_DUN_INFO_UPDATE, DunInfo);

        // 如果没有传time 获取setting时间
        if (!time) {
            time = IS_TEST ? TEST_DATA_REFRESH_TIME : settings.time;
            // 低频模式
            if (settings.islowfrequency) {
                time = (time * 2);
            }
        }
        setTimeout(() => {
            this.settimeoutGetData();
        }, parseInt(time) * 1000);
    },
    checkDarkModel() {
        let hour = new Date().getHours();
        // 判断当前时间是否是启用页面模式的时间
        let darkShow = settings.darkshow;
        let oldOutsideClass = settings.outsideClass;
        let newOutsideClass = (darkShow == -1 && (hour >= 18 || hour < 6)) || darkShow == 1
            ? "dark"
            : "light";

        if (oldOutsideClass != newOutsideClass) {
            settings.outsideClass = newOutsideClass;
            settings.saveSettings();
        }
    },
    checkLowfrequencyModel() {
        let hour = new Date().getHours();
        // 判断当前时间是否是启用低频模式的时间
        let lowfrequency = settings.lowfrequency;
        let lowfrequencyTime = settings.lowfrequencyTime;
        let oldislowfrequency = settings.islowfrequency;
        let starHour = lowfrequencyTime[0] < 12 ? lowfrequencyTime[0] + 12 : lowfrequencyTime[0] - 12;
        let endHour = lowfrequencyTime[1] < 12 ? lowfrequencyTime[1] + 12 : lowfrequencyTime[1] - 12;
        let newislowfrequency = (lowfrequency && (hour >= starHour || hour < endHour));
        if (oldislowfrequency != newislowfrequency) {
            settings.islowfrequency = newislowfrequency;
            settings.saveSettings();
        }
    },

    // 获取浏览器信息 (0:Chrome内核 1:火狐内核 2:手机端 3:其他)
    getWebType() {
        let head = navigator.userAgent;
        if (head.indexOf("Android") > 1 || head.indexOf("iPhone") > 1) {
            settings.webType = 2;
        } else if (head.indexOf("Firefox") > 1) {
            settings.webType = 1;
        } else if (head.indexOf("Chrome") > 1) {
            settings.webType = 0;
        } else {
            settings.webType = 3;
        }
    },

    // 初始化
    Init() {
        // chrome.browserAction.setBadgeText({ text: 'Beta' });
        // chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        // 默认设置
        settings.reloadSettings().then(() => {
            kazeFun.getWebType();
            // 注册窗口
            if (!settings.isWindow) {
                // 注册popup
                BrowserUtil.setPopup({ popup: BrowserUtil.getExtensionURL("popup.html") });
            } else {
                BrowserUtil.setPopup({ popup: "" });
            }
            SanInfo.currentSan = settings.san.maxValue;
            BrowserUtil.sendMessage(MESSAGE_SAN_UPDATE, SanInfo);
            this.settimeoutGetData();
        });

        // 监听前台事件
        BrowserUtil.addMessageListener('background', null, function (request) {
            if (request.type) {
                switch (request.type) {
                    case MESSAGE_FORCE_REFRESH:
                        kazeSourceProcess.GetData();
                        return;
                    case MESSAGE_DUN_INFO_GET:
                        return DunInfo;
                    case MESSAGE_CARD_LIST_GET:
                        return cardListCache;
                    case MESSAGE_SAN_GET:
                        return SanInfo;
                    case MESSAGE_SAN_UPDATE: {
                        if (request.data.currentSan === settings.san.maxValue) {
                            NotificationUtil.SendNotice(`哼哼！理智已满！`, `理智已经满了，请博士不要再逗我玩了`, null, new Date().getTime());
                            return;
                        }
                        // 重启定时器
                        if (sanIntervalId) {
                            clearInterval(sanIntervalId);
                            sanIntervalId = null;
                        }
                        if (settings.san.noticeWhenFull) {
                            sanIntervalId = setInterval(() => {
                                SanInfo.currentSan++;
                                if (SanInfo.currentSan >= settings.san.maxValue) {
                                    SanInfo.currentSan = settings.san.maxValue;
                                    NotificationUtil.SendNotice(`理智已满`, `理智已经满了，请博士赶快上线清理智！`, null, new Date().getTime());
                                    clearInterval(sanIntervalId);
                                    sanIntervalId = null;
                                }
                                SanInfo.saveUpdate();
                                console.log(SanInfo.currentSan);
                            }, SAN_RECOVERY_SPEED);
                        }
                        return;
                    }
                    case MESSAGE_SETTINGS_UPDATE: {
                        settings.reloadSettings().then(() => {
                            SanInfo.currentSan = settings.san.maxValue;
                            BrowserUtil.sendMessage(MESSAGE_SAN_UPDATE, SanInfo);
                            kazeSourceProcess.GetData();
                            if (!settings.isWindow) {
                                // 注册popup
                                BrowserUtil.setPopup({popup: BrowserUtil.getExtensionURL("popup.html")});
                            } else {
                                BrowserUtil.setPopup({popup: ""});
                            }
                        });
                        return;
                    }
                    default:
                        return;
                }
            }
        });

        // 监听标签
        BrowserUtil.addNotificationClickListener(id => {
            let cardlist = Object.values(cardListCache)
                .reduce((acc, cur) => [...acc, ...cur], [])
                .filter(x => x.id + "_" == id);
            if (cardlist != null && cardlist.length > 0) {
                BrowserUtil.createTab(cardlist[0].url);
            } else {
                alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
            }
        });

        // 监听安装更新
        BrowserUtil.addInstallListener(details => {
            if (details.reason === 'install') {
                BrowserUtil.createTab(BrowserUtil.getExtensionURL("welcome.html"));
            }
        });

        // 监听标签打开
        BrowserUtil.addIconClickListener(() => {
            if (settings.isWindow) {
                if (kazeData.windowTabId != null) {
                    BrowserUtil.removeWindow(kazeData.windowTabId);
                }
                // 直接打开
                BrowserUtil.createWindow({ url: BrowserUtil.getExtensionURL("windowPopup.html"), type: "panel", width: 1100, height: 750 })
                  .then(tab => {kazeData.windowTabId = tab.id;});
            }
        });

        if (IS_TEST) {
            kazeSource.bili.dataUrl = `test/bJson.json?host_uid=161775300`;
            kazeSource.weibo.dataUrl = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
            kazeSource.yj.dataUrl = `test/yJson.json`;
            kazeSource.cho3.dataUrl = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
            kazeSource.ys3.dataUrl = `test/ysJson.json?type=uid&value=7506039414&containerid=1076037506039414`;
            kazeSource.sr.dataUrl = `test/srJson.json`;
            kazeSource.tl.dataUrl = `test/tlJson.json?type=uid&value=6441489862&containerid=1076037499841383`;
            kazeSource.gw.dataUrl = `test/gw.html`;
            kazeSource.tlgw.dataUrl = ['test/xbJson.json', 'test/xgbJson.json'];
        }
    }
}

kazeFun.Init();
