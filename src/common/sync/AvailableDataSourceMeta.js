import { createSyncData, DataSyncMode } from './SyncData';
import ServerUtil from '../util/ServerUtil';
import { DataSourceMeta } from '../datasource/DataSourceMeta';
import { registerUrlToAddReferer } from '../../background/request_interceptor';

class AvailableDataSourceMeta {
  preset = {};
  custom = {};

  getById(id) {
    return this.preset[id] || this.custom[id];
  }

  /**
   * @return {(DataSourceMeta & {idStr: string})[]}
   */
  getPresetList() {
    return [...Object.values(this.preset)]
      .map((it) => ({ idStr: DataSourceMeta.id(it), ...it }))
      .sort((a, b) => a.idStr.localeCompare(b.idStr));
  }

  /* IFTRUE_feature__custom_datasource */
  /**
   * @return {(DataSourceMeta & {idStr: string})[]}
   */
  getCustomList() {
    return [...Object.values(this.custom)]
      .map((it) => ({ idStr: DataSourceMeta.id(it), ...it }))
      .sort((a, b) => a.idStr.localeCompare(b.idStr));
  }
  /* FITRUE_feature__custom_datasource */
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
    ? async (reloadData) => {
        await ServerUtil.checkServerDataSourceInfoCache(false);
        reloadData.preset = await ServerUtil.getAvailableDataSourcePreset();
        return reloadData;
      }
    : undefined
);

/* IFTRUE_feature__custom_datasource */
if (PlatformHelper.isBackground) {
  instance.doAfterInit(() => {
    if (instance.custom && Object.values(instance.custom).length > 0) {
      const urls = Object.values(instance.custom)
        .filter((it) => it.type.startsWith('weibo:'))
        .map((it) => it.icon);
      urls.forEach((src) => registerUrlToAddReferer(src, 'https://m.weibo.cn/'));
    }
  });
}
/* FITRUE_feature__custom_datasource */

export default instance;
