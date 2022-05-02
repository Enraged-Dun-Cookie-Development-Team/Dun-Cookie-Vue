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
let ws_url = "ws://" + config.ws.host + ":" + config.ws.port;
let intervalTime = config.ws.interval_time;
let limitConnect = config.ws.limit_connect || -1;
let timeConnect = 0;

wsInit();

// 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
function wsInit() {
  let sock = new ws(ws_url);
  sock.on("open", _ => {
    console.log("与服务端建立链接成功")
    timeConnect = 0;
    CardList.doAfterUpdate(data => {
      console.log(sock.readyState)
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
    // console.log(data);
  });
}

// 重连
function reconnect() {
  // lockReconnect加锁，防止onclose、onerror两次重连
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
