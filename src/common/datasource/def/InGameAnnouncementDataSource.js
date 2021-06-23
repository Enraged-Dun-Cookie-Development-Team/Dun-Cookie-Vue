import {DataSource} from '../DataSource';
import {settings} from '../../Settings';
import NotificationUtil from '../../NotificationUtil';

/**
 * 游戏内公告数据源。
 * <p>
 * 虽然在插件的提示中是制作组通讯，但实际上能捕获所有游戏内公告，考虑加正则？
 */
export class InGameAnnouncementDataSource extends DataSource {

  FocusAnnounceId = null;

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    data.announceList.forEach(x => {
      if (x.announceId != 94 && x.announceId != 98 && x.announceId != 192 && x.announceId != 95 && x.announceId != 97) {
        let time = `${new Date().getFullYear()}/${x.month}/${x.day} ${settings.getTimeBySortMode()}`;
        list.push({
          time: Math.floor(new Date(time).getTime() / 1000),
          judgment: x.announceId,
          id: x.announceId,
          dynamicInfo: x.title,
          source: opt.source,
          url: x.webUrl,
        });
      }
    });
    if (settings.dun.enableNotice) {
      this.JudgmentNewFocusAnnounceId(data);
    }
    return list.sort((x, y) => y.judgment - x.judgment);
  }

  // 通讯组专用 检测到了可能会更新
  JudgmentNewFocusAnnounceId(data) {
    if (data) {
      if (this.FocusAnnounceId && data.focusAnnounceId && this.FocusAnnounceId != data.focusAnnounceId) {
        NotificationUtil.SendNotice(`【通讯组预告】小刻貌似闻到了饼的味道！`, '检测到游戏出现公告弹窗，可能马上发饼！', null, new Date().getTime())
      }
      this.FocusAnnounceId = data.focusAnnounceId;
    }
  }
}
