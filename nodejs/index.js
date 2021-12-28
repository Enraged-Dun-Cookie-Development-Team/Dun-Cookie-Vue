const { Worker } = require('worker_threads');

let worker;
let cardList = {"error": "还没有获得饼列表，再等等就有了"};
let getList = true;

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
        cardList = msg;
    } else if (msg.type == 'dunInfo-update' && getList) {   // 第一次获取信息后，获取CradList
        getCardList();
        getList = false;
    }
});

// 建立与3000端口连接
let http = require("http");
http.createServer(function (req, res) {
    // json文件 utf-8解析及写入cardList
    if (req.url == "/canteen/cardList") {
        res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.write(JSON.stringify(cardList));
        res.end();
    }
}).listen(3000);

// 在控制台执行此命令即可测试：node --require "./index.js"
