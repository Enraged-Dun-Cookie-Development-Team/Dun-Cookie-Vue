/**
 * 与小刻食堂服务器通信相关工具
 */
import HttpUtil from './HttpUtil';
import PlatformHelper from '../platform/PlatformHelper';
import Settings from '../Settings';
import { CANTEEN_API_BASE, CANTEEN_CDN_API_BASE, CURRENT_VERSION } from '../Constants';
import NotificationUtil from './NotificationUtil';
import TimeUtil from './TimeUtil';
import { Http } from '@enraged-dun-cookie-development-team/common/request';
import DebugUtil from './DebugUtil';

const serverOption = {
  appendTimestamp: false,
};

/**
 * @type {{allConfig: *, allComboId: string, idMap: Record<string, string>, dataSourceList: DataSourceMeta[], fetchTime: number}}
 */
let serverDataSourceInfo;

export default class ServerUtil {
  static async requestCdnApi(path) {
    if (path.startsWith('/')) path = path.startsWith(1);
    const result = await Http.get(CANTEEN_CDN_API_BASE + path, {
      headers: {
        'User-Agent': '',
      },
      responseTransformer: async (response) => response.json(),
    });
    if (parseInt(result.code) === 0) {
      return result.data;
    } else {
      throw new Error(`小刻食堂cdn api请求失败：${path}，${result.message}`);
    }
  }

  static async requestApi(method, path, options) {
    if (path.startsWith('/')) path = path.startsWith(1);
    const result = await Http.request(CANTEEN_API_BASE + path, {
      headers: {
        'User-Agent': '',
      },
      method: method,
      responseTransformer: async (response) => response.json(),
      ...options,
    });
    if (parseInt(result.code) === 0) {
      return result.data;
    } else {
      throw new Error(`小刻食堂api请求失败：${path}，${result.message}`);
    }
  }

  /**
   * @return {Promise<{allConfig: *, allComboId: string, idMap: Record<string, string>, dataSourceList: DataSourceMeta[], fetchTime: number} | undefined>}
   */
  static async getServerDataSourceInfo(forceCache = false) {
    if (!serverDataSourceInfo) {
      serverDataSourceInfo = await PlatformHelper.Storage.getLocalStorage('serverDataSourceInfo');
    }
    if (serverDataSourceInfo && (forceCache || Date.now() - serverDataSourceInfo.fetchTime < 30 * 60 * 1000)) {
      return serverDataSourceInfo;
    }
    try {
      /**
       * @type {{nickname: string, avatar: string, unique_id: string, jump_url: string, platform: string, db_unique_key: string, datasource: string}[]}
       */
      const rawDataSourceList = await ServerUtil.requestApi('GET', 'canteen/config/datasource/list');
      // for (const source of rawDataSourceList) {
      //   source.type = ...;
      //   source.dataId = ...;
      // }
      /**
       * @type {Record<string, string>}
       */
      const idMap = {};
      /**
       * @type {DataSourceMeta[]}
       */
      const dataSourceList = rawDataSourceList.map((source) => {
        const type = source.datasource;
        const dataId = source.db_unique_key;
        idMap[`${type}:${dataId}`] = source.unique_id;
        return {
          type: type,
          dataId: dataId,
          name: source.nickname,
          icon: source.avatar,
        };
      });
      /**
       * @type {string}
       */
      const allComboId = (
        await ServerUtil.requestApi('POST', 'canteen/user/getDatasourceComb', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ datasource_push: rawDataSourceList.map((it) => it.unique_id) }),
        })
      ).datasource_comb_id;

      const allConfig = await ServerUtil.requestApi('GET', `canteen/config/fetcher/standaloneConfig/${allComboId}`);
      allConfig.groups = allConfig.groups || [];
      const unknownSourceMap = Object.fromEntries(dataSourceList.map((it) => [`${it.type}:${it.dataId}`, it]));
      const dataIdKeyInConfig = {
        'bilibili:dynamic-by-uid': 'uid',
        'weibo:dynamic-by-uid': 'uid',
        'netease-cloud-music:albums-by-artist': 'artistId',
        'arknights-game:announcement': 'platform',
        'arknights-game:bulletin-list': 'platform',
        'arknights-game:version': 'platform',
      };
      for (const group of allConfig.groups) {
        for (const item of group.datasource) {
          delete unknownSourceMap[`${group.type}:${item[dataIdKeyInConfig[group.type]] || '-'}`];
        }
      }
      const unknownGroupsMap = {};
      for (const item of Object.values(unknownSourceMap)) {
        DebugUtil.debugLog(1, '服务器数据源缺少配置：', item);
        if (!unknownGroupsMap[item.type]) {
          unknownGroupsMap[item.type] = {
            type: item.type,
            interval_by_time_range: [{ time_range: ['00:00', '24:00'], interval: 0 }],
            datasource: [],
          };
        }
        const source = {};
        if (dataIdKeyInConfig[item.type]) {
          source[dataIdKeyInConfig[item.type]] = item.dataId;
        }
        unknownGroupsMap[item.type].datasource.push(source);
      }
      allConfig.groups = [...allConfig.groups, ...Object.values(unknownGroupsMap)];

      serverDataSourceInfo = {
        dataSourceList: dataSourceList,
        idMap: idMap,
        allComboId: allComboId,
        allConfig: allConfig,
        fetchTime: Date.now(),
      };
    } catch (e) {
      console.error(e);
      console.error('请求服务器数据失败');
      return;
    }
    await PlatformHelper.Storage.saveLocalStorage('serverDataSourceInfo', serverDataSourceInfo);
    return serverDataSourceInfo;
  }

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
