import Settings from "../Settings";
import {deepAssign} from "./CommonFunctions";

// 本类用于调试操作，只要加载的时候不报错就行，不考虑方法内部的兼容性问题
class DebugUtil {
  clearStorage() {
    const settings = deepAssign({}, Settings);
    chrome.storage.local.clear(() => settings.saveSettings().then());
  }
}

const instance = new DebugUtil()
global.DebugUtil = instance;

export default instance
