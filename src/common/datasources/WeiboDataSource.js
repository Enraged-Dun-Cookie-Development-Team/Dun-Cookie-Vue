import {DataSource} from '../DataSource';
import {settings} from '../Settings';

/**
 * 微博数据源。
 * <p>
 */
export class WeiboDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
      data.data.cards.forEach(x => {
        // 设置是否显示转发内容
        if (!settings.dun.showRetweet && x.hasOwnProperty('mblog') && x.mblog.hasOwnProperty('retweeted_status')) {
          return;
        }
        if (x.hasOwnProperty('mblog')) {
          let dynamicInfo = x.mblog;
          let weiboId = data.data.cardlistInfo.containerid;
          let time = Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000);
          let imageList = dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/large/${x}`);
          let info = {
            time: time,
            id: time,
            isTop: x.mblog.hasOwnProperty('isTop') && x.mblog.isTop == 1,
            judgment: time,
            dynamicInfo: dynamicInfo.raw_text || dynamicInfo.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n'),
            html: dynamicInfo.text,
            image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
            imageList: imageList,
            type: (dynamicInfo.hasOwnProperty("page_info") && dynamicInfo.page_info.hasOwnProperty('type') && dynamicInfo.page_info.type == "video") ? 0 : 1,
            source: opt.source,
            url: "https://weibo.com/" + weiboId.substring((weiboId.length - 10), weiboId.length) + "/" + x.mblog.bid,
            detail: []
          };
          // 转发内容
          if (x.mblog.hasOwnProperty('retweeted_status')) {
            let retweeted = {
              name: x.mblog.retweeted_status.user.screen_name,
              dynamicInfo: x.mblog.retweeted_status.raw_text || x.mblog.retweeted_status.text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<span class="url-icon">|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n')
            }
            info.retweeted = retweeted;
          }
          list.push(info);
        }

      });
      return list.sort((x, y) => y.judgment - x.judgment);
    }
  }
}
