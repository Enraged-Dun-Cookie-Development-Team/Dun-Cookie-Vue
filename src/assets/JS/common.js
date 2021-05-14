let common = {
    setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        fontsize: 0,
        imgshow: true,
        isTag: false,
        tagActiveName: null,
        isTop: true,
        isPush: true,
        darkshow: 0,// 黑暗模式按钮
        outsideClass: "light",// 默认白天
        lowfrequency: false,// 低频模式按钮
        lowfrequencyTime: [8, 20],// 低频模式时段 需要转换
        islowfrequency: false, // 是否正处于低频模式状态下
    },
    dunInfo: {
        dunIndex: 0,
        dunTime: new Date().getTime(),
        dunFristTime: new Date().getTime(),
    },
    saveInfo: {
        // 循环的标识
        setIntervalindex: 0,
        version: '2.0.88',
        feedbackInfo: `<div class="footer">
        <span>
          如果有意见或建议或者是反馈问题或者是发现程序出现bug<br />可以添加<a
            href="https://jq.qq.com/?_wv=1027&k=Vod1uO13"
            >【蹲饼测试群】</a
          >反馈或<a href="Mailto:kaze.liu@qq.com.com">给我发邮件</a>反馈<br />
          也可以去github上查看<a
            href="https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue"
            >Dun-Cookie-Vue</a
          ><br />
          也可以去Chrome应用商店查看更新，但是因为审核机制，更新速度会慢于QQ群和github
          <br />
        </span>
      </div>`
    },
    quickJump:{
        soure: [
          {
            url: "https://ak.hypergryph.com/#information",
            name: "官方网站",
            img: numberOrEnNameToIconSrc(7),
          },
          {
            url: "https://space.bilibili.com/161775300/dynamic",
            name: "官方哔哩哔哩",
            img:  numberOrEnNameToIconSrc(0)
          },
          {
            url: "https://weibo.com/arknights",
            name: "官方微博",
            img: numberOrEnNameToIconSrc(1),
          },
          {
            url: "https://weibo.com/u/6441489862",
            name: "朝陇山微博",
            img:  numberOrEnNameToIconSrc(3),
            radius: true,
          },
          {
            url: "https://weibo.com/u/7506039414",
            name: "一拾山微博",
            img:  numberOrEnNameToIconSrc(4),
            radius: true,
          },
          {
            url: "https://monster-siren.hypergryph.com/",
            name: "塞壬官网",
            img:  numberOrEnNameToIconSrc(5),
            radius: true,
          },
          {
            url: "https://weibo.com/u/7499841383",
            name: "泰拉记事社微博",
            img:  numberOrEnNameToIconSrc(6),
            radius: true,
          },
          {
            url: "https://terra-historicus.hypergryph.com/",
            name: "泰拉记事社官网",
            img:  numberOrEnNameToIconSrc(8),
            radius: true,
          },
        ],
        tool: [
          {
            url: "http://prts.wiki/",
            name: "PRTS.Wiki",
            img: "/assets/image/akwiki.png",
            radius: true,
          },
          {
            url: "https://mapcn.ark-nights.com",
            name: "PRTS.Map",
            img: "/assets/image/akmap.ico",
            radius: true,
          },
          {
            url: "https://penguin-stats.cn/",
            name: "企鹅物流",
            img: "/assets/image/penguin_stats_logo.webp",
            radius: true,
          },
          {
            url: "https://www.bigfun.cn/tools/aktools/",
            name: "明日方舟工具箱",
            img: "/assets/image/mrgzjjx.png",
            radius: true,
          },
          {
            url: "https://opssr.net/",
            name: "源石作战室",
            img: "/assets/image/yszzs.png",
            radius: true,
          },
          {
            url: "https://kokodayo.fun/",
            name: "Kokodayo",
            img: "/assets/image/kkdy.png",
            radius: true,
          },
          {
            url: "https://aog.wiki/",
            name: "刷素材一图流",
            img: "/assets/image/akgraph.ico",
            radius: true,
          },
          {
            url: "https://viktorlab.cn/akdata/",
            name: "Arknight DPS",
            img: "/assets/image/dps.ico",
            radius: true,
          },
        ],
      },
}

function timespanToDay(date, type) {
    date = date * 1000;
    date = new Date(date);
    let Y = date.getFullYear();
    let M = date.getMonth() + 1;
    let D = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    if (type == 0) {
        return `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
    } else if (type == 1) {
        return `${Y}-${addZero(M)}-${addZero(D)}`;
    } else {
        return `${Y}-${addZero(M)}-${addZero(D)} ${addZero(h)}:${addZero(m)}:${addZero(s)}`;
    }

};

function addZero(m) {
    return m < 10 ? "0" + m : m;
}

function Get(url) {
    try {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = () => {
                if (
                    xhr.readyState == 4 &&
                    xhr.status == 200 &&
                    xhr.responseText != ""
                ) {
                    resolve(xhr.responseText);
                }
            };
            xhr.send();
        });
    } catch (error) {
        console.log(error);
    }
};

function numberOrEnNameToName(int) {
    switch (int) {
        case 0:
        case "bili":
            return "哔哩哔哩"
            break;
        case 1:
        case "weibo":
            return "微博"
            break;
        case 2:
        case "yj":
            return "通讯组"
            break;
        case 3:
        case "cho3":
            return "朝陇山"
            break;
        case 4:
        case "ys3":
            return "一拾山"
            break;
        case 5:
        case "sr":
            return "塞壬唱片"
            break;
        case 6:
        case "tl":
            return "泰拉记事社微博"
            break;
        case 7:
        case "gw":
            return "官网网站"
            break;
        case 8:
        case "tlgw":
            return "泰拉记事社官网"
            break;
    }
}

function numberOrEnNameToIconSrc(int) {
    switch (int) {
        case 0:
        case "bili":
            return "/assets/image/bili.ico"
            break;
        case 1:
        case "weibo":
            return "/assets/image/weibo.ico"
            break;
        case 2:
        case "yj":
            return "/assets/image/txz.jpg"
            break;
        case 3:
        case "cho3":
            return "/assets/image/cho3Weibo.jpg"
            break;
        case 4:
        case "ys3":
            return "/assets/image/ys3Weibo.jpg"
            break;
        case 5:
        case "sr":
            return "/assets/image/sr.ico"
            break;
        case 6:
        case "tl":
            return "/assets/image/tlWeibo.jpg"
            break;
        case 7:
        case "gw":
            return "/assets/image/mrfz.ico"
            break;
        case 8:
        case "tlgw":
            return "/assets/image/tl.jpg"
            break;
    }
}

export {
    common,
    timespanToDay,
    Get,
    numberOrEnNameToName,
    numberOrEnNameToIconSrc
}
