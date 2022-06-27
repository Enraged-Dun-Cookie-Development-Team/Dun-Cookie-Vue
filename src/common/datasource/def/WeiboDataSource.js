import {DataSource, DataSourceConfig, UserInfo} from '../DataSource';
import Settings from '../../Settings';
import TimeUtil from '../../util/TimeUtil';
import { DataItem, RetweetedInfo } from '../../DataItem';
import HttpUtil from '../../util/HttpUtil';

/**
 * 微博数据源。
 * <p>
 */
export class WeiboDataSource extends DataSource {

  static get typeName() {
    return 'weibo';
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
    if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
      data.data.cards.forEach(x => {
        // 是否显示转发内容
        if (!Settings.dun.showRetweet && x.hasOwnProperty('mblog') && x.mblog.hasOwnProperty('retweeted_status')) {
          return;
        }
        if (x.hasOwnProperty('mblog')) {
          let dynamicInfo = x.mblog;
          const containerId = data.data.cardlistInfo.containerid;
          let weiboId = containerId.substring((containerId.length - 10), containerId.length) + '/' + x.mblog.bid;
          let time = new Date(dynamicInfo.created_at);
          let coverImage = dynamicInfo.original_pic;
          if (coverImage) {
            coverImage = coverImage.replace("https", "http");
          }
          const builder = DataItem.builder(this.dataName)
            .id(weiboId)
            .timeForSort(time.getTime())
            .timeForDisplay(TimeUtil.format(new Date(time), 'yyyy-MM-dd hh:mm:ss'))
            .content(dynamicInfo.raw_text || dynamicInfo.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n'))
            .jumpUrl(`https://weibo.com/${weiboId}`)
            .coverImage(coverImage)
            .previewList(dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/thumbnail/${x}`))
            .imageList(dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/large/${x}`))
            .imageHttpList(dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `http://wx3.sinaimg.cn/large/${x}`));

          if (x.mblog.hasOwnProperty('isTop') && x.mblog.isTop == 1) {
            builder.setTop();
          }
          // 转发内容
          if (x.mblog.hasOwnProperty('retweeted_status')) {
            if (x.mblog.retweeted_status.user == null) {
              builder.retweeted(new RetweetedInfo(
                "未知",
                "抱歉，作者已设置仅展示半年内微博，此微博已不可见。"
              ));
            } else {
              builder.retweeted(new RetweetedInfo(
                x.mblog.retweeted_status.user.screen_name,
                x.mblog.retweeted_status.raw_text || x.mblog.retweeted_status.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\/img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n')
              ));
            }
          }
          list.push(builder.build());
        }
      });
      return list;
    }
  }

  /**
   * @param uid {number}
   * @param customConfigCallback {(function(DataSourceConfigBuilder): void)|undefined}
   * @returns {Promise<WeiboDataSource|null>}
   */
  static async withUid(uid, customConfigCallback = undefined) {
    try {
      const data = await DataSource.getOrFetchUserInfo(uid, WeiboDataSource);
      if (!data) {
        return null;
      }
      const dataUrl = `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=107603${uid}`;
      const configBuilder = DataSourceConfig.builder()
        .icon(data.avatarUrl)
        .dataName(data.dataName)
        .title(data.username)
        .dataUrl(dataUrl);
      if (customConfigCallback) {
        customConfigCallback(configBuilder);
      }
      return new WeiboDataSource(configBuilder.build());
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async fetchUserInfo(uid) {
    const json = await HttpUtil.GET_Json(`https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=100505${uid}`);
    if (json.ok != 1) {
      throw 'request fail: ' + JSON.stringify(json);
    }
    const dataName = WeiboDataSource.typeName + '_' + uid;
    return new UserInfo(dataName, json.data.userInfo.screen_name, json.data.userInfo.avatar_hd);
  }
}
