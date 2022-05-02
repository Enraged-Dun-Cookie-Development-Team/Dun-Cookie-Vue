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

// 测试命令: node --experimental-loader ./loader.mjs ./index.js
