import {common} from "../assets/JS/common";
import HttpUtil from '../common/HttpUtil';
import defaultDataSources from '../common/DefaultDataSources';
import {settings} from '../common/Settings';
import StorageUtil from '../common/StorageUtil';
import BrowserUtil from '../common/BrowserUtil';


//数据下来后都定位固定格式 没有不用管
var date = {
    time: '时间 【必填】',
    id: '弹窗id 微博B站用时间戳，其他的内容用他们自己的ID 【必填】',
    judgment: '判定字段 微博B站用时间 鹰角用id 【必填】',
    dynamicInfo: '处理后内容 用于展示 微博把<br / >替换成 /r/n 后期统一处理 【必填】',
    html: '处理前内容 原始字段',
    image: '获取到的图片',
    imagelist: '获取到的图片list',
    type: '当前条目的类型',
    source: '条目来源 【必填】',
    url: '跳转后连接 【必填】',
    detail: '详情列表，以后进入二级页面使用',
    isTop: '在列表中是否为置顶内容 仅限微博',
    retweeted: '转发的内容'
}

// 软件临时数据
let kazeData = {
    isTest: true,
    testIntervalTime: 3,
    setting: {},
    FocusAnnounceId: null,
    setIntervalID: null,
    windowTabId: null,
}

// 软件存储数据 数据互通使用
let kazeLocalData = {
    // 仅仅只是保存
    saveInfo: common.saveInfo,
    cardlistdm: {},
    //请求次数
    dunInfo: common.dunInfo,
    sane: common.sane
}

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
        kazeLocalData.dunInfo.dunTime = new Date().getTime();
        settings.source.includes(0) ? this.GetAndProcessData(kazeSource['bili']) : delete kazeLocalData.cardlistdm.bili;
        settings.source.includes(1) ? this.GetAndProcessData(kazeSource['weibo']) : delete kazeLocalData.cardlistdm.weibo;
        settings.source.includes(2) ? this.GetAndProcessData(kazeSource['yj']) : delete kazeLocalData.cardlistdm.yj;
        settings.source.includes(3) ? this.GetAndProcessData(kazeSource['cho3']) : delete kazeLocalData.cardlistdm.cho3;
        settings.source.includes(4) ? this.GetAndProcessData(kazeSource['ys3']) : delete kazeLocalData.cardlistdm.ys3;
        settings.source.includes(5) ? this.GetAndProcessData(kazeSource['sr']) : delete kazeLocalData.cardlistdm.sr;
        settings.source.includes(6) ? this.GetAndProcessData(kazeSource['tl']) : delete kazeLocalData.cardlistdm.tl;
        settings.source.includes(7) ? this.GetAndProcessData(kazeSource['gw']) : delete kazeLocalData.cardlistdm.gw;
        settings.source.includes(8) ? this.GetAndProcessData(kazeSource['tlgw']) : delete kazeLocalData.cardlistdm.tlgw;
        settings.source.includes(9) ? this.GetAndProcessData(kazeSource['wyyyy']) : delete kazeLocalData.cardlistdm.wyyyy;
    },

    //请求 处理 回调 保存
    GetAndProcessData(dataSource) {
        kazeLocalData.dunInfo.dunIndex++;
        dataSource
          .fetchData(kazeLocalData, kazeFun)
          .then(newCardList => {
              let oldCardList = kazeLocalData.cardlistdm[dataSource.dataName];
              let isNew = kazeFun.JudgmentNew(oldCardList, newCardList, dataSource.title);
              if (isNew) {
                  kazeLocalData.cardlistdm[dataSource.dataName] = newCardList;
                  StorageUtil.saveLocalStorage(`cardlistdm`, kazeLocalData.cardlistdm);
              }
        })
    },

}

