
//数据下来后都定位固定格式 没有不用管
var date = {
    time: '时间',
    judgment: '判定字段 微博B站用时间 鹰角用id',
    dynamicInfo: '处理后内容 用于展示',
    html: '处理前内容 原始字段',
    image: '获取到的图片',
    type: '当前条目的类型',
    source: '条目来源',
    url: '跳转后连接',
    detail: '详情列表，以后进入二级页面使用'
}

var Kaze = {
    cardlistdm: {},
    version: '2.0.0 Repair',
    isTest: false,
    //请求次数
    dunIndex: 0,
    dunTime: new Date(),
    // 循环的标识
    setIntervalindex: 0,
    source: ['bili', 'weibo', 'yj', 'cho3', 'ys3'],
    setting: {
        time: 15,
        source: [0, 1, 2, 3, 4],
        fontsize: 0,
        imgshow: true
    },
    //判断是否为最新
    JudgmentNew(oldList, newList, title, source) {
        //判断方法 取每条的第一个判定字段  如果新的字段不等于旧的且大于旧的 判定为新条目
        if (oldList && (oldList.length > 0 && oldList[0].judgment != newList[0].judgment && newList[0].judgment > oldList[0].judgment)) {
            let newInfo = newList[0];
            let timeNow = new Date()
            let notice = newInfo.dynamicInfo.replace(/\n/g, "");
            console.log(title, `${timeNow.getFullYear()}-${timeNow.getMonth + 1()}-${timeNow.getDay()} ${timeNow.getHours()}：${timeNow.getMinutes()}：${timeNow.getSeconds()}`, dynamicInfo, oldList[0]);
            Kaze.SendNotice(`【${title}】喂公子吃饼!`, notice, dynamicInfo.image, dynamicInfo.time)
        }
    },
    // 发送推送核心方法
    SendNotice(title, message, imageUrl, time) {
        if (imageUrl) {
            chrome.notifications.create(time + '_', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                imageUrl: imageUrl,
                type: "image"
            });
        } else {
            chrome.notifications.create(time + '_', {
                iconUrl: '../assets/image/icon.png',
                message: message,
                title: title,
                type: "basic"
            });
        }
    },
    // 蹲饼入口
    GetData() {
        this.dunIndex++;
        this.dunTime = new Date();
        this.setting.source.includes(0) ? getBili.Getdynamic() : Kaze.cardlistdm.bili = [];
        this.setting.source.includes(1) ? getWeibo.Getdynamic() : Kaze.cardlistdm.weibo = [];
        this.setting.source.includes(2) ? getYj.Getdynamic() : Kaze.cardlistdm.yj = [];
        this.setting.source.includes(3) ? getCho3.Getdynamic() : Kaze.cardlistdm.cho3 = [];
        this.setting.source.includes(4) ? getYs3.Getdynamic() : Kaze.cardlistdm.ys3 = [];
    },
    // 获取数据
    Get(url, success) {
        try {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                    success(xhr.responseText);
                }
            }
            xhr.send();
        } catch (error) {
            console.log(error);
        }
    },

    //蹲饼间隔时间
    SetInterval(time) {
        this.setIntervalindex = setInterval(() => {
            this.dunTime = new Date();
            this.GetData();
        }, parseInt(time) * 1000);
    },

    // 初始化
    Init() {
        chrome.browserAction.setBadgeText({ text: 'Vue' });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        chrome.storage.local.get(['setting'], result => {
            if (result.setting == undefined) {
                chrome.storage.local.set({
                    setting: this.setting,
                });
            } else {
                this.setting = result.setting;
            }
            this.GetData();
            this.SetInterval(this.setting.time);
        });

        // 监听标签
        chrome.notifications.onClicked.addListener(id => {
            let { weibo = [], cho3 = [], yj = [], bili = [] } = Kaze.cardlistdm;
            let cardlist = [...weibo, ...cho3, ...yj, ...bili];
            let todynamic = cardlist.filter(x => x.time + "_" == id);
            if (todynamic != null && todynamic.length > 0) {
                chrome.tabs.create({ url: todynamic[0].url });
            } else {
                alert('最近列表内没有找到该标签');
            }
        });
        if (this.isTest) {
            getBili.url = `test/bJson.json?host_uid=161775300`;
            getWeibo.opt.url = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
            getYj.url = `test/yJson.json`;
            getCho3.opt.url = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
            getYs3.opt.url = `test/ysJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
        }
    }
}

let getAndProcessWeiboData = {
    cardlist: {},
    defopt: {
        url: '',//网址
        dturl: '',//连接网址
        title: '',//弹窗标题
        dataName: '',//数据源对象名称
        success: {},//回调方法
        source: 1,//来源
    },
    getdynamic(opt) {
        opt = Object.assign({}, this.defopt, opt);
        this.cardlist[opt.dataName] = [];
        Kaze.Get(opt.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            try {
                let data = JSON.parse(responseText);
                if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                    this.cardlist[opt.dataName] = data.data.cards
                        .filter(x => x.hasOwnProperty('mblog') && !x.mblog.hasOwnProperty('title') && !x.mblog.hasOwnProperty('retweeted_status'))
                        .map(x => {
                            let dynamicInfo = x.mblog;
                            let weiboId = data.data.cardlistInfo.containerid;
                            let time = Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000);
                            return {
                                time: time,
                                judgment: time,
                                dynamicInfo: this.regexp(dynamicInfo.text),
                                html: dynamicInfo.text,
                                image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                                type: this.getdynamicType(dynamicInfo),
                                source: opt.source,
                                url: "https://weibo.com/" + weiboId.substring((weiboId.length - 10), weiboId.length) + "/" + x.mblog.bid,
                                detail: []
                            };
                        }).sort((x, y) => y.judgment - x.judgment);
                    console.log(this.cardlist[opt.dataName]);
                    Kaze.JudgmentNew(Kaze.cardlistdm[opt.dataName], this.cardlist[opt.dataName], opt.title, opt.source);
                    Kaze.cardlistdm[opt.dataName] = this.cardlist[opt.dataName];
                    if (typeof opt.success == 'function') {
                        opt.success(hasNew, this.cardlist[opt.dataName]);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });
    },
    getdynamicType(dynamic) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamic.hasOwnProperty("page_info") && dynamic.page_info.hasOwnProperty('type') && dynamic.page_info.type == "video") {
            type = 0;
        }
        else {
            type = 1;
        }
        return type;
    },
    regexp(text) {
        return text.replace(
            /<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<\img.*?>|全文|网页链接/g,
            '')
    },
}

let getBili = {

    url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web`,
    dturl: `https://space.bilibili.com/161775300/dynamic`,
    // B站：动态列表
    cardlist: [],
    // bilibili版本
    Getdynamic() {
        this.cardlist = [];
        Kaze.Get(this.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            let data = JSON.parse(responseText);
            if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                this.cardlist = data.data.cards
                    .filter(x => (x.desc.type == 2 || x.desc.type == 4 || x.desc.type == 8 || x.desc.type == 64))
                    .map(x => {
                        let dynamicInfo = JSON.parse(x.card);
                        let card = {
                            time: x.desc.timestamp,
                            judgment: x.desc.timestamp,
                            source: 0,
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
                        return card;
                    }).sort((x, y) => y.judgment - x.judgment);
                console.log(this.cardlist);
                Kaze.JudgmentNew(Kaze.cardlistdm.bili, this.cardlist, 'B站', 0);
                Kaze.cardlistdm.bili = this.cardlist;
            }

        });
    },
}

