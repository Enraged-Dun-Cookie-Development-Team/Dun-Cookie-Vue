import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import {settings} from '../../Settings';

/**
 * 塞壬唱片(官网)数据源。
 * <p>
 */
export class MonsterSirenDataSource extends DataSource {

  static get typeName() {
    return 'monster-siren.hypergryph.com';
  };

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data && data.data && data.data.list) {
      data.data.list.forEach(x => {
        const time = new Date(`${x.date} ${settings.getTimeBySortMode()}`);
        list.push(DataItem.builder(opt.dataName)
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
