import { createSyncData, DataSyncMode } from './SyncData';
import ServerUtil from '../util/ServerUtil';
import { DataSourceMeta } from '../datasource/DataSourceMeta';

class AvailableDataSourceMeta {
  preset = {};
  custom = {};

  getById(id) {
    return this.preset[id] || this.custom[id];
  }

  /**
   * @return {(DataSourceMeta & {idStr: string})[]}
   */
  getAllList() {
    return [...Object.values(this.preset), ...Object.values(this.custom)]
      .map((it) => ({ idStr: DataSourceMeta.id(it), ...it }))
      .sort((a, b) => a.idStr.localeCompare(b.idStr));
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
        await ServerUtil.checkServerDataSourceInfoCache(false);
        data.preset = ServerUtil.getAvailableDataSourcePreset();
        return data;
      }
    : undefined
);

export default instance;
