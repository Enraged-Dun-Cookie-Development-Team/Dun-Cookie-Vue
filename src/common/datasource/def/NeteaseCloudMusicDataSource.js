import {DataSource, DataSourceConfig, DataSourceTypeInfo, UserInfo} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import Settings from '../../Settings';
import HttpUtil from "../../util/HttpUtil";

const typeInfo = new DataSourceTypeInfo('music.163.com');

/**
 * 网易云音乐数据源。
 * <p>
 * 仅支持新专辑感知，往自己或他人的已存在专辑内新增歌曲无法感知
 */
export class NeteaseCloudMusicDataSource extends DataSource {

  /**
   * @returns {DataSourceTypeInfo}
   */
  static get typeInfo() {
    return typeInfo;
  };

  /**
   * @param config {DataSourceConfig} 数据源配置
   */
  constructor(config) {
    super(config);
  }

  async processData(rawDataText) {
    let list = [];
    let data = JSON.parse(rawDataText);
    if (data && data.hotAlbums && data.hotAlbums.length > 0) {
      data.hotAlbums.forEach(x => {
        const date = TimeUtil.format(new Date(x.publishTime), 'yyyy-MM-dd');
        const time = new Date(`${date} ${Settings.getTimeBySortMode()}`);
        list.push(DataItem.builder(this.dataName)
          .id(x.id)
          .timeForSort(time.getTime())
          .timeForDisplay(date)
          .content(`塞壬唱片发布新专辑《${x.name}》，共${x.size}首歌曲`)
          .jumpUrl(`https://music.163.com/#/album?id=${x.id}`)
          .coverImage(x.picUrl)
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

  /**
   * @param artistId {number}
   * @param customConfigCallback {(function(DataSourceConfigBuilder): void)|undefined}
   * @returns {Promise<NeteaseCloudMusicDataSource|null>}
   */
  static async withUid(artistId, customConfigCallback = undefined) {
    try {
      const data = await DataSource.getOrFetchUserInfo(artistId, NeteaseCloudMusicDataSource);
      if (!data) {
        return null;
      }
      const dataUrl = `https://music.163.com/api/artist/albums/${artistId}`;
      const configBuilder = DataSourceConfig.builder()
        .icon(data.avatarUrl)
        .dataName(data.dataName)
        .title(data.username)
        .dataUrl(dataUrl);
      if (customConfigCallback) {
        customConfigCallback(configBuilder);
      }
      return new NeteaseCloudMusicDataSource(configBuilder.build());
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async fetchUserInfo(artistId) {
    const json = await HttpUtil.GET_Json(`https://music.163.com/api/artist/albums/${artistId}`);
    if (json.code !== 200) {
      throw 'request fail: ' + JSON.stringify(json);
    }
    const dataName = NeteaseCloudMusicDataSource.typeInfo.typeName + '_' + artistId;
    return new UserInfo(dataName, json.artist.name, json.artist.img1v1Url);
  }
}
