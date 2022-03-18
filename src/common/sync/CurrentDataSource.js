import {createSyncData, DataSyncMode} from "./SyncData";


/**
 * @type {{[key: string]: DataSource} & Object & CanSync}
 */
const instance = createSyncData({}, 'currentDataSource', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;

