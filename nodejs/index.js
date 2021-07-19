const {Worker} = require('worker_threads');

let worker;

function getCardList() {
  worker.postMessage({type: 'cardList-get'});
}
global.getCardList = getCardList;

function stopWorker() {
  worker.terminate();
}
global.stopWorker = stopWorker;

worker = new Worker('../dist/background.js');
// 简单地输出收到的消息，不进行任何处理
worker.on('message', msg => console.log(msg));
