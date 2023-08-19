import { createSyncData, DataSyncMode } from './SyncData';

/**
 * @type {{list: DataItem[]} & CanSync}
 */
const instance = createSyncData({ list: [] }, 'cardList', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;
