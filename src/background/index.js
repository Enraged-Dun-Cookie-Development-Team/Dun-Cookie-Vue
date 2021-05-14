
import { common } from "../assets/JS/common";
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
    isTop: '在列表中是否为置顶内容 仅限微博'
}

// 软件临时数据
let kazeData = {
    isTest: false,
    testIntervalTime: 3,
    setting: {}
}

// 软件存储数据 数据互通使用
let kazeLocalData = {
    // 仅仅只是保存
    saveInfo: common.saveInfo,
    cardlistdm: {},
    //请求次数
    dunInfo: common.dunInfo,
    setting: common.setting,
}

// 数据来源
let kazeSource = {
    bili: {
        url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web',
        title: 'B站',
        dataName: 'bili',
        source: 0,
    },
    weibo: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
        title: '官方微博',
        dataName: 'weibo',
        source: 1,
    },
    yj: {
        url: 'https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json',
        title: '通讯组',
        dataName: 'yj',
        source: 2,
    },
    cho3: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
        title: '朝陇山',
        dataName: 'cho3',
        source: 3,
    },
    ys3: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
        title: '一拾山',
        dataName: 'ys3',
        source: 4,
    },
    sr: {
        url: 'https://monster-siren.hypergryph.com/api/news',
        title: '塞壬唱片',
        dataName: 'sr',
        source: 5,
    },
    tl: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=7499841383&containerid=1076037499841383',
        title: '泰拉记事社微博',
        dataName: 'tl',
        source: 6,
    },
    gw: {
        url: 'https://ak.hypergryph.com/',
        title: '官网',
        dataName: 'gw',
        source: 7,
    },
    tlgw: {
        url: ['https://terra-historicus.hypergryph.com/api/comic/7748', 'https://terra-historicus.hypergryph.com/api/comic/2865'], 
        title: '泰拉记事社',
        dataName: 'tlgw',
        source: 8,
    },
}

