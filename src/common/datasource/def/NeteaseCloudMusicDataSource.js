import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import Settings from '../../Settings';

/**
 * 网易云音乐数据源。
 * <p>
 */
export class NeteaseCloudMusicDataSource extends DataSource {

  static get typeName() {
    return 'music.163.com';
  };

  constructor(icon, dataName, title, dataUrl, rootUrl, priority) {
    super(icon, dataName, title, dataUrl, rootUrl, priority);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data && data.hotAlbums && data.hotAlbums.length > 0) {
      data.hotAlbums.forEach(x => {
        const date = TimeUtil.format(new Date(x.publishTime), 'yyyy-MM-dd');
        const time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
        list.push(DataItem.builder(opt.dataName)
          .id(x.id)
          .timeForSort(time.getTime())
          .timeForDisplay(date)
          .content(`塞壬唱片发布新专辑《${x.name}》，共${x.size}首歌曲`)
          .jumpUrl(`https://music.163.com/#/album?id=${x.id}`)
          .coverImage(x.picUrl + '?param=130y130')
          .componentData({
            size: x.size,
            name: x.name,
          })
          .build()
        );
      });
      return list;
    }
  }
}
