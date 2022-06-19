import {DataSource, DataSourceConfig, UserInfo} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import HttpUtil from '../../util/HttpUtil';

/**
 * 哔哩哔哩数据源。
 * <p>
 */
export class BilibiliDataSource extends DataSource {

  static get typeName() {
    return 'bilibili_dynamic';
  };

  /**
   * @param uid {number}
   * @param customConfigCallback {(function(DataSourceConfig): void)|undefined}
   * @returns {Promise<BilibiliDataSource|null>}
   */
  static async withUid(uid, customConfigCallback = undefined) {
    try {
      const data = await DataSource.getOrFetchUserInfo(uid, BilibiliDataSource);
      if (!data) {
        return null;
      }
      const dataUrl = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}&offset_dynamic_id=0&need_top=0&platform=web`;
      const config = DataSourceConfig.builder()
          .icon(data.avatarUrl)
          .dataName(data.dataName)
          .title(data.username)
          .dataUrl(dataUrl)
          .build();
      if (customConfigCallback) {
        customConfigCallback(config);
      }
      return new BilibiliDataSource(config);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * @param config {DataSourceConfig} 数据源配置
   */
  constructor(config) {
    super(config);
  }

  async processData(rawDataText) {
    let list = [];
    let data = JSON.parse(rawDataText);
    if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
      data.data.cards.forEach(x => {
        const dynamicInfo = JSON.parse(x.card);
        const builder = DataItem.builder(this.dataName)
          .id(x.desc.timestamp)
          .timeForSort(x.desc.timestamp * 1000)
          .timeForDisplay(TimeUtil.format(new Date(x.desc.timestamp * 1000), 'yyyy-MM-dd hh:mm:ss'))
          .jumpUrl(`https://t.bilibili.com/${x.desc.dynamic_id_str}`)

        switch (parseInt(x.desc.type)) {
          // 普通动态
          case 2: {
            builder
              .previewList(dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src + "@320w.webp"))
              .imageList(dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src))
              .imageHttpList(dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src))
              .coverImage((dynamicInfo.item.pictures && dynamicInfo.item.pictures.length > 0) ? dynamicInfo.item.pictures[0].img_src : null)
              .content(dynamicInfo.item.description);
            break;
          }
          // 无图片动态
          case 4: {
            builder
              .previewList(null)
              .imageList(null)
              .content(dynamicInfo.item.content);
            break;
          }
          // 视频
          case 8: {
            builder
              .previewList(null)
              .imageList(null)
              .coverImage(dynamicInfo.pic)
              .content(dynamicInfo.dynamic);
            break;
          }
          // 专栏
          case 64: {
            builder
              .previewList(null)
              .imageList(null)
              .coverImage((dynamicInfo.image_urls && dynamicInfo.image_urls.length > 0) ? dynamicInfo.image_urls[0] : null)
              .content(dynamicInfo.summary);
            break;
          }
          // 不支持的类型直接返回
          default:
            return;
        }
        list.push(builder.build());
      });
      return list;
    }
  }

  static async fetchUserInfo(uid) {
    const json = await HttpUtil.GET_Json(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`);
    if (json.code != 0) {
      throw 'request fail: ' + JSON.stringify(json);
    }
    const dataName = BilibiliDataSource.typeName + '_' + uid;
    return new UserInfo(dataName, json.data.name, json.data.face);
  }
}
