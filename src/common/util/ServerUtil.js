/**
 * 与小刻食堂服务器通信相关工具
 */
import HttpUtil from './HttpUtil';
import PlatformHelper from '../platform/PlatformHelper';
import Settings from '../Settings';
import { CANTEEN_API_BASE, CURRENT_VERSION } from '../Constants';
import NotificationUtil from './NotificationUtil';
import TimeUtil from './TimeUtil';

const serverOption = {
  appendTimestamp: false,
};

export default class ServerUtil {
  /**
   * 获取公告信息
   */
  static async getAnnouncementInfo(shouldNotice) {
    await new Promise((resolve) => Settings.doAfterInit(() => resolve()));
    let data;
    try {
      data = await HttpUtil.GET_Json(CANTEEN_API_BASE + 'canteen/operate/announcement/list', serverOption);
    } catch (e) {
      console.log(e);
    }
    if (!data) {
      const fallbackUrl = PlatformHelper.Extension.getURL('Dun-Cookies-Info.json');
      data = await HttpUtil.GET_Json(fallbackUrl);
      data = data.list;
    } else {
      data = data.data;
    }
    if (!data) {
      return data;
    }
    if (shouldNotice) {
      if (Settings.feature.announcementNotice) {
        let filterList = data.filter(
          (x) =>
            new Date(x.star_time) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.over_time) >= TimeUtil.changeToCCT(new Date())
        );

        let today = TimeUtil.format(new Date(), 'yyyy-MM-dd');
        let announcementNoticeStatus =
          (await PlatformHelper.Storage.getLocalStorage('announcement-notice-status')) || {};

        // 判断当天是否推送过
        filterList.map((x) => {
          if (x.notice) {
            if (!announcementNoticeStatus[today]) {
              announcementNoticeStatus = {};
              announcementNoticeStatus[today] = {};
            }
            if (!announcementNoticeStatus[today][today + '-' + x.notice]) {
              announcementNoticeStatus[today][today + '-' + x.notice] = true;
              let imgReg = /<img.*?src='(.*?)'/;
              let imgUrl = x.html.match(imgReg)[1];
              let removeTagReg = /<\/?.+?\/?>/g;
              let divReg = /<\/div>/g;

              let content = x.html.replace(/\s+/g, '');
              content = content.replace(divReg, '\n');
              content = content.replace(removeTagReg, '');

              imgUrl = imgUrl == '/assets/image/' + Settings.logo ? '/assets/image/announcement.png' : imgUrl;

              NotificationUtil.SendNotice(
                '博士，重要公告，记得开列表看噢！',
                content,
                imgUrl,
                'announcement' + new Date().getTime()
              );
            }
          }
        });
        PlatformHelper.Storage.saveLocalStorage('announcement-notice-status', announcementNoticeStatus);
      }
    }
    return data;
  }

  /**
   * 获取视频信息
   */
  static async getVideoInfo() {
    await new Promise((resolve) => Settings.doAfterInit(() => resolve()));
    let data;
    try {
      data = await HttpUtil.GET_Json(CANTEEN_API_BASE + 'canteen/operate/video/list', serverOption);
    } catch (e) {
      console.log(e);
    }
    if (!data) {
      const fallbackUrl = PlatformHelper.Extension.getURL('Dun-Cookies-Info.json');
      data = await HttpUtil.GET_Json(fallbackUrl);
      data = data.btnList;
    } else {
      data = data.data;
    }
    return data;
  }

  /**
   * 获取公告资源信息
   */
  static async getResourceInfo() {
    await new Promise((resolve) => Settings.doAfterInit(() => resolve()));
    let data;
    try {
      data = await HttpUtil.GET_Json(CANTEEN_API_BASE + 'canteen/operate/resource/get', serverOption);
    } catch (e) {
      console.log(e);
    }
    if (!data) {
      const fallbackUrl = PlatformHelper.Extension.getURL('Dun-Cookies-Info.json');
      data = await HttpUtil.GET_Json(fallbackUrl);
      data = data.dayInfo;
    } else {
      data = data.data;
    }
    return data;
  }

  /**
   * @param checkVersionUpdate {boolean} 是否检测版本更新并推送
   * @param targetVersion {string} 要获取的目标版本信息，不提供时获取最新版
   */
  static async getVersionInfo(checkVersionUpdate = true, targetVersion = undefined) {
    await new Promise((resolve) => Settings.doAfterInit(() => resolve()));
    let data;
    const failController = (error) => {
      // 断网导致没有response和服务器响应5xx的情况不检测是否存在版本更新
      if (!error.response) {
        checkVersionUpdate = false;
      }
      const response = error.response;
      if (response.status >= 500 && response.status < 600) {
        checkVersionUpdate = false;
      }
    };
    const arg = targetVersion ? `?version=${targetVersion}` : '';
    data = await HttpUtil.GET_Json(
      `${CANTEEN_API_BASE}canteen/operate/version/plugin${arg}`,
      serverOption,
      failController
    );
    if (!data) {
      const fallbackUrl = PlatformHelper.Extension.getURL('Dun-Cookies-Info.json');
      data = await HttpUtil.GET_Json(fallbackUrl);
      data = data.upgrade;
      data.is_fallback = true;
    } else {
      data = data.data;
    }
    if (!data) {
      return data;
    }
    if (checkVersionUpdate) {
      if (Settings.JudgmentVersion(data.upgrade.v, CURRENT_VERSION) && Settings.dun.enableNotice) {
        NotificationUtil.SendNotice(
          '小刻食堂翻新啦！！',
          '快来使用新的小刻食堂噢！一定有很多好玩的新功能啦！！',
          null,
          'update'
        );
      }
    }
    return data;
  }
}