// 数据获取和处理
let kazeSourceProcess = {
    // 蹲饼入口
    GetData() {
        kazeLocalData.dunInfo.dunTime = new Date().getTime();

        kazeLocalData.setting.source.includes(0) ? this.GetAndProcessData(kazeSource['bili']) : delete kazeLocalData.cardlistdm.bili;
        kazeLocalData.setting.source.includes(1) ? this.GetAndProcessData(kazeSource['weibo']) : delete kazeLocalData.cardlistdm.weibo;
        kazeLocalData.setting.source.includes(2) ? this.GetAndProcessData(kazeSource['yj']) : delete kazeLocalData.cardlistdm.yj;
        kazeLocalData.setting.source.includes(3) ? this.GetAndProcessData(kazeSource['cho3']) : delete kazeLocalData.cardlistdm.cho3;
        kazeLocalData.setting.source.includes(4) ? this.GetAndProcessData(kazeSource['ys3']) : delete kazeLocalData.cardlistdm.ys3;
        kazeLocalData.setting.source.includes(5) ? this.GetAndProcessData(kazeSource['sr']) : delete kazeLocalData.cardlistdm.sr;
        kazeLocalData.setting.source.includes(6) ? this.GetAndProcessData(kazeSource['tl']) : delete kazeLocalData.cardlistdm.tl;
        kazeLocalData.setting.source.includes(7) ? this.GetAndProcessData(kazeSource['gw']) : delete kazeLocalData.cardlistdm.gw;
        kazeLocalData.setting.source.includes(8) ? this.GetAndProcessData(kazeSource['tlgw']) : delete kazeLocalData.cardlistdm.tlgw;

    },

    //请求 处理 回调 保存
    GetAndProcessData(opt) {
        let defopt = {
            url: '',//网址
            title: '',//弹窗标题
            dataName: '',//数据源对象名称
            success: {},//回调方法
            source: 1,//来源
        };
        opt = Object.assign({}, defopt, opt);
        this.Get(opt.url).then(data => {
            opt.responseText = data;
            let newCardList = [];
            // source: ['bili', 'weibo', 'yj', 'cho3', 'ys3', 'sr', 'tl', 'tlgw', ]
            if (opt.source == 0) {
                newCardList = this.processBiliBili(opt);
            }
            else if (opt.source == 1 || opt.source == 3 || opt.source == 4 || opt.source == 6) {
                newCardList = this.processWeibo(opt)
            }
            else if (opt.source == 2) {
                newCardList = this.processYj(opt)
            }
            else if (opt.source == 5) {
                newCardList = this.processSr(opt)
            }
            else if (opt.source == 7) {
                newCardList = this.processGw(opt)
            }
            else if (opt.source == 8) {
                newCardList = this.processTlGw(opt)
            }

            let oldCardList = kazeLocalData.cardlistdm[opt.dataName];
            let isNew = kazeFun.JudgmentNew(oldCardList, newCardList, opt.title);
            if (isNew) {
                kazeLocalData.cardlistdm[opt.dataName] = newCardList;
                kazeFun.saveLocalStorage(`cardlistdm`, kazeLocalData.cardlistdm);
            }
        });
    },

    // 获取数据
    Get(url, isDun = true) {
        if (isDun) {
            kazeLocalData.dunInfo.dunIndex++;
        }
        try {
            if (typeof url == "string") {
                url = [url];
            }
            return new Promise((resolve) => {
                Promise.all(url.map(item => this.GetAlgorithm(item))).then((values) => {
                    resolve(values);
                });
            });
        } catch (error) {
            console.log(error);
        }
    },

    GetAlgorithm(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                    resolve(xhr.responseText);
                    return;
                }
            }
            xhr.send();
        });
    },

    // 处理微博源
    processWeibo(opt) {
        let list = [];
        let data = JSON.parse(opt.responseText);
        if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
            data.data.cards.forEach(x => {
                if (x.hasOwnProperty('mblog') && !x.mblog.hasOwnProperty('retweeted_status') && !x.mblog.hasOwnProperty('retweeted_status')) {
                    let dynamicInfo = x.mblog;
                    let weiboId = data.data.cardlistInfo.containerid;
                    let time = Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000);
                    let imageList = dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/large/${x}`);
                    list.push({
                        time: time,
                        id: time,
                        isTop: x.mblog.hasOwnProperty('isTop') && x.mblog.isTop == 1,
                        judgment: time,
                        dynamicInfo: dynamicInfo.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n'),
                        html: dynamicInfo.text,
                        image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                        imageList: imageList,
                        type: (dynamicInfo.hasOwnProperty("page_info") && dynamicInfo.page_info.hasOwnProperty('type') && dynamicInfo.page_info.type == "video") ? 0 : 1,
                        source: opt.source,
                        url: "https://weibo.com/" + weiboId.substring((weiboId.length - 10), weiboId.length) + "/" + x.mblog.bid,
                        detail: []
                    })
                }

            });
            return list.sort((x, y) => y.judgment - x.judgment);
        }
    },

    // 处理B站源
    processBiliBili(opt) {
        let list = [];
        let data = JSON.parse(opt.responseText);
        if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
            data.data.cards.forEach(x => {
                if (x.desc.type == 2 || x.desc.type == 4 || x.desc.type == 8 || x.desc.type == 64) {
                    let dynamicInfo = JSON.parse(x.card);
                    let card = {
                        time: x.desc.timestamp,
                        id: x.desc.timestamp,
                        judgment: x.desc.timestamp,
                        imageList: dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src),
                        source: opt.source,
                    };
                    //  desc.type  8 是视频 64是专栏 2是动态 4是无图片动态
                    if (x.desc.type == 2) {
                        card.image = (dynamicInfo.item.pictures && dynamicInfo.item.pictures.length > 0) ? dynamicInfo.item.pictures[0].img_src : null;
                        card.dynamicInfo = dynamicInfo.item.description;
                        card.type = 2;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                    } else if (x.desc.type == 4) {
                        card.dynamicInfo = dynamicInfo.item.content;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                        card.type = 4;
                    } else if (x.desc.type == 8) {
                        card.image = dynamicInfo.pic;
                        card.dynamicInfo = dynamicInfo.dynamic;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                        card.type = 8;
                    } else if (x.desc.type == 64) {
                        card.image = (dynamicInfo.image_urls && dynamicInfo.image_urls.length > 0) ? dynamicInfo.image_urls[0] : null;
                        card.dynamicInfo = dynamicInfo.summary;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                        card.type = 64;
                    }
                    list.push(card);
                }

            });
            return list.sort((x, y) => y.judgment - x.judgment);
        }
    },

    // 通讯组
    processYj(opt) {
        let list = [];
        let data = JSON.parse(opt.responseText);
        data.announceList.forEach(x => {
            if (x.announceId != 94 && x.announceId != 98 && x.announceId != 192 && x.announceId != 95 && x.announceId != 97) {
                let time = `${new Date().getFullYear()}/${x.month}/${x.day} ${kazeLocalData.setting.isTop ? '23:59:59' : '00:00:00'}`;
                list.push({
                    time: Math.floor(new Date(time).getTime() / 1000),
                    judgment: x.announceId,
                    id: x.announceId,
                    dynamicInfo: x.title,
                    source: opt.source,
                    url: x.webUrl,
                });
            }
        });
        return list.sort((x, y) => y.judgment - x.judgment);
    },

    // 唱片
    processSr(opt) {
        let list = [];
        let data = JSON.parse(opt.responseText);
        if (data && data.data && data.data.list) {
            data.data.list.forEach(x => {
                let time = Math.floor(new Date(`${x.date} ${kazeLocalData.setting.isTop ? '23:59:59' : '00:00:00'}`).getTime() / 1000);
                list.push({
                    time: time,
                    id: x.cid,
                    judgment: parseInt(x.cid) || time,
                    dynamicInfo: x.title,
                    source: opt.source,
                    url: `https://monster-siren.hypergryph.com/info/${x.cid}`,
                })
            });
            return list.sort((x, y) => y.time - x.time);
        }
    },

    // 官网
    processGw(opt) {
        let list = [];
        let str = opt.responseText;
        let gw = document.createElement('div');
        gw.innerHTML = str;
        let articleItem = gw.querySelectorAll(".articleList[data-category-key='ANNOUNCEMENT'] .articleItem,.articleList[data-category-key='ACTIVITY'] .articleItem,.articleList[data-category-key='NEWS'] .articleItem");
        articleItem.forEach((item, index) => {
            try {
                let date = item.getElementsByClassName('articleItemDate')[0].innerHTML
                let title = item.getElementsByClassName('articleItemTitle')[0].innerHTML
                let url = item.getElementsByClassName('articleItemLink')[0].pathname;
                let time = Math.floor(new Date(`${date} ${kazeLocalData.setting.isTop ? '23:59:59' : '00:00:00'}`).getTime() / 1000);
                let judgment = url.match(/\d+/g);
                list.push({
                    time: time,
                    id: judgment.length > 0 ? parseInt(judgment[0]) : index,
                    judgment: judgment.length > 0 ? parseInt(judgment[0]) : time,
                    dynamicInfo: title,
                    source: opt.source,
                    url: `https://ak.hypergryph.com${url}`,
                });
            } catch (error) {
                console.error('解析官网数据失败', item);
            }
        });
        return list.sort((x, y) => y.time - x.time);
    },

    // 泰拉记事社官网
    processTlGw(opt) {
        let list = [];
        opt.responseText.map(x => {
            let info = JSON.parse(x).data;
            info.episodes.reverse();
            list.push({
                time: info.updateTime,
                id: info.cid,
                judgment: info.updateTime,
                dynamicInfo:info.title ,
                source: opt.source,
                image:info.cover,
                html: info
            });
        });
        return list.sort((x, y) => y.time - x.time);
    }
}

