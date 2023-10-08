import Settings from '../../../../common/Settings';
import TimeUtil from '../../../../common/util/TimeUtil';
import { CookieItem } from '../../../../common/CookieItem';
import PlatformHelper from '../../../../common/platform/PlatformHelper';

/**
 * 明日方舟官网数据源。
 * <p>
 */
export class ArknightsOfficialWebDataSource {
  static async processData(rawDataText, sourceId) {
    let $ = PlatformHelper.HtmlParser;
    const $item = $(rawDataText);
    let date = $('.articleItemDate', $item).text();
    let title = $('.articleItemTitle', $item).text();
    let url = $('.articleItemLink', $item).attr('href');
    let time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
    let judgment = url.match(/\d+/g);
    return CookieItem.builder(sourceId)
      .id(parseInt(judgment[0]))
      .timeForSort(time.getTime())
      .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
      .content(title)
      .jumpUrl(`https://ak.hypergryph.com${url}`)
      .build();
  }
}
