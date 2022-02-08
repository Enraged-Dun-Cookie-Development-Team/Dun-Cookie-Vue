import {DEBUG_LEVEL} from "../Constants";

// 本类用于调试操作，只要加载的时候不报错就行，不考虑方法内部的兼容性问题
// debugLog作为特殊的会被依赖的方法除外，必须考虑兼容性问题
// noinspection JSUnresolvedVariable
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
    if (DEBUG_LEVEL >= level || level === 0) {
      console.log(...data);
    }
  }
}

const instance = new DebugUtil()
global.DebugUtil = instance;

export default instance
