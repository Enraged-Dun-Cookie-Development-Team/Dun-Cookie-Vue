import {createSyncData, DataSyncMode} from "./SyncData";

/**
 * 蹲饼数据
 * <p>
 * 插件停止后该数据会丢失(目前看来不需要持久化)
 */
class DunInfo {
  // 蹲饼次数
  counter = 0;
  // 蹲到的饼的数量
  cookieCount = 0;
  // 最后一次蹲饼时间
  lastDunTime = -1;
}

/**
 * @type {DunInfo & CanSync}
 */
const instance = createSyncData(new DunInfo(), 'dun', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;
