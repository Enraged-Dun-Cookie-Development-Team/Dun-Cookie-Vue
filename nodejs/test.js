import DunInfo from "../src/common/sync/DunInfo.js";
import {Worker} from "worker_threads";
import http from "http";
import urlib from "url";
import CardList from "../src/common/sync/CardList";

new Worker('../src/background/index.js', {
  execArgv: ['--experimental-loader', './loader.mjs']
});

Object.keys(DunInfo);

// 建立与3000端口连接
http.createServer((req, res) => {
  // json文件 utf-8解析及写入cardList
  let urlObj = urlib.parse(req.url, true);
  // 判断路径是否正确
  if (urlObj.pathname === "/canteen/cardList") {
    let response = { "error": "还没有获得饼列表，再等等就有了" };
    if (Object.keys(CardList).length > 0) {
      response = CardList;
    }
    res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
    res.write(JSON.stringify(response));
    res.end();
  }
}).listen(3000); // 绑定3000端口

// 测试命令: node --experimental-loader ./loader.mjs ./test.js
