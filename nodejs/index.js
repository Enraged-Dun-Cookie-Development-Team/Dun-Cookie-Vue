const { Worker } = require('worker_threads');

let worker;
let cardList = {};
let getList = false;
let detailList = {};

function getCardList() {
    worker.postMessage({ type: 'cardList-get' });
}
global.getCardList = getCardList;

function stopWorker() {
    worker.terminate();
}
global.stopWorker = stopWorker;

worker = new Worker('../dist/background.js', {
    execArgv: []
});

// 简单地输出收到的消息，不进行任何处理
worker.on('message', msg => {
    if (msg.type == 'cardList-get' || msg.type == 'cardList-update') { // 收到cardlist的get或者update的时候更新nodejs的cardlist
        cardList.type = msg.type;
        cardList.data = {};
        // 将各数据源信息存到detailList
        for (let source in msg.data) {
            detailList[source] = JSON.parse(JSON.stringify(msg.data[source]));
        }
    } else if (msg.type == 'dunInfo-update' && !getList) {   // 第一次获取信息后，获取cardList
        getCardList();
        getList = false;
    }
});

// 建立与3000端口连接
let http = require("http");
const urlib = require("url");
http.createServer(function (req, res) {
    // json文件 utf-8解析及写入cardList
    var urlObj = urlib.parse(req.url, true);
    // 判断路径是否正确
    if (urlObj.pathname == "/canteen/cardList") {
        // 没蹲饼列表的时候返回
        let userCardList = { "error": "还没有获得饼列表，再等等就有了" };
        // 判断是否蹲到饼过
        if (cardList.hasOwnProperty('data')) {
            // 复制基础信息
            userCardList = JSON.parse(JSON.stringify(cardList));
            let sourceList = urlObj.query.source;

            // 确保source参数被赋值
            if (sourceList != undefined) {
                let sources = sourceList.split("_");

                for (let source of sources) {
                    switch (source) {
                        case "1":
                            userCardList.data["官方B站动态"] = JSON.parse(JSON.stringify(detailList["官方B站动态"]));
                            break;
                        case "2":
                            userCardList.data["官方微博"] = JSON.parse(JSON.stringify(detailList["官方微博"]));
                            break;
                        case "3":
                            userCardList.data["游戏内公告"] = JSON.parse(JSON.stringify(detailList["游戏内公告"]));
                            break;
                        case "4":
                            userCardList.data["朝陇山微博"] = JSON.parse(JSON.stringify(detailList["朝陇山微博"]));
                            break;
                        case "5":
                            userCardList.data["一拾山微博"] = JSON.parse(JSON.stringify(detailList["一拾山微博"]));
                            break;
                        case "6":
                            userCardList.data["塞壬唱片官网"] = JSON.parse(JSON.stringify(detailList["塞壬唱片官网"]));
                            break;
                        case "7":
                            userCardList.data["泰拉记事社微博"] = JSON.parse(JSON.stringify(detailList["泰拉记事社微博"]));
                            break;
                        case "8":
                            userCardList.data["官网"] = JSON.parse(JSON.stringify(detailList["官网"]));
                            break;
                        case "9":
                            userCardList.data["泰拉记事社官网"] = JSON.parse(JSON.stringify(detailList["泰拉记事社官网"]));
                            break;
                        case "10":
                            userCardList.data["塞壬唱片网易云音乐"] = JSON.parse(JSON.stringify(detailList["塞壬唱片网易云音乐"]));
                            break;
                        case "11":
                            userCardList.data["鹰角网络微博"] = JSON.parse(JSON.stringify(detailList["鹰角网络微博"]));
                            break;
                        default:
                            break;
                    }
                }
            }
            // source无内容自动获取全列表
            if (Object.keys(userCardList.data).length  == 0) {
                userCardList.data = JSON.parse(JSON.stringify(detailList));
            }
        }

        res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.write(JSON.stringify(userCardList));
        res.end();
        userCardList = {};
    } else {
        res.writeHeader(404, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end();
    }
}).listen(3000); // 绑定3000端口

// 在控制台执行此命令即可测试：node index.js
