import {createSyncData, DataSyncMode} from "./SyncData";


/**
 * @type {Iterable<DataSource> & CanSync}
 */
const instance = createSyncData({}, 'currentDataSource', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;

