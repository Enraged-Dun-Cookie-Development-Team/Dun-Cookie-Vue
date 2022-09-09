import { DataSource, DataSourceTypeInfo } from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import { DataItem } from '../../DataItem';
import Settings from '../../Settings';

const typeInfo = new DataSourceTypeInfo('monster-siren.hypergryph.com', 15 * 1000);

/**
 * 塞壬唱片(官网)数据源。
 * <p>
 */
export class MonsterSirenDataSource extends DataSource {
  /**
   * @returns {DataSourceTypeInfo}
   */
  static get typeInfo() {
    return typeInfo;
  }

  /**
   * @param config {DataSourceConfig} 数据源配置
   */
  constructor(config) {
    super(config);
  }

  async processData(rawDataText) {
    let list = [];
    let data = JSON.parse(rawDataText);
    if (data && data.data && data.data.list) {
      data.data.list.forEach((x) => {
        const time = new Date(`${x.date} ${Settings.getTimeBySortMode()}`);
        list.push(
          DataItem.builder(this.dataName)
            .id(x.cid)
            .timeForSort(time.getTime())
            .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
            .content(x.title)
            .jumpUrl(`https://monster-siren.hypergryph.com/info/${x.cid}`)
            .build()
        );
      });
      return list;
    }
  }
}
