import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import Settings from '../../Settings';

/**
 * 塞壬唱片(官网)数据源。
 * <p>
 */
export class MonsterSirenDataSource extends DataSource {

  static get typeName() {
    return 'monster-siren.hypergryph.com';
  };

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
  }

  async processData(rawDataText) {
    let list = [];
    let data = JSON.parse(rawDataText);
    if (data && data.data && data.data.list) {
      data.data.list.forEach(x => {
        const time = new Date(`${x.date} ${Settings.getTimeBySortMode()}`);
        list.push(DataItem.builder(this.dataName)
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
