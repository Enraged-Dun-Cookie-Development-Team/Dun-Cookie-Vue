let common = {
  setting: {
    time: 15,
    source: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
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
    retweeted: true,// 是否查看转发
    saneMax: 135//理智上限
  },
  sane: {
    saneIndex: 135,//理智计算
    sanePush: true,
    endTime: new Date().getTime()
  },
  dunInfo: {
    dunIndex: 0,
    dunTime: new Date().getTime(),
    dunFristTime: new Date().getTime(),
  },
  saveInfo: {
    // 循环的标识
    setIntervalindex: 0,
    version: '2.0.155',
    feedbackInfo: `<div class="footer">
        <span>
          如果有意见或建议或者是反馈问题或者是发现程序出现bug<br />可以添加<a
            href="https://jq.qq.com/?_wv=1027&k=Vod1uO13"
            >【蹲饼组】</a
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
  quickJump: {
    soure: [
      {
        url: "https://ak.hypergryph.com/#information",
        name: "官方网站",
        img: numberOrEnNameToIconSrc(7),
      },
      {
        url: "https://space.bilibili.com/161775300/dynamic",
        name: "官方哔哩哔哩",
        img: numberOrEnNameToIconSrc(0)
      },
      {
        url: "https://weibo.com/arknights",
        name: "官方微博",
        img: numberOrEnNameToIconSrc(1),
      },
      {
        url: "https://weibo.com/u/6441489862",
        name: "朝陇山微博",
        img: numberOrEnNameToIconSrc(3),
        radius: true,
      },
      {
        url: "https://weibo.com/u/7506039414",
        name: "一拾山微博",
        img: numberOrEnNameToIconSrc(4),
        radius: true,
      },
      {
        url: "https://monster-siren.hypergryph.com/",
        name: "塞壬官网",
        img: numberOrEnNameToIconSrc(5),
        radius: true,
      },
      {
        url: "https://weibo.com/u/7499841383",
        name: "泰拉记事社微博",
        img: numberOrEnNameToIconSrc(6),
        radius: true,
      },
      {
        url: "https://terra-historicus.hypergryph.com/",
        name: "泰拉记事社官网",
        img: numberOrEnNameToIconSrc(8),
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
    url: []
  },
  dayInfo: [{
    type: 1,
    name: "高级作战记录",
    day: [1, 2, 3, 4, 5, 6, 0],
    src: 'http://prts.wiki/images/thumb/0/03/%E9%81%93%E5%85%B7_%E9%AB%98%E7%BA%A7%E4%BD%9C%E6%88%98%E8%AE%B0%E5%BD%95.png/60px-%E9%81%93%E5%85%B7_%E9%AB%98%E7%BA%A7%E4%BD%9C%E6%88%98%E8%AE%B0%E5%BD%95.png'
  },
  {
    type: 2,
    name: "龙门币",
    day: [2, 4, 6, 0],
    src: 'http://prts.wiki/images/thumb/c/cc/%E9%81%93%E5%85%B7_%E9%BE%99%E9%97%A8%E5%B8%81.png/60px-%E9%81%93%E5%85%B7_%E9%BE%99%E9%97%A8%E5%B8%81.png'
  },
  {
    type: 3,
    name: "采购凭证",
    day: [1, 4, 6, 0],
    src: 'http://prts.wiki/images/thumb/0/0f/%E9%81%93%E5%85%B7_%E9%87%87%E8%B4%AD%E5%87%AD%E8%AF%81.png/60px-%E9%81%93%E5%85%B7_%E9%87%87%E8%B4%AD%E5%87%AD%E8%AF%81.png'
  },
  {
    type: 4,
    name: "碳素",
    day: [1, 3, 5, 6],
    src: 'http://prts.wiki/images/thumb/0/01/%E9%81%93%E5%85%B7_%E7%A2%B3%E7%B4%A0.png/60px-%E9%81%93%E5%85%B7_%E7%A2%B3%E7%B4%A0.png'
  },
  {
    type: 5,
    name: "技巧概要",
    day: [2, 3, 5, 0],
    src: 'http://prts.wiki/images/thumb/4/4c/%E9%81%93%E5%85%B7_%E6%8A%80%E5%B7%A7%E6%A6%82%E8%A6%81%C2%B7%E5%8D%B73.png/40px-%E9%81%93%E5%85%B7_%E6%8A%80%E5%B7%A7%E6%A6%82%E8%A6%81%C2%B7%E5%8D%B73.png'
  }
    , {
    type: 6,
    name: "摧枯拉朽",
    day: [1, 2, 5, 6],
    src: 'http://prts.wiki/images/thumb/b/bd/%E6%91%A7%E5%8F%A4%E6%8B%89%E6%9C%BD_%E7%BC%A9%E7%95%A5.png/60px-%E6%91%A7%E5%8F%A4%E6%8B%89%E6%9C%BD_%E7%BC%A9%E7%95%A5.png'
  },
  {
    type: 7,
    name: "身先士卒",
    day: [2, 3, 6, 0],
    src: 'http://prts.wiki/images/thumb/b/b0/%E8%BA%AB%E5%85%88%E5%A3%AB%E5%8D%92_%E7%BC%A9%E7%95%A5.png/60px-%E8%BA%AB%E5%85%88%E5%A3%AB%E5%8D%92_%E7%BC%A9%E7%95%A5.png'
  },
  {
    type: 8,
    name: "固若金汤",
    day: [1, 4, 5, 0],
    src: 'http://prts.wiki/images/thumb/9/92/%E5%9B%BA%E8%8B%A5%E9%87%91%E6%B1%A4_%E7%BC%A9%E7%95%A5.png/60px-%E5%9B%BA%E8%8B%A5%E9%87%91%E6%B1%A4_%E7%BC%A9%E7%95%A5.png'
  },
  {
    type: 9,
    name: "势不可当",
    day: [3, 4, 6, 0],
    src: 'http://prts.wiki/images/thumb/f/f6/%E5%8A%BF%E4%B8%8D%E5%8F%AF%E6%8C%A1_%E7%BC%A9%E7%95%A5.png/60px-%E5%8A%BF%E4%B8%8D%E5%8F%AF%E6%8C%A1_%E7%BC%A9%E7%95%A5.png'
  }]
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

  } else if (type == 2) {
    return `${addZero(h)}:${addZero(m)}`;
  } else {
    return `${Y}-${addZero(M)}-${addZero(D)} ${addZero(h)}:${addZero(m)}:${addZero(s)}`;
  }

};


//时间差计算
/*
* startDate==>开始时间
* endDate==>结束时间
* 事例：diffTime(data.createTime,new Date())
*
* */
function diffTime(endDate, startDate) {
  if (!startDate) {
    startDate = new Date();
  }
  endDate = new Date(endDate);
  var date3 = null;
  let text = "";
  if (endDate > startDate) {
    date3 = new Date(endDate).getTime() - new Date(startDate).getTime();
    text = "剩余约"
  } else {
    date3 = new Date(startDate).getTime() - new Date(endDate).getTime();
    text = "已过去"
  }
  var days = Math.floor(date3 / (24 * 3600 * 1000));
  var leave1 = date3 % (24 * 3600 * 1000);
  var hours = Math.floor(leave1 / (3600 * 1000));
  var leave2 = leave1 % (3600 * 1000);
  var minutes = Math.floor(leave2 / (60 * 1000));
  if (days == 0) {
    return text + hours + "小时" + minutes + "分钟";
  }
  return text + days + "天" + hours + "小时" + minutes + "分钟";
}

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
    case 9:
    case "wyyyy":
      return "网易云音乐"
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
    case 9:
    case "wyyyy":
      return "/assets/image/wyyyy.ico"
      break;
  }
}
function numberToWeek(x) {
  switch (x) {
    case 0:
      return "星期天"
    case 1:
      return "星期一"
    case 2:
      return "星期二"
    case 3:
      return "星期三"
    case 4:
      return "星期四"
    case 5:
      return "星期五"
    case 6:
      return "星期六"
  }
}

// 保存
function saveLocalStorage(name, data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [name]: data }, () => {
      resolve(true);
    });
  });
}
// 读取
function getLocalStorage(name) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([name], (result) => {
      if (Object.keys(result).length != 0) {
        resolve(result[name]);
        return;
      }
      resolve(null);
    });
  });
}

export {
  common,
  timespanToDay,
  Get,
  numberOrEnNameToName,
  numberOrEnNameToIconSrc,
  numberToWeek,
  diffTime,
  saveLocalStorage,
  getLocalStorage
}
