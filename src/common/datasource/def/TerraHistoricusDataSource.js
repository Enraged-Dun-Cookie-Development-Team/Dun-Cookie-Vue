import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import Settings from '../../Settings';
import HttpUtil from "../../util/HttpUtil";

/**
 * 泰拉记事社(官网)数据源。
 * <p>
 */
export class TerraHistoricusDataSource extends DataSource {

  static get typeName() {
    return 'terra-historicus.hypergryph.com';
  };

  static async newInstance(priority) {
    const data = await HttpUtil.GET_Json('https://terra-historicus.hypergryph.com/api/comic')
    const dataUrl = [];
    for (const comic of data.data) {
      dataUrl.push(`https://terra-historicus.hypergryph.com/api/comic/${comic.cid}`)
    }
    return new TerraHistoricusDataSource('/assets/image/icon/tl.jpg', TerraHistoricusDataSource.typeName, '泰拉记事社', dataUrl, priority);
  }

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
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
