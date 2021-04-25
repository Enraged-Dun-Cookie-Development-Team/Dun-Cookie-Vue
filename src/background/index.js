
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

var Kaze = {
    isTest: false,
    testIntervalTime: 1,
    cardlistdm: {},
    version: '2.0.30',
    feedbackInfo: '',
    //请求次数
    dunIndex: 0,
    dunTime: new Date(),
    dunFristTime: new Date(),
    // 循环的标识
    setIntervalindex: 0,
    source: ['bili', 'weibo', 'yj', 'cho3', 'ys3', 'sr', 'tl', 'gw'],//哔哩哔哩 微博 通讯组 朝陇山 一拾山 任塞 泰拉记事社 官网
    setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5, 6],
        fontsize: 0,
        imgshow: true,
        isTop: true
    },
    //判断是否为最新
    JudgmentNew(oldList, newList, title) {
        //判断方法 取每条的第一个判定字段  如果新的字段不等于旧的且大于旧的 判定为新条目
        if (oldList && (oldList.length > 0 && oldList[0].judgment != newList[0].judgment && newList[0].judgment > oldList[0].judgment)) {
            let newInfo = newList[0];
            let timeNow = new Date()
            let notice = newInfo.dynamicInfo.replace(/\n/g, "");
            console.log(title, `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}-${timeNow.getDate()} ${timeNow.getHours()}：${timeNow.getMinutes()}：${timeNow.getSeconds()}`, newInfo, oldList[0]);
            Kaze.SendNotice(`【${title}】喂公子吃饼!`, notice, newInfo.image, newInfo.id)
        }
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
    // 蹲饼入口
    GetData() {
        this.dunIndex++;
        this.dunTime = new Date();
        this.setting.source.includes(0) ? getBili.Getdynamic() : Kaze.cardlistdm.bili = [];
        this.setting.source.includes(1) ? getWeibo.Getdynamic() : Kaze.cardlistdm.weibo = [];
        this.setting.source.includes(2) ? getYj.Getdynamic() : Kaze.cardlistdm.yj = [];
        this.setting.source.includes(3) ? getCho3.Getdynamic() : Kaze.cardlistdm.cho3 = [];
        this.setting.source.includes(4) ? getYs3.Getdynamic() : Kaze.cardlistdm.ys3 = [];
        this.setting.source.includes(5) ? getSr.Getdynamic() : Kaze.cardlistdm.sr = [];
        this.setting.source.includes(6) ? getTl.Getdynamic() : Kaze.cardlistdm.tl = [];
        // this.setting.source.includes(7) ? getGw.Getdynamic() : Kaze.cardlistdm.gw = [];
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
    // 检查一次更新
    getUpdateInfo() {
        Kaze.Get(opt.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {

        })
    },

    // 初始化
    Init() {
        // chrome.browserAction.setBadgeText({ text: 'Beta' });
        // chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        //第一次安装更新
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
            let { weibo = [], cho3 = [], yj = [], bili = [], sr = [], tl = [] } = Kaze.cardlistdm;
            let cardlist = [...weibo, ...cho3, ...yj, ...bili, ...sr, ...tl];
            let todynamic = cardlist.filter(x => x.id + "_" == id);
            if (todynamic != null && todynamic.length > 0) {
                chrome.tabs.create({ url: todynamic[0].url });
            } else {
                alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
            }
        });

        chrome.runtime.onInstalled.addListener(details => {
            if (details.reason === 'install') {
                var urlToOpen = chrome.extension.getURL("welcome.html");
                chrome.tabs.create({
                    url: urlToOpen,
                });
            }
            if (details.reason === 'update') {
                // 更新
            }
        });

        this.feedbackInfo = `<div>
        <span>
          如果有意见或建议或者是反馈问题或者是发现程序出现bug，可以添加<a
            href="https://jq.qq.com/?_wv=1027&k=Vod1uO13"
            >【蹲饼测试群】</a
          >反馈或<a href="Mailto:kaze.liu@qq.com.com">给我发邮件</a>反馈<br />
          也可以去github上查看<a
            href="https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue"
            >Dun-Cookie-Vue</a
          ><br />
          也可以去Chrome应用商店查看更新，但是因为审核机制，更新速度会慢于QQ群和github
          <br />
          <br />
          <div style="color: #aaa">
            获取更新机制因为没钱买服务器，现在正在想办法
          </div>
        </span>
      </div>`;

        if (this.isTest) {
            clearInterval(
                this.setIntervalindex
            );
            this.SetInterval(this.testIntervalTime);
            this.setting.time = this.testIntervalTime;
            this.version = `${this.version}【已启用调试模式】 刷新时间临时调整为${this.testIntervalTime}秒`;
            getBili.url = `test/bJson.json?host_uid=161775300`;
            getWeibo.opt.url = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
            getYj.url = `test/yJson.json`;
            getCho3.opt.url = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
            getYs3.opt.url = `test/ysJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
            getSr.url = `test/srJson.json`;
            getYs3.opt.url = `test/tlJson.json?type=uid&value=6441489862&containerid=1076037499841383`;
        }
    }
}

let getAndProcessWeiboData = {
    cardlist: {},
    defopt: {
        url: '',//网址
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
                        .filter(x => x.hasOwnProperty('mblog')
                            && !x.mblog.hasOwnProperty('retweeted_status'))
                        .map(x => {
                            let dynamicInfo = x.mblog;
                            let weiboId = data.data.cardlistInfo.containerid;
                            let time = Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000);
                            let imageList = dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/large/${x}`)
                            return {
                                time: time,
                                id: time,
                                isTop: x.mblog.hasOwnProperty('isTop') && x.mblog.isTop == 1,
                                judgment: time,
                                dynamicInfo: this.weiboRegexp(dynamicInfo.text),
                                html: dynamicInfo.text,
                                image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                                imageList: imageList,
                                type: this.getdynamicType(dynamicInfo),
                                source: opt.source,
                                url: "https://weibo.com/" + weiboId.substring((weiboId.length - 10), weiboId.length) + "/" + x.mblog.bid,
                                detail: []
                            };
                        }).sort((x, y) => y.judgment - x.judgment);
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
    //微博数据处理 把<br />替换为 /r/n
    weiboRegexp(text) {
        return text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n')
    },
}

