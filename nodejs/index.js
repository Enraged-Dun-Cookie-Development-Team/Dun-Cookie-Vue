import DunInfo from "../src/common/sync/DunInfo.js";
import { Worker } from "worker_threads";
import CardList from "../src/common/sync/CardList";
import ws from "ws"
import fs from "fs"

const worker = new Worker('../src/background/index.js', {
  execArgv: ['--experimental-loader', './loader.mjs'],
});

worker.onerror = (e) => {
  console.log(e);
  process.exit(0);
};

Object.keys(DunInfo);

// 读取配置文件
let rawdata = fs.readFileSync("config.json");
let config = JSON.parse(rawdata);
let ws_url = "ws://" + config.ws.host + ":" + config.ws.port;   // websocket的地址
let intervalTime = config.ws.interval_time;                     // 尝试重连时间间隔
let limitConnect = config.ws.limit_connect || -1;               // 尝试重连次数
let heartBeatTime = config.ws.heart_beat_time || 5;             // 心跳间隔时间 

let timeConnect = 0;                                            // 重连次数
let aliveInterval;                                              // websocket心跳检测计时器

wsInit();

// 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
function wsInit() {
  let sock = new ws(ws_url);
  sock.on("open", _ => {
    console.log("与服务端建立链接成功")
    // 初始化重连次数
    timeConnect = 0;
    CardList.doAfterUpdate(data => {
      if (sock.readyState === ws.OPEN) {
        sock.send(JSON.stringify(data));
      }
    });
  });

  sock.on("error", err => {
    console.log("Error: ", err);
    sock.terminate();
  });

  sock.on("close", _ => {
    console.log("检测到服务端关闭");
    reconnect();
  });

  sock.on("message", data => {
    // 添加心跳检测
    if (data === 'ping') {
      clearTimeout(aliveInterval);
      sock.send("pong")
      aliveInterval = setTimeout(_ => {
        sock.terminate()
      }, heartBeatTime * 1000 + 3000)
    }
  });
}

// 重连
function reconnect() {
  if (timeConnect <= limitConnect || limitConnect == -1) {
    timeConnect++;
    console.log("第" + timeConnect + "次重连");
    // 进行重连
    setTimeout(function () {
      wsInit();
    }, intervalTime * 1000);
  } else {
    console.log("TCP连接已超时");
  }
}



// 以下都为临时需要的http请求，之后删除
import urlib from "url"
import http from "http"
httpServer()
let sourceMap = {
  "0": "官方B站动态",
  "1": "官方微博",
  "2": "游戏内公告",
  "3": "朝陇山微博",
  "4": "一拾山微博",
  "5": "塞壬唱片官网",
  "6": "泰拉记事社微博",
  "7": "官网",
  "8": "泰拉记事社官网",
  "9": "塞壬唱片网易云音乐",
  "10": "鹰角网络微博",
  "11": "明日方舟终末地",
};

function httpServer() {
  // 建立与3000端口连接
  http.createServer((req, res) => {
    // json文件 utf-8解析及写入cardList
    let urlObj = urlib.parse(req.url, true);
    // 判断路径是否正确
    if (urlObj.pathname == "/canteen/cardList") {
      // 没蹲饼列表的时候返回
      let userCardList = { "type": "没什么用这个，只是为了跟之前格式一样", "data": {} };

      // 复制基础信息
      let detailList = JSON.parse(JSON.stringify(CardList));
      if (Object.keys(detailList).length == 0) {
        res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.write(JSON.stringify({ "error": "还没有获得饼列表，再等等就有了" } ));
        res.end();
        return
      }
      
      let sourceList = urlObj.query.source;
      // 确保source参数被赋值
      if (sourceList != undefined) {
        let sources = sourceList.split("_");

        sources.forEach(source => {
          let sourcename = sourceMap[source];
          userCardList.data[sourcename] = JSON.parse(JSON.stringify(detailList[sourcename]));
        });
      }

      // source无内容自动获取全列表
      if (Object.keys(userCardList.data).length == 0) {
        userCardList.data = JSON.parse(JSON.stringify(detailList));
      }

      res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.write(JSON.stringify(userCardList));
      res.end();
    } else if (urlObj.pathname == "/canteen/userNumber") { // 获取用户总数量
      let userNumber = { "userNumber": ipList.length };
      res.writeHeader(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.write(JSON.stringify(userNumber));
      res.end();
    } else {
      res.writeHeader(404, { 'Content-Type': 'text/html;charset=utf-8' });
      res.end();
    }
  }).listen(3000); // 绑定3000端口
}

// 测试命令: node --experimental-loader ./loader.mjs ./index.js
