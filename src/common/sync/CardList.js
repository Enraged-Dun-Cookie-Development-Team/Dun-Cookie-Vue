import {createSyncData, DataSyncMode} from "./SyncData";

/**
 * @type {CanSync}
 */
const instance = createSyncData({}, 'cardList', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;