let getBili = {
    url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web`,
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
                            id: x.desc.timestamp,
                            judgment: x.desc.timestamp,
                            imageList: dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src),
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
                Kaze.JudgmentNew(Kaze.cardlistdm.bili, this.cardlist, 'B站', 0);
                Kaze.cardlistdm.bili = this.cardlist;
            }

        });
    },
}

let getWeibo = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
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
                    // 屏蔽几个条目 先用ID 看有没有问题
                    .filter(x => !(x.announceId == 94 || x.announceId == 98 || x.announceId == 192 || x.announceId == 95 || x.announceId == 97))
                    .map(x => {
                        let time = `${new Date().getFullYear()}/${x.month}/${x.day} ${Kaze.setting.isTop ? '23:59:59' : '00:00:00'}`;
                        return {
                            time: Math.floor(new Date(time).getTime() / 1000),
                            judgment: x.announceId,
                            id: x.announceId,
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
        title: '一拾山',
        dataName: 'ys3',
        source: 4,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

let getSr = {
    url: `https://monster-siren.hypergryph.com/api/news`,
    cardlist: [],
    Getdynamic() {
        this.cardlist = [];
        Kaze.Get(this.url, (responseText) => {
            let data = JSON.parse(responseText);
            if (data && data.data && data.data.list) {
                this.cardlist = data.data.list.map(item => {
                    let time = Math.floor(new Date(`${item.date} ${Kaze.setting.isTop ? '23:59:59' : '00:00:00'}`).getTime() / 1000);
                    return {
                        time: time,
                        id: item.cid,
                        judgment: time,
                        dynamicInfo: item.title,
                        source: 5,
                        url: `https://monster-siren.hypergryph.com/info/${item.cid}`,
                    }
                }).sort((x, y) => y.judgment - x.judgment);
                Kaze.JudgmentNew(Kaze.cardlistdm.sr, this.cardlist, '塞壬唱片', 5);
                Kaze.cardlistdm.sr = this.cardlist;
            }
        });
    },
}

let getTl = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=7499841383&containerid=1076037499841383',
        title: '泰拉记事社',
        dataName: 'tl',
        source: 6,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

Kaze.Init();
window.Kaze = Kaze;