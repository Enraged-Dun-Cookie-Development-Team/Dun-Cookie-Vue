const {Worker} = require('worker_threads');

let worker;
let cardList;
let currentRes;

function getCardList() {
  worker.postMessage({type: 'cardList-get'});
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
  if(msg.type == 'cardList-get') {
    currentRes.writeHeader(200, {'Content-Type' : 'application/json;charset:utf-8'});
    currentRes.write(JSON.stringify(msg));
    currentRes.end();
    currentRes = null;
  }
});

// 在控制台执行此命令即可测试：node --require "./index.js"

let http = require("http");
http.createServer(function(req,res) {
  currentRes = res;
  getCardList();
}).listen(3000);
