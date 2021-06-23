import {DataSource} from '../DataSource';
import {settings} from '../Settings';

/**
 * 塞壬唱片(官网)数据源。
 * <p>
 */
export class MonsterSirenDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data && data.data && data.data.list) {
      data.data.list.forEach(x => {
        let time = Math.floor(new Date(`${x.date} ${settings.getTimeBySortMode()}`).getTime() / 1000);
        list.push({
          time: time,
          id: x.cid,
          judgment: parseInt(x.cid) || time,
          dynamicInfo: x.title,
          source: opt.source,
          url: `https://monster-siren.hypergryph.com/info/${x.cid}`,
        })
      });
      return list.sort((x, y) => y.time - x.time);
    }
  }
}
