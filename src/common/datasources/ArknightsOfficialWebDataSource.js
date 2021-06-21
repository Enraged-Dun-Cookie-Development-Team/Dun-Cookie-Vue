import {DataSource} from '../DataSource';
import {settings} from '../Settings';

/**
 * 明日方舟官网数据源。
 * <p>
 */
export class ArknightsOfficialWebDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
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
        let time = Math.floor(new Date(`${date} ${settings.isTop ? '23:59:59' : '00:00:00'}`).getTime() / 1000);
        let judgment = url.match(/\d+/g);
        list.push({
          time: time,
          id: judgment.length > 0 ? parseInt(judgment[0]) : index,
          judgment: judgment.length > 0 ? parseInt(judgment[0]) : time,
          dynamicInfo: title,
          source: opt.source,
          url: `https://ak.hypergryph.com${url}`,
        });
      } catch (error) {
        console.error('解析官网数据失败', item);
      }
    });
    return list.sort((x, y) => y.time - x.time);
  }
}
