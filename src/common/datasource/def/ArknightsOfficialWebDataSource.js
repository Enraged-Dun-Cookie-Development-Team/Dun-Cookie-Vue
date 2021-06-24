import {DataSource} from '../DataSource';
import {settings} from '../../Settings';
import TimeUtil from '../../util/TimeUtil';

/**
 * 明日方舟官网数据源。
 * <p>
 */
export class ArknightsOfficialWebDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, 'ak.hypergryph.com', dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let str = opt.responseText;
    let gw = document.createElement('div');
    gw.innerHTML = str;
    let articleItem = gw.querySelectorAll(".articleList[data-category-key='ANNOUNCEMENT'] .articleItem,.articleList[data-category-key='ACTIVITY'] .articleItem,.articleList[data-category-key='NEWS'] .articleItem");
    articleItem.forEach((item, index) => {
      try {
        let date = item.getElementsByClassName('articleItemDate')[0].innerHTML
        let title = item.getElementsByClassName('articleItemTitle')[0].innerHTML
        let url = item.getElementsByClassName('articleItemLink')[0].pathname;
        let time = new Date(`${date} ${settings.getTimeBySortMode()}`);
        let judgment = url.match(/\d+/g);
        list.push({
          timestamp: TimeUtil.format(time, 'yyyy-MM-dd'),
          id: judgment.length > 0 ? parseInt(judgment[0]) : index,
          judgment: judgment.length > 0 ? parseInt(judgment[0]) : Math.floor(time.getTime() / 1000),
          dynamicInfo: title,
          source: opt.source,
          icon: opt.icon,
          dataSourceType: opt.dataSourceType,
          url: `https://ak.hypergryph.com${url}`,
        });
      } catch (error) {
        console.error('解析官网数据失败', item);
      }
    });
    return list.sort((x, y) => y.judgment - x.judgment);
  }
}
