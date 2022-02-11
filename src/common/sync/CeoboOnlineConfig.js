import {createSyncData, DataSyncMode} from "./SyncData";

// TODO 统一服务器数据更新逻辑
//  增加一个更新Message通信用来给页面提供'更新中'的状态

/**
 * @type {CanSync}
 */
const instance = createSyncData({}, 'ceoboOnlineConfig', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;

