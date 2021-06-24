import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';

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
        timestamp: TimeUtil.format(new Date(info.updateTime * 1000), 'yyyy-MM-dd'),
        id: info.updateTime,
        judgment: info.updateTime,
        dynamicInfo: `泰拉记事社${info.title}已更新`,
        name: info.title,
        source: opt.source,
        icon: opt.icon,
        dataSourceType: opt.dataSourceType,
        image: info.cover,
        html: info,
        url: `https://terra-historicus.hypergryph.com/comic/${info.cid}`,
      });
    });
    return list.sort((x, y) => y.judgment - x.judgment);
  }
}
