import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';

/**
 * 塞壬唱片(官网)数据源。
 * <p>
 */
export class MonsterSirenDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, 'monster-siren.hypergryph.com', dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data && data.data && data.data.list) {
      data.data.list.forEach(x => {
        list.push({
          timestamp: TimeUtil.format(new Date(x.date), 'yyyy-MM-dd'),
          id: x.cid,
          judgment: x.cid,
          dynamicInfo: x.title,
          source: opt.source,
          icon: opt.icon,
          dataSourceType: opt.dataSourceType,
          url: `https://monster-siren.hypergryph.com/info/${x.cid}`,
        })
      });
      return list.sort((x, y) => y.judgment - x.judgment);
    }
  }
}
