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

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
  }

  async processData(rawDataText) {
    let list = [];
    const promiseList = [];
    for (const comic of JSON.parse(rawDataText).data) {
      promiseList.push(HttpUtil.GET_Json(`https://terra-historicus.hypergryph.com/api/comic/${comic.cid}`));
    }
    const comicData = await Promise.all(promiseList);
    comicData.forEach(comic => {
      let info = comic.data;
      const date = TimeUtil.format(new Date(info.episodes[0].displayTime * 1000), 'yyyy-MM-dd');
      const time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
      list.push(DataItem.builder(this.dataName)
        .id(`Terra${info.cid}_${info.episodes[0].cid}`)
        .timeForSort(time.getTime())
        .timeForDisplay(date)
        .content(`泰拉记事社${info.title}已更新——${info.episodes[0].title}`)
        .jumpUrl(`https://terra-historicus.hypergryph.com/comic/${info.cid}`)
        .coverImage(info.cover)
        .componentData(Object.assign({name: info.title}, info))
        .build());
    })
    return list;
  }
}
