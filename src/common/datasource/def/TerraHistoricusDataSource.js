import {DataSource, DataSourceTypeInfo} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import Settings from '../../Settings';
import HttpUtil from "../../util/HttpUtil";

const typeInfo = new DataSourceTypeInfo('terra-historicus.hypergryph.com', 15*1000);

/**
 * 泰拉记事社(官网)数据源。
 * <p>
 */
export class TerraHistoricusDataSource extends DataSource {

  /**
   * @returns {DataSourceTypeInfo}
   */
  static get typeInfo() {
    return typeInfo;
  };

  /**
   * @param config {DataSourceConfig} 数据源配置
   */
  constructor(config) {
    super(config);
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
      const date = TimeUtil.format(new Date(info.updateTime * 1000), 'yyyy-MM-dd');
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
