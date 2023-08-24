import { createSyncData, DataSyncMode } from './SyncData';
import ServerUtil from '../util/ServerUtil';

class AvailableDataSourceMeta {
  preset = {};
  custom = {};

  getById(id) {
    return this.preset[id] || this.custom[id];
  }
}

/**
 * @type {AvailableDataSourceMeta & CanSync}
 */
const instance = createSyncData(
  new AvailableDataSourceMeta(),
  'availableDataSource',
  DataSyncMode.ALL_WRITABLE,
  true,
  undefined,
  PlatformHelper.isBackground
    ? async () => {
        const data = new AvailableDataSourceMeta();
        await ServerUtil.checkServerDataSourceInfoCache();
        data.preset = ServerUtil.getAvailableDataSourcePreset();
        return data;
      }
    : undefined
);

export default instance;
