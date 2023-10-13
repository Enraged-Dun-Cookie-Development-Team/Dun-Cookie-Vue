import TimeUtil from '../../../../common/util/TimeUtil';
import { CookieItem } from '../../../../common/CookieItem';
import Settings from '../../../../common/Settings';

/**
 * 泰拉记事社数据源。
 * <p>
 */
export class TerraHistoricusDataSource {
  static async processData(rawDataText, sourceId) {
    let data = JSON.parse(rawDataText);
    const time = new Date(
      TimeUtil.format(new Date(data.updateTime * 1000), 'yyyy-MM-dd') + ' ' + Settings.getTimeBySortMode()
    );
    return CookieItem.builder(sourceId)
      .id(data.cid)
      .timeForSort(time.getTime())
      .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
      .imageList([data.coverUrl])
      .content(data.title + ' ' + data.episodeShortTitle)
      .jumpUrl(`https://terra-historicus.hypergryph.com/comic/${data.comicCid}/episode/${data.episodeCid}`)
      .build();
  }
}
