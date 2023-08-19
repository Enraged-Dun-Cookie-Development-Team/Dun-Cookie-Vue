import { DataSourceMeta, DataSourceTypeInfo } from '../../../../common/datasource/DataSourceMeta';
import Settings from '../../../../common/Settings';
import TimeUtil from '../../../../common/util/TimeUtil';
import { DataItem } from '../../../../common/DataItem';
import PlatformHelper from '../../../../common/platform/PlatformHelper';

/**
 * 游戏公告数据源。
 * <p>
 */
export class GameBulletinListDataSource {
  static async processData(rawDataText, sourceId) {
    let data = JSON.parse(rawDataText);
    const time = new Date(`${data.displayTime} ${Settings.getTimeBySortMode()}`);
    return DataItem.builder(sourceId)
      .id(data.cid)
      .timeForSort(time.getTime())
      .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
      .content(data.title.replace('\\n', '\n'))
      .jumpUrl(`https://terra-historicus.hypergryph.com/comic/${data.comicCid}/episode/${data.episodeCid}`)
      .build();
  }
}