// 通用方法
let kazeFun = {
    saveLocalStorage(name, data) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [name]: data }, result => {
                resolve(true);
            });
        });
    },
    getLocalStorage(name) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([name], result => {
                if (Object.keys(result).length != 0) {
                    resolve(result[name]);
                    return;
                }
                resolve(null);
            });
        });

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
            if (kazeLocalData.setting.isPush == true) {
                this.SendNotice(`【${title}】喂公子吃饼!`, notice, newInfo.image, newInfo.id)
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
        kazeFun.saveLocalStorage('dunInfo', kazeLocalData.dunInfo);

        // 如果没有传time 获取setting时间
        if (!time) {
            time = kazeLocalData.setting.time;
            // 低频模式
            if (kazeLocalData.setting.islowfrequency) {
                time = (time * 2);
            }
        }
        setTimeout(() => {
            this.settimeoutGetData();
        }, parseInt(time) * 1000);
    },

    // 检查一次更新
    getUpdateInfo(isAlert) {
        kazeSourceProcess.Get(`http://cdn.liuziyang.vip/Dun-Cookies-Info.json`, false).then(responseText => {
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
        let darkShow = kazeLocalData.setting.darkshow;
        let oldOutsideClass = kazeLocalData.setting.outsideClass;
        let newOutsideClass = (darkShow == -1 && (hour >= 18 || hour < 6)) || darkShow == 1
            ? "dark"
            : "light";

        if (oldOutsideClass != newOutsideClass) {
            kazeLocalData.setting.outsideClass = newOutsideClass;
            kazeFun.saveLocalStorage('setting', kazeLocalData.setting);
        }
    },
    checkLowfrequencyModel() {
        let hour = new Date().getHours();
        // 判断当前时间是否是启用低频模式的时间
        let lowfrequency = kazeLocalData.setting.lowfrequency;
        let lowfrequencyTime = kazeLocalData.setting.lowfrequencyTime;
        let oldislowfrequency = kazeLocalData.setting.islowfrequency;
        let starHour = lowfrequencyTime[0] < 12 ? lowfrequencyTime[0] + 12 : lowfrequencyTime[0] - 12;
        let endHour = lowfrequencyTime[1] < 12 ? lowfrequencyTime[1] + 12 : lowfrequencyTime[1] - 12;
        let newislowfrequency = (lowfrequency && (hour >= starHour || hour < endHour));
        if (oldislowfrequency != newislowfrequency) {
            kazeLocalData.setting.islowfrequency = newislowfrequency;
            kazeFun.saveLocalStorage('setting', kazeLocalData.setting);
        }
    },

    // 初始化
    Init() {
        chrome.browserAction.setBadgeText({ text: 'Beta' });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        // 初始化
        kazeFun.saveLocalStorage('dunInfo', kazeLocalData.dunInfo);
        kazeFun.saveLocalStorage('saveInfo', kazeLocalData.saveInfo);
        // 默认设置
        kazeFun.getLocalStorage('setting').then(data => {
            if (data) {
                kazeLocalData.setting = Object.assign({}, kazeLocalData.setting, data);
                kazeFun.saveLocalStorage('setting', kazeLocalData.setting);
            } else {
                kazeFun.saveLocalStorage('setting', kazeLocalData.setting);
            }

            // this.intervalGetData()
            this.settimeoutGetData();
        });

        // 监听前台事件
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.info == "reload") {
                // 刷新
                kazeSourceProcess.GetData();
            }
            else if (request.info == "reloadInterval") {
                kazeFun.getLocalStorage('setting').then(data => {
                    kazeLocalData.setting = data;
                    // kazeFun.intervalGetData();
                })
            }
            else if (request.info == "setting") {
                kazeFun.getLocalStorage('setting').then(data => {
                    kazeLocalData.cardlistdm = {};
                    kazeLocalData.setting = data;
                    kazeSourceProcess.GetData();
                    // kazeFun.intervalGetData();
                })
            }
            else if (request.info == "getUpdateInfo") {
                // 重启定时器
                kazeFun.getUpdateInfo('alert');
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


        if (kazeData.isTest) {
            // 默认设置
            kazeFun.getLocalStorage('setting').then(data => {
                kazeLocalData.setting = data;
                kazeLocalData.setting.time = kazeData.testIntervalTime;
                kazeFun.saveLocalStorage('setting', kazeLocalData.setting);
                // this.intervalGetData()
            });
            kazeLocalData.saveInfo.version = `【调试模式】 刷新时间临时调整为${kazeData.testIntervalTime}秒`;
            kazeFun.saveLocalStorage('saveInfo', kazeLocalData.saveInfo);

            kazeSource.bili.url = `test/bJson.json?host_uid=161775300`;
            kazeSource.weibo.url = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
            kazeSource.yj.url = `test/yJson.json`;
            kazeSource.cho3.url = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
            kazeSource.ys3.url = `test/ysJson.json?type=uid&value=7506039414&containerid=1076037506039414`;
            kazeSource.sr.url = `test/srJson.json`;
            kazeSource.tl.url = `test/tlJson.json?type=uid&value=6441489862&containerid=1076037499841383`;
            kazeSource.gw.url = `test/gw.html`;
            kazeSource.tlgw.url = ['test/xbJson.json', 'test/xgbJson.json'];
        }
    }
}

kazeFun.Init();