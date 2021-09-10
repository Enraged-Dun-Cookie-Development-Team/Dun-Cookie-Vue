import {DataSource} from '../DataSource';
import Settings from '../../Settings';
import NotificationUtil from '../../util/NotificationUtil';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';

/**
 * 需要被忽略的公告列表，一般是常驻活动/用户协议公告之类的
 * <p>
 * <strong>注意：这里只设置了IOS公告的值，Android的值是不同的，如果以后要获取Android的公告需要把那边的忽略列表也加上去</strong>
 */
const ignoreAnnounces = [94, 95, 97, 98, 192];

/**
 * 游戏内公告数据源。
 * <p>
 * 虽然在插件的提示中是制作组通讯，但实际上能捕获所有游戏内公告，考虑加正则？
 */
export class InGameAnnouncementDataSource extends DataSource {

  static get typeName() {
    return 'arknights_in_game_announcement';
  };

  FocusAnnounceId = null;

  constructor(icon, dataName, title, dataUrl, rootUrl, priority) {
    super(icon, dataName, title, dataUrl, rootUrl, priority);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    data.announceList.forEach(x => {
      if (ignoreAnnounces.includes(parseInt(x.announceId))) {
        return;
      }
      const time = new Date(`${new Date().getFullYear()}-${x.month}-${x.day} ${Settings.getTimeBySortMode()}`);
      list.push(DataItem.builder(opt.dataName)
        .id(x.announceId)
        .timeForSort(time.getTime())
        .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
        .content(x.title)
        .jumpUrl(x.webUrl)
        .build()
      );
    });
    if (Settings.dun.enableNotice) {
      this.JudgmentNewFocusAnnounceId(data);
    }
    return list;
  }

  // 通讯组专用 检测到了可能会更新
  JudgmentNewFocusAnnounceId(data) {
    if (data) {
      if (this.FocusAnnounceId && data.focusAnnounceId && this.FocusAnnounceId != data.focusAnnounceId && this.FocusAnnounceId < data.focusAnnounceId) {
        let announceIdExist = false;
        data.announceList.forEach(x => {
          if (data.focusAnnounceId == x.announceId) {
            announceIdExist = true;
          }
        })
        if (!announceIdExist) {
          NotificationUtil.SendNotice(`【通讯组预告】小刻貌似闻到了饼的味道！`, '检测到游戏出现公告弹窗，可能马上发饼！', null, new Date().getTime())
        }
      }
      this.FocusAnnounceId = data.focusAnnounceId;
    }
  }
}
