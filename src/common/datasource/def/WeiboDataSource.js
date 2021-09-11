import {DataSource, UserInfo} from '../DataSource';
import Settings from '../../Settings';
import TimeUtil from '../../util/TimeUtil';
import {DataItem, RetweetedInfo} from '../../DataItem';
import HttpUtil from '../../util/HttpUtil';

/**
 * 微博数据源。
 * <p>
 */
export class WeiboDataSource extends DataSource {

  static get typeName() {
    return 'weibo';
  };

  static async withUid(uid, priority) {
    try {
      const data = await DataSource.getOrFetchUserInfo(uid, WeiboDataSource);
      if (!data) {
        return null;
      }
      const dataUrl = `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=107603${uid}`;
      return new WeiboDataSource(data.avatarUrl, data.dataName, data.username, dataUrl, priority);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
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

          const builder = DataItem.builder(this.dataName)
            .id(weiboId)
            .timeForSort(time.getTime())
            .timeForDisplay(TimeUtil.format(new Date(time), 'yyyy-MM-dd hh:mm:ss'))
            .content(dynamicInfo.raw_text || dynamicInfo.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n'))
            .jumpUrl(`https://weibo.com/${weiboId}`)
            .coverImage(dynamicInfo.bmiddle_pic)
            .imageList(dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/large/${x}`));

          if (x.mblog.hasOwnProperty('isTop') && x.mblog.isTop == 1) {
            builder.setTop();
          }
          // 转发内容
          if (x.mblog.hasOwnProperty('retweeted_status')) {
            builder.retweeted(new RetweetedInfo(
              x.mblog.retweeted_status.user.screen_name,
              x.mblog.retweeted_status.raw_text || x.mblog.retweeted_status.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\/img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n')
            ));
          }
          list.push(builder.build());
        }
      });
      return list;
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
