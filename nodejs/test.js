import DunInfo from "../src/common/sync/DunInfo.js";
import {Worker} from "worker_threads";

new Worker('./worker.js', {
  execArgv: ['--experimental-loader', './loader.mjs']
});

setInterval(() => {
  console.log(DunInfo);
}, 1500);

// 测试命令: node --experimental-loader ./loader.mjs ./test.js
