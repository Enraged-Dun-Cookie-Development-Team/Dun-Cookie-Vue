import { DataSource, DataSourceTypeInfo } from '../DataSource';
import Settings from '../../Settings';
import NotificationUtil from '../../util/NotificationUtil';
import TimeUtil from '../../util/TimeUtil';
import { DataItem } from '../../DataItem';
import HttpUtil from '../../util/HttpUtil';

const typeInfo = new DataSourceTypeInfo('arknights_in_game_announcement', 15 * 1000);

/**
 * 需要被忽略的公告列表，一般是常驻活动/用户协议公告之类的
 * <p>
 * <strong>注意：这里只设置了IOS公告的值，Android的值是不同的，如果以后要获取Android的公告需要把那边的忽略列表也加上去</strong>
 */
const ignoreAnnounces = [94, 95, 97, 98, 192, 112];

let FocusAnnounceId = null;
let ClientVersion = null;
let ResVersion = null;
let GamePlatform = null;

/**
 * 游戏内公告数据源。
 * <p>
 * 虽然在插件的提示中是制作组通讯，但实际上能捕获所有游戏内公告，考虑加正则？
 */
export class InGameAnnouncementDataSource extends DataSource {
  /**
   * @returns {DataSourceTypeInfo}
   */
  static get typeInfo() {
    return typeInfo;
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
    data.announceList.forEach((x) => {
      if (ignoreAnnounces.includes(parseInt(x.announceId))) {
        return;
      }
      let year =
        new Date(`${new Date().getFullYear()}-${x.month}-${x.day} 00:00:00`) <= new Date()
          ? new Date().getFullYear()
          : new Date().getFullYear() - 1;
      const time = new Date(`${year}-${x.month}-${x.day} ${Settings.getTimeBySortMode()}`);
      list.push(
        DataItem.builder(this.dataName)
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
      let versionData = await HttpUtil.GET_Json(
        `https://ak-conf.hypergryph.com/config/prod/${Settings.dun.gamePlatform}/version`
      );
      this.JudgmentVersionRelease(versionData);
    }

    return list;
  }

  // 通讯组专用 检测到了可能会更新
  JudgmentNewFocusAnnounceId(data) {
    if (data) {
      if (
        FocusAnnounceId &&
        data.focusAnnounceId &&
        FocusAnnounceId != data.focusAnnounceId &&
        FocusAnnounceId < data.focusAnnounceId
      ) {
        let announceIdExist = false;
        data.announceList.forEach((x) => {
          if (data.focusAnnounceId == x.announceId) {
            announceIdExist = true;
          }
        });
        if (!announceIdExist) {
          NotificationUtil.SendNotice(
            `【通讯组预告】小刻貌似闻到了饼的味道！`,
            '检测到游戏出现公告弹窗，可能马上发饼！',
            null,
            new Date().getTime()
          );
        }
      }
      FocusAnnounceId = data.focusAnnounceId;
    }
  }

  // 判断版本号时候更新
  JudgmentVersionRelease(versionData) {
    if (versionData) {
      // 避免切换平台弹出更新通知
      if (GamePlatform == Settings.dun.gamePlatform) {
        let platformName = 'Android';
        switch (Settings.dun.gamePlatform) {
          case 'official/Android':
            platformName = 'Android';
            break;
          case 'official/IOS':
            platformName = 'Android';
            break;
          case 'b/Android':
            platformName = 'Bilibili';
            break;
        }
        if (ClientVersion && versionData.clientVersion && ClientVersion != versionData.clientVersion) {
          const nowVersion = versionData.clientVersion.split('.').map((a) => parseInt(a));
          const pastVersion = ClientVersion.split('.').map((a) => parseInt(a));

          if (nowVersion[0] > pastVersion[0]) {
            NotificationUtil.SendNotice(
              `【${platformName}/超大版本】更新包已经准备好啦`,
              '博士，这可是难遇的超大版本更新诶！！！\n相信博士已经等不及了吧，快去下载呦~',
              null,
              new Date().getTime()
            );
          } else if (nowVersion[1] > pastVersion[1] || nowVersion[2] > pastVersion[2]) {
            NotificationUtil.SendNotice(
              `【${platformName}/大版本】更新包已经准备好啦`,
              '博士，更新包已经给你准备好啦！\n先下载更新包，等等进游戏快人一部噢！',
              null,
              new Date().getTime()
            );
          }
        } else if (ResVersion && versionData.resVersion && ResVersion != versionData.resVersion) {
          NotificationUtil.SendNotice(
            `【${platformName}/闪断更新】已经完成闪断更新`,
            '博士，快去重启进入游戏吧！',
            null,
            new Date().getTime()
          );
        }
      } else {
        GamePlatform = Settings.dun.gamePlatform;
      }
      ClientVersion = versionData.clientVersion;
      ResVersion = versionData.resVersion;
    }
  }
}
