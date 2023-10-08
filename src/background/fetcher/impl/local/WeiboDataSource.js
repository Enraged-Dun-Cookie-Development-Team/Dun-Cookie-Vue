import Settings from '../../../../common/Settings';
import TimeUtil from '../../../../common/util/TimeUtil';
import { CookieItem, RetweetedInfo } from '../../../../common/CookieItem';

/**
 * 微博数据源。
 * <p>
 */
export class WeiboDataSource {
  static async processData(rawDataText, sourceId) {
    let data = JSON.parse(rawDataText);
    // 是否显示转发内容
    if (!Settings.dun.showRetweet && data.hasOwnProperty('mblog') && data.mblog.hasOwnProperty('retweeted_status')) {
      return;
    }
    if (data.hasOwnProperty('mblog')) {
      let dynamicInfo = data.mblog;
      let weiboId = data.mblog.bid;
      let time = new Date(dynamicInfo.created_at);
      const builder = CookieItem.builder(sourceId)
        .id(weiboId)
        .timeForSort(time.getTime())
        .timeForDisplay(TimeUtil.format(new Date(time), 'yyyy-MM-dd hh:mm:ss'))
        .content(
          dynamicInfo.raw_text ||
            dynamicInfo.text
              .replace(
                /<a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<img.*?>|全文|网页链接/g,
                ''
              )
              .replace(/<br \/>/g, '\n')
        )
        .jumpUrl(`https://weibo.com/${weiboId}`);

      switch (dynamicInfo.page_info?.type) {
        // 普通动态
        case 'search_top': {
          builder
            .coverImage(dynamicInfo.original_pic ? dynamicInfo.original_pic.replace('https', 'http') : null)
            .imageList(dynamicInfo.pics?.map((x) => x.url));
          break;
        }
        // 视频动态
        case 'video': {
          builder.coverImage(dynamicInfo.page_info.page_pic?.url?.replace('https', 'http')).imageList(null);
          break;
        }
        // 直播动态
        case 'live': {
          builder.coverImage(dynamicInfo.page_info.page_pic?.url?.replace('https', 'http')).imageList(null);
          break;
        }
        default: {
          builder
            .coverImage(dynamicInfo.original_pic?.replace('https', 'http'))
            .imageList(dynamicInfo.pics?.map((x) => x.url));
          break;
        }
      }

      if (data.mblog.hasOwnProperty('isTop') && data.mblog.isTop == 1) {
        builder.setTop();
      }
      // 转发内容
      if (data.mblog.hasOwnProperty('retweeted_status')) {
        if (data.mblog.retweeted_status.user == null) {
          builder.retweeted(new RetweetedInfo('未知', '抱歉，作者已设置仅展示半年内微博，此微博已不可见。'));
        } else {
          builder.retweeted(
            new RetweetedInfo(
              data.mblog.retweeted_status.user.screen_name,
              data.mblog.retweeted_status.raw_text ||
                data.mblog.retweeted_status.text
                  .replace(
                    /<a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\/img.*?>|全文|网页链接/g,
                    ''
                  )
                  .replace(/<br \/>/g, '\n')
            )
          );
        }
      }
      return builder.build();
    }
  }
}
