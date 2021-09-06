import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import Settings from '../../Settings';

/**
 * 泰拉记事社(官网)数据源。
 * <p>
 */
export class TerraHistoricusDataSource extends DataSource {

  static get typeName() {
    return 'terra-historicus.hypergryph.com';
  };

  constructor(icon, dataName, title, dataUrl, rootUrl, priority) {
    super(icon, dataName, title, dataUrl, rootUrl, priority);
  }

  processData(opt) {
    let list = [];
    opt.responseText.map(x => {
      let info = JSON.parse(x).data;
      info.episodes.reverse();
      const date = TimeUtil.format(new Date(info.updateTime * 1000), 'yyyy-MM-dd');
      const time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
      list.push(DataItem.builder(opt.dataName)
        .id(info.cid)
        .timeForSort(time.getTime())
        .timeForDisplay(date)
        .content(`泰拉记事社${info.title}已更新`)
        .jumpUrl(`https://terra-historicus.hypergryph.com/comic/${info.cid}`)
        .coverImage(info.cover)
        .componentData(Object.assign({name: info.title}, info))
        .build()
      );
    });
    return list;
  }
}
