import {DataSource} from '../DataSource';
import {settings} from '../Settings';

/**
 * 游戏内公告数据源。
 * <p>
 * 虽然在插件的提示中是制作组通讯，但实际上能捕获所有游戏内公告，考虑加正则？
 */
export class InGameAnnouncementDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
  }

  processData(opt, kazeLocalData, kazeFun) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    data.announceList.forEach(x => {
      if (x.announceId != 94 && x.announceId != 98 && x.announceId != 192 && x.announceId != 95 && x.announceId != 97) {
        let time = `${new Date().getFullYear()}/${x.month}/${x.day} ${settings.isTop ? '23:59:59' : '00:00:00'}`;
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
    if (settings.isPush == true) {
      kazeFun.JudgmentNewFocusAnnounceId(data);
    }
    return list.sort((x, y) => y.judgment - x.judgment);
  }
}
