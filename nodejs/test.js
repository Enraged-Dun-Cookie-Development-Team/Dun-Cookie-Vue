import DunInfo from "../src/common/sync/DunInfo.js";
import {Worker} from "worker_threads";
import http from "http";
import urlib from "url";
import CardList from "../src/common/sync/CardList";
import ws from "ws"
import fs from "fs"

const worker = new Worker('../src/background/index.js', {
  execArgv: ['--experimental-loader', './loader.mjs'],
});

worker.onerror = (e) => {
  console.log(e);
};

Object.keys(DunInfo);

// // 建立与3000端口连接
// http.createServer((req, res) => {
//   // json文件 utf-8解析及写入cardList
//   let urlObj = urlib.parse(req.url, true);
//   // 判断路径是否正确
//   if (urlObj.pathname === "/canteen/cardList") {
//     let response = { "error": "还没有获得饼列表，再等等就有了" };
//     if (Object.keys(CardList).length > 0) {
//       response = {data: CardList};
//     }
//     res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
//     res.write(JSON.stringify(response));
//     res.end();
//   }
// }).listen(3000); // 绑定3000端口

// 读取配置文件
let rawdata = fs.readFileSync("config.json");
let config = JSON.parse(rawdata);

// 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
let sock = new ws("ws://"+config.ws.host+":"+config.ws.port);
sock.on("open", _ => {
  console.log("与服务端建立链接成功")
	CardList.doAfterUpdate(data => {
    sock.send(JSON.stringify(data));
  });
});

sock.on("error", err => {
	console.log("Error: ", err);
});

sock.on("close", _ => {
	console.log("检测到服务端关闭");
});

sock.on("message", data => {
	// console.log(data);
});

// 测试命令: node --experimental-loader ./loader.mjs ./test.js
