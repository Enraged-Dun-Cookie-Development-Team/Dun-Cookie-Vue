import TimeUtil from '../../../../common/util/TimeUtil';
import { CookieItem } from '../../../../common/CookieItem';
import Settings from '../../../../common/Settings';

/**
 * 网易云音乐数据源。
 * <p>
 * 仅支持新专辑感知，往自己或他人的已存在专辑内新增歌曲无法感知
 */
export class NeteaseCloudMusicDataSource {
  static async processData(rawDataText, sourceId) {
    let data = JSON.parse(rawDataText);
    const date = TimeUtil.format(new Date(data.publishTime), 'yyyy-MM-dd');
    const time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
    return CookieItem.builder(sourceId)
      .id(data.id)
      .timeForSort(time.getTime())
      .timeForDisplay(date)
      .content(`塞壬唱片发布新专辑《${data.name}》，共${data.size}首歌曲`)
      .jumpUrl(`https://music.163.com/#/album?id=${data.id}`)
      .coverImage(data.picUrl)
      .componentData({
        size: data.size,
        name: data.name,
      })
      .build();
  }
}
