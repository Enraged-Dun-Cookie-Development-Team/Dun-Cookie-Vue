import {DataSource} from '../DataSource';
import Settings from '../../Settings';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import PlatformHelper from "../../platform/PlatformHelper";

/**
 * 明日方舟官网数据源。
 * <p>
 */
export class ArknightsOfficialWebDataSource extends DataSource {

  static get typeName() {
    return 'ak.hypergryph.com';
  };

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
  }

  async processData(rawDataText) {
    let list = [];
    let $ = PlatformHelper.HtmlParser;
    let $items = $(".articleList[data-category-key='ANNOUNCEMENT'] .articleItem,.articleList[data-category-key='ACTIVITY'] .articleItem,.articleList[data-category-key='NEWS'] .articleItem", $(rawDataText));
    $items.each((i, e) => {
      const $item = $(e);
      let date = $('.articleItemDate', $item).text();
      let title = $('.articleItemTitle', $item).text();
      let url = $('.articleItemLink', $item).attr('href');
      let time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
      let judgment = url.match(/\d+/g);
      list.push(DataItem.builder(this.dataName)
        .id(judgment.length > 0 ? parseInt(judgment[0]) : index)
        .timeForSort(time.getTime())
        .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
        .content(title)
        .jumpUrl(`https://ak.hypergryph.com${url}`)
        .build()
      );
    });
    return list;
  }
}
