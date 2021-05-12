let common = {
    setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5, 6, 7],
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
        version: '2.0.78',
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
            return "泰拉记事社"
            break;
        case 7:
        case "gw":
            return "官网网站"
            break;
    }
}

export {
    common,
    timespanToDay,
    Get,
    numberOrEnNameToName
}
