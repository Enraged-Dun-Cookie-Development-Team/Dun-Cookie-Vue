import {DataSource} from '../DataSource';

/**
 * 泰拉记事社(官网)数据源。
 * <p>
 */
export class TerraHistoricusDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, 'terra-historicus.hypergryph.com', dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    opt.responseText.map(x => {
      let info = JSON.parse(x).data;
      info.episodes.reverse();
      list.push({
        time: info.updateTime,
        id: info.updateTime,
        judgment: info.updateTime,
        dynamicInfo: `泰拉记事社${info.title}已更新`,
        name: info.title,
        source: opt.source,
        dataSourceType: opt.dataSourceType,
        image: info.cover,
        html: info,
        url: `https://terra-historicus.hypergryph.com/comic/${info.cid}`,
      });
    });
    return list.sort((x, y) => y.time - x.time);
  }
}
