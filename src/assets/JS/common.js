let common = {
    setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5, 6, 7],
        fontsize: 0,
        imgshow: true,
        isTop: true,
        isPush: true,
        darkshow: 0,
        lowfrequency: false,
        lowfrequencyTime: [8, 20],
        islowfrequency: false,
    },
    dunInfo: {
        dunIndex: 0,
        dunTime: new Date().getTime(),
        dunFristTime: new Date().getTime(),
    },
    saveInfo: {
        // 循环的标识
        setIntervalindex: 0,
        version: '2.0.54',
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
    date = new Date(date);
    let Y = date.getFullYear();
    let M = date.getMonth() + 1;
    let D = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    if (type == 0) {
        return `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
    }
    return `${Y}-${addZero(M)}-${addZero(D)} ${addZero(
        h
    )}:${addZero(m)}:${addZero(s)}`;
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

export {
    common,
    timespanToDay,
    Get
}
