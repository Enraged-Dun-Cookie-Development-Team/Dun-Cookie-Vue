import { DataSource } from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import { DataItem } from '../../DataItem';
import Settings from '../../Settings';


/**
 * 明日方舟官网(官网)数据源。
 * <p>
 */
export class ArknightsAnimeDataSource extends DataSource {
  /**
   * @returns {DataSourceTypeInfo}
   */
  static get typeName() {
    return 'ak.hypergryph.com/anime';
  };

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
  }

  async processData(rawDataText) {
    let list = [];
    let data = JSON.parse(rawDataText);
    if (data && data.data && data.data.list) {
      data.data.list.forEach((x) => {
        const time = new Date(`${x.displayDate} ${Settings.getTimeBySortMode()}`);
        list.push(
          DataItem.builder(this.dataName)
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