/**
 * @file 调试工具
 * 本文件用于调试操作，只要加载的时候不报错就行，不考虑方法内部的兼容性问题
 * debugLog作为特殊的会被依赖的方法除外，必须考虑兼容性问题
 */

import {DEBUG_LEVEL} from "../Constants";

// 这两个变量用于避免调试输出太多导致控制台卡死，可参考本文件中的debugConsoleOutput方法
let debugLogClearThreshold = 50000;
let debugLogCounter = 0;

// noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
class DebugUtil {

  // 清除storage中除了settings以外的全部内容
  clearStorage() {
    chrome.storage.local.get('settings', (result) => {
      if (chrome.runtime.lastError) {
        console.log("清除失败");
        console.error(chrome.runtime.lastError);
        return;
      }
      const settings = result['settings'];
      chrome.storage.local.clear(() => {
        chrome.storage.local.set({settings: settings});
      });
    });
  }

  // 调试输出
  debugLog(level, ...data) {
    this.debugConsoleOutput(level, 'log', ...data);
  }

  debugLogError(level, ...data) {
    this.debugConsoleOutput(level, 'error', ...data);
  }

  debugConsoleOutput(level, type, ...data) {
    if (DEBUG_LEVEL >= level || level === 0) {
      // 为避免启用调试模式时控制台输出信息太多导致卡死，输出的调试信息超过限制时清除之前输出的调试信息
      if (debugLogCounter >= debugLogClearThreshold) {
        console.clear();
      }
      console[type](`%c[${new Date().toLocaleString()}]`, "color: gray", ...data);
      debugLogCounter++;
    }
  }

  setDebugLogClearThreshold(newThreshold) {
    if (newThreshold > 10) {
      debugLogClearThreshold = newThreshold;
    }
  }
}

const instance = new DebugUtil()
global.DebugUtil = instance;

export default instance
