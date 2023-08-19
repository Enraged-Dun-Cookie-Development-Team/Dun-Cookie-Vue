import TimeUtil from '../../../../common/util/TimeUtil';
import { DataItem } from '../../../../common/DataItem';
import Settings from '../../../../common/Settings';

/**
 * 塞壬唱片(官网)数据源。
 * <p>
 */
export class MonsterSirenDataSource {
  static async processData(rawDataText, sourceId) {
    let data = JSON.parse(rawDataText);
    const time = new Date(`${data.date} ${Settings.getTimeBySortMode()}`);
    return DataItem.builder(sourceId)
      .id(data.cid)
      .timeForSort(time.getTime())
      .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
      .content(data.title)
      .jumpUrl(`https://monster-siren.hypergryph.com/info/${data.cid}`)
      .build();
  }
}