let getWeibo = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
        dturl: 'https://weibo.com/arknights',
        title: '官方微博',
        dataName: 'weibo',
        source: 1,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

let getYj = {
    url: `https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json`,
    // 通讯录：动态列表
    cardlist: [],
    // 通讯录
    Getdynamic() {
        this.cardlist = [];
        Kaze.Get(this.url, (responseText) => {
            try {
                let data = JSON.parse(responseText);
                this.cardlist = data.announceList
                    .filter(x => !(x.announceId == 94 || x.announceId == 98 || x.announceId == 192 || x.announceId == 95 || x.announceId == 97))
                    .map(x => {
                        // 屏蔽几个条目 先用ID 看有没有问题
                        return {
                            time: Math.floor(new Date(`${(new Date().getFullYear())}/${x.month}/${x.day} 23:59:59`).getTime() / 1000),
                            judgment: x.announceId,
                            dynamicInfo: x.title,
                            source: 2,
                            url: x.webUrl,
                        };
                    }).sort((x, y) => {
                        return y.judgment - x.judgment;
                    });
                Kaze.JudgmentNew(Kaze.cardlistdm.yj, this.cardlist, '通讯组', 2);
                Kaze.cardlistdm.yj = this.cardlist;
            } catch (error) {
                console.log(error);
            }

        });
    }
}

let getCho3 = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
        dturl: 'https://weibo.com/u/6441489862',
        title: '朝陇山',
        dataName: 'cho3',
        source: 3,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

let getYs3 = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
        dturl: 'https://weibo.com/u/7506039414',
        title: '一拾山',
        dataName: 'ys3',
        source: 4,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

Kaze.Init();
window.Kaze = Kaze;