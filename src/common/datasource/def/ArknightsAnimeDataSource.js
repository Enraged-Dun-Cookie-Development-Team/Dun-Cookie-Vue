import { DataSource, DataSourceTypeInfo } from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import { CookieItem } from '../../CookieItem';
import Settings from '../../Settings';

const typeInfo = new DataSourceTypeInfo('ak.hypergryph.com/anime', 500 * 1000);

/**
 * 明日方舟官网(官网)数据源。
 * <p>
 */
export class ArknightsAnimeDataSource extends DataSource {
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
        const time = new Date(`${x.displayDate} ${Settings.getTimeBySortMode()}`);
        list.push(
          CookieItem.builder(this.dataName)
            .id(x.cid)
            .timeForSort(time.getTime())
            .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
            .content(x.title)
            .jumpUrl(`https://ak.hypergryph.com/anime/`)
            .build()
        );
      });
      return list;
    }
  }
}