// 通用方法
kazeFun = {
    // 通讯组专用 检测到了可能会更新
    JudgmentNewFocusAnnounceId(data) {
        if (data) {
            if (kazeData.FocusAnnounceId && data.focusAnnounceId && kazeData.FocusAnnounceId != data.focusAnnounceId) {
                this.SendNotice(`【通讯组预告】小刻貌似闻到了饼的味道！`, '检测到游戏出现公告弹窗，可能马上发饼！', null, new Date().getTime())
            }
            kazeData.FocusAnnounceId = data.focusAnnounceId;
        }
    },

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
                this.SendNotice(`小刻在【${title}】里面找到了一个饼！`, notice, newInfo.image, newInfo.id)
            }
            return true;
        }
        else if (!oldList) {
            return true;
        }
        return false
    },

    // 发送推送核心方法
    SendNotice(title, message, imageUrl, id) {
        if (imageUrl) {
            chrome.notifications.create(id + '_', {
                iconUrl: '../assets/image/icon.png',
                message: message,
                title: title,
                imageUrl: imageUrl,
                type: "image"
            });
        } else {
            chrome.notifications.create(id + '_', {
                iconUrl: '../assets/image/icon.png',
                message: message,
                title: title,
                type: "basic"
            });
        }
    },

    //蹲饼间隔时间 自带第一次请求 自带清除当前循环 秒
    settimeoutGetData(time) {
        kazeSourceProcess.GetData();
        this.checkDarkModel();
        this.checkLowfrequencyModel();
        StorageUtil.saveLocalStorage('dunInfo', kazeLocalData.dunInfo);

        // 如果没有传time 获取setting时间
        if (!time) {
            time = settings.time;
            // 低频模式
            if (settings.islowfrequency) {
                time = (time * 2);
            }
        }
        setTimeout(() => {
            this.settimeoutGetData();
        }, parseInt(time) * 1000);
    },

    // 检查一次更新
    getUpdateInfo(isAlert) {
        HttpUtil.GET(`http://cdn.liuziyang.vip/Dun-Cookies-Info.json?t=${new Date().getTime()}`).then(responseText => {
            let data = JSON.parse(responseText)
            if (kazeLocalData.saveInfo.version != data.upgrade.v) {
                // 更新
                var urlToOpen = chrome.extension.getURL("update.html");
                chrome.tabs.create({
                    url: urlToOpen,
                });
            } else {
                if (isAlert) {
                    alert('当前版本为最新版本')
                }
            }
        });
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
            StorageUtil.saveLocalStorage('setting', settings);
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
            StorageUtil.saveLocalStorage('setting', settings);
        }
    },

    // 获取浏览器信息 (0:chrome内核 1:火狐内核 2:手机端 3:其他) 
    getWebType() {
        let head = navigator.userAgent;
        if (head.indexOf("Android") > 1 || head.indexOf("iPhone") > 1) {
            kazeLocalData.saveInfo.webType = 2;
        } else if (head.indexOf("Firefox") > 1) {
            kazeLocalData.saveInfo.webType = 1;
        } else if (head.indexOf("Chrome") > 1) {
            kazeLocalData.saveInfo.webType = 0;
        } else {
            kazeLocalData.saveInfo.webType = 3;
        }
    },

    // 初始化
    Init() {
        // chrome.browserAction.setBadgeText({ text: 'Beta' });
        // chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        // 初始化
        kazeFun.getWebType();
        StorageUtil.saveLocalStorage('dunInfo', kazeLocalData.dunInfo);
        StorageUtil.saveLocalStorage('saveInfo', kazeLocalData.saveInfo);
        // 默认设置
        settings.reloadSettings().then(() => {
            // 注册窗口
            if (!settings.isWindow) {
                chrome.browserAction.setPopup({ popup: chrome.extension.getURL("popup.html") });
            } else {
                chrome.browserAction.setPopup({ popup: "" });
            }
            kazeLocalData.sane.saneIndex = settings.saneMax;
            StorageUtil.saveLocalStorage('sane', kazeLocalData.sane);
            this.settimeoutGetData();
        });

        // 监听前台事件
        BrowserUtil.addMessageListener(function (request, sender, sendResponse) {
            if (request.info == "reload") {
                // 刷新
                kazeSourceProcess.GetData();
            }
            else if (request.info == "reloadInterval") {
                settings.reloadSettings();
            }
            else if (request.info == "setting") {
                settings.reloadSettings().then(data => {
                    kazeLocalData.cardlistdm = {};
                    kazeLocalData.sane.saneIndex = data.saneMax;
                    StorageUtil.saveLocalStorage('sane', kazeLocalData.sane);
                    kazeSourceProcess.GetData();
                    if (!settings.isWindow) {
                        // 注册popup
                        chrome.browserAction.setPopup({ popup: chrome.extension.getURL("popup.html") });
                    } else {
                        chrome.browserAction.setPopup({ popup: "" });
                    }
                })
            }
            else if (request.info == "getUpdateInfo") {
                // 重启定时器
                kazeFun.getUpdateInfo('alert');
            }
            else if (request.info == "sane") {
                StorageUtil.getLocalStorage('sane').then(data => {
                    kazeLocalData.sane = data;
                    if (kazeLocalData.sane.saneIndex == settings.saneMax) {
                        kazeFun.SendNotice(`哼哼！理智已满！`, `理智已经满了，请博士不要再逗我玩了`, null, new Date().getTime());
                        return;
                    }
                    // 重启定时器
                    if (kazeData.setIntervalID) {
                        clearInterval(kazeData.setIntervalID);
                        kazeData.setIntervalID = null;
                    }
                    if (kazeLocalData.sane.sanePush) {
                        kazeData.setIntervalID = setInterval(() => {
                            kazeLocalData.sane.saneIndex++
                            if (kazeLocalData.sane.saneIndex >= settings.saneMax) {
                                kazeLocalData.sane.saneIndex = settings.saneMax;
                                kazeFun.SendNotice(`理智已满`, `理智已经满了，请博士赶快上线清理智！`, null, new Date().getTime());
                                clearInterval(kazeData.setIntervalID);
                                kazeData.setIntervalID = null;
                            } else {
                                StorageUtil.saveLocalStorage('sane', kazeLocalData.sane);
                            }
                            console.log(kazeLocalData.sane.saneIndex);
                        }, 360000);
                    }
                });
            }
        })

        // 监听标签
        chrome.notifications.onClicked.addListener(id => {
            let cardlist = Object.values(kazeLocalData.cardlistdm)
                .reduce((acc, cur) => [...acc, ...cur], [])
                .filter(x => x.id + "_" == id);
            if (cardlist != null && cardlist.length > 0) {
                chrome.tabs.create({ url: cardlist[0].url });
            } else {
                alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
            }
        });

        // 监听安装更新
        chrome.runtime.onInstalled.addListener(details => {
            if (details.reason === 'install') {
                var urlToOpen = chrome.extension.getURL("welcome.html");
                chrome.tabs.create({
                    url: urlToOpen,
                });
            }
        });

        // 监听标签打开
        chrome.browserAction.onClicked.addListener(() => {
            if (settings.isWindow) {
                if (kazeData.windowTabId != null) {
                    chrome.windows.remove(kazeData.windowTabId);
                }
                // 直接打开
                chrome.windows.create({ url: chrome.extension.getURL("windowPopup.html"), type: "panel", width: 1100, height: 750 }, tab => {
                    kazeData.windowTabId = tab.id;
                });
            }
        });

        if (kazeData.isTest) {
            // 默认设置
            settings.reloadSettings().then(data => {
                settings.time = kazeData.testIntervalTime;
                settings.saveSettings();
            });
            kazeLocalData.saveInfo.version = `【调试模式】 刷新时间临时调整为${kazeData.testIntervalTime}秒`;
            StorageUtil.saveLocalStorage('saveInfo', kazeLocalData.saveInfo);

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
