const { Worker } = require('worker_threads');
const EventEmitter = require("events");
const ws = require('nodejs-websocket');
const http = require("http");
const urlib = require("url");

let worker;
let emitter;
let server;
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
emitter = new EventEmitter();

// 简单地输出收到的消息，不进行任何处理
worker.on('message', msg => {
    if ((msg.type == 'cardList-get' && !getList) || msg.type == 'cardList-update') { // 收到cardlist的get或者update的时候更新nodejs的cardlist
        getList = true;
        cardList.type = msg.type;
        cardList.data = {};
        // 将各数据源信息存到detailList
        for (let source in msg.data) {
            detailList[source] = JSON.parse(JSON.stringify(msg.data[source]));
        }
        emitter.emit('websocket-get', msg);
    } else if (msg.type == 'dunInfo-update' && !getList) {   // 第一次获取信息后，获取cardList
        getCardList();
    }
});

// web socket使用5683链接
server = ws.createServer(conn => {
    let firstConnect = true;
    let firstConnectList = { 'type' :'cardList-get', 'data':{}};
    firstConnectList.data = JSON.parse(JSON.stringify(detailList));
    if (firstConnect && Object.keys(detailList).length != 0) {
        conn.sendText(JSON.stringify(firstConnectList));
    }
    emitter.on('websocket-get', msg => {
        conn.sendText(JSON.stringify(msg));
    });
    // 检测连接状态
    conn.on("close", (code, reason) => {
        console.log("key："+conn.key+"，状态：关闭连接")
    });
    conn.on("error", (code, reason) => {
        console.log(code + "---" + reason)
        console.log("key："+conn.key+"，状态：异常关闭")
    });
}).listen(5683);

// 建立与3000端口连接
http.createServer((req, res) => {
    // json文件 utf-8解析及写入cardList
    let urlObj = urlib.parse(req.url, true);
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

                sources.array.forEach(source => {
                    switch (source) {
                        case "0":
                            userCardList.data["官方B站动态"] = JSON.parse(JSON.stringify(detailList["官方B站动态"]));
                            break;
                        case "1":
                            userCardList.data["官方微博"] = JSON.parse(JSON.stringify(detailList["官方微博"]));
                            break;
                        case "2":
                            userCardList.data["游戏内公告"] = JSON.parse(JSON.stringify(detailList["游戏内公告"]));
                            break;
                        case "3":
                            userCardList.data["朝陇山微博"] = JSON.parse(JSON.stringify(detailList["朝陇山微博"]));
                            break;
                        case "4":
                            userCardList.data["一拾山微博"] = JSON.parse(JSON.stringify(detailList["一拾山微博"]));
                            break;
                        case "5":
                            userCardList.data["塞壬唱片官网"] = JSON.parse(JSON.stringify(detailList["塞壬唱片官网"]));
                            break;
                        case "6":
                            userCardList.data["泰拉记事社微博"] = JSON.parse(JSON.stringify(detailList["泰拉记事社微博"]));
                            break;
                        case "7":
                            userCardList.data["官网"] = JSON.parse(JSON.stringify(detailList["官网"]));
                            break;
                        case "8":
                            userCardList.data["泰拉记事社官网"] = JSON.parse(JSON.stringify(detailList["泰拉记事社官网"]));
                            break;
                        case "9":
                            userCardList.data["塞壬唱片网易云音乐"] = JSON.parse(JSON.stringify(detailList["塞壬唱片网易云音乐"]));
                            break;
                        case "10":
                            userCardList.data["鹰角网络微博"] = JSON.parse(JSON.stringify(detailList["鹰角网络微博"]));
                            break;
                        default:
                            break;
                    }
                });
            }
            // source无内容自动获取全列表
            if (Object.keys(userCardList.data).length == 0) {
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
