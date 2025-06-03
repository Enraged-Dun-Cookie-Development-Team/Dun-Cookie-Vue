import Settings from '../../../../common/Settings';
import TimeUtil from '../../../../common/util/TimeUtil';
import { CookieItem } from '../../../../common/CookieItem';

/**
 * 游戏公告数据源。
 * <p>
 */
export class GameBulletinListDataSource {
  static async processData(rawDataText, sourceId) {
    let data = JSON.parse(rawDataText);
    const time = new Date(`${data.displayTime} ${Settings.getTimeBySortMode()}`);
    return CookieItem.builder(sourceId)
      .id(data.cid)
      .timeForSort(time.getTime())
      .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
      .content(data.title.replace('\\n', '\n'))
      .jumpUrl(`https://ak-webview.hypergryph.com/api/game/bulletin/${data.cid}`)
      .build();
  }
}
