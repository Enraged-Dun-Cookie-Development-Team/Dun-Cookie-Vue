/**
 * 与小刻食堂服务器通信相关工具
 */
import HttpUtil from './HttpUtil';
import PlatformHelper from '../platform/PlatformHelper';
import Settings from '../Settings';
import {
  BUILD_SIGN,
  CANTEEN_API_BASE,
  CANTEEN_CDN_API_BASE,
  CANTEEN_CDN_SERVER_API_BASE,
  CURRENT_VERSION,
  MESSAGE_WEIBO_ADD_REFERER,
} from '../Constants';
import NotificationUtil from './NotificationUtil';
import TimeUtil from './TimeUtil';
import { Http } from '@enraged-dun-cookie-development-team/common/request';
import DebugUtil from './DebugUtil';
import md5 from 'js-md5';
import { DataSourceMeta } from '../datasource/DataSourceMeta';
import { CookieItem, RetweetedInfo } from '../CookieItem';
import AvailableDataSourceMeta from '../sync/AvailableDataSourceMeta';
import { registerUrlToAddReferer } from '../../background/request_interceptor';
import { UserUtil } from './UserUtil';

const serverOption = {
  appendTimestamp: false,
};

const comboIdCache = {};

/* IFDEBUG */
global.__ceobe_cache__combo_id__ = comboIdCache;
/* FIDEBUG */

async function addHeaders(options) {
  const headers = options.headers ? new Headers(options.headers) : new Headers();
  headers.set('x-ceobe-client-id', await UserUtil.getClientId());
  headers.set('x-ceobe-client-type', 'browser-extension');
  headers.set('x-ceobe-client-platform', PlatformHelper.PlatformType.toLowerCase());
  headers.set('x-ceobe-client-version', CURRENT_VERSION);
  if (BUILD_SIGN) {
    headers.set('x-ceobe-client-sign', BUILD_SIGN);
  }
  options.headers = headers;
  return options;
}

export default class ServerUtil {
  static async requestCdn(path, options) {
    if (path.startsWith('/')) path = path.substring(1);
    return await Http.get(CANTEEN_CDN_API_BASE + path, options);
  }

  static async requestCdnServerApi(path) {
    if (path.startsWith('/')) path = path.substring(1);
    // noinspection JSUnusedGlobalSymbols
    let options = {
      responseTransformer: (response) => response.json(),
    };
    options = await addHeaders(options);
    const result = await Http.get(CANTEEN_CDN_SERVER_API_BASE + path, options);
    if (parseInt(result.code) === 0) {
      return result.data;
    } else {
      throw new Error(`小刻食堂server cdn api请求失败(${path})：${JSON.stringify(result)}`);
    }
  }

  static async requestApi(method, path, _options) {
    if (path.startsWith('/')) path = path.substring(1);
    // noinspection JSUnusedGlobalSymbols
    let options = {
      method: method,
      responseTransformer: (response) => response.json(),
      ..._options,
    };
    options = await addHeaders(options);
    const result = await Http.request(CANTEEN_API_BASE + path, options);
    if (parseInt(result.code) === 0) {
      return result.data;
    } else {
      throw new Error(`小刻食堂api请求失败(${path})：${JSON.stringify(result)}`);
    }
  }

  /**
   * @return {Promise<{allConfig: *, allComboId: string, idMap: Record<string, string>, dataSourceList: DataSourceMeta[], serverDataSourceList: {nickname: string, avatar: string, jump_url: string | null}[], fetchTime: number} | undefined>}
   */
  static async getServerDataSourceInfo(forceCache = false) {
    let serverDataSourceInfo = await PlatformHelper.Storage.getLocalStorage('serverDataSourceInfo');
    const cacheExpireTime = 48 * 60 * 60 * 1000;
    if (serverDataSourceInfo && (forceCache || Date.now() < serverDataSourceInfo.fetchTime + cacheExpireTime)) {
      return serverDataSourceInfo;
    }
    try {
      /**
       * @type {{nickname: string, avatar: string, unique_id: string, jump_url: string, platform: string, db_unique_key: string, datasource: string}[]}
       */
      const serverDataSourceList = await ServerUtil.requestApi('GET', 'canteen/config/datasource/list');
      /**
       * @type {Record<string, string>}
       */
      const idMap = {};
      /**
       * @type {DataSourceMeta[]}
       */
      const dataSourceList = serverDataSourceList.map((source) => {
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
          body: JSON.stringify({ datasource_push: serverDataSourceList.map((it) => it.unique_id) }),
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
      // TODO 暂时不插入未知数据源，这边先记个todo，之后再看怎么处理
      // allConfig.groups = [...allConfig.groups, ...Object.values(unknownGroupsMap)];

      serverDataSourceInfo = {
        dataSourceList: dataSourceList,
        serverDataSourceList: serverDataSourceList,
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

  static async getAvailableDataSourcePreset() {
    const preset = {};
    const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
    if (serverInfo) {
      serverInfo.dataSourceList.forEach((source) => {
        preset[`${source.type}:${source.dataId}`] = source;
      });
    }
    return preset;
  }

  static async checkServerDataSourceInfoCache(updatePreset = true) {
    try {
      await ServerUtil.getServerDataSourceInfo();
      if (updatePreset) {
        AvailableDataSourceMeta.preset = await this.getAvailableDataSourcePreset();
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   *
   * @param sourceList {{type: string, dataId: string, custom?: boolean}[]}
   * @return {Promise<string>}
   */
  static async getComboId(sourceList) {
    const comboCacheKey = md5(
      sourceList
        .map((it) => DataSourceMeta.id(it))
        .sort()
        .join(',')
    );
    if (comboIdCache[comboCacheKey]) {
      return comboIdCache[comboCacheKey];
    }
    const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
    if (!serverInfo) {
      throw new Error('无法获取服务器配置');
    }
    const canteenIdList = sourceList
      .map((it) => {
        const key = `${it.type}:${it.dataId}`;
        const serverId = serverInfo.idMap[key];
        if (typeof serverId !== 'string' || serverId.length === 0) {
          DebugUtil.debugLogWarn(0, `服务器未定义的数据源：${key}`);
          return undefined;
        }
        return serverId;
      })
      .filter((it) => !!it);
    const comboId = (
      await ServerUtil.requestApi('POST', 'canteen/user/getDatasourceComb', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datasource_push: canteenIdList }),
      })
    ).datasource_comb_id;
    if (typeof comboId !== 'string' || comboId.length === 0) {
      throw new Error('无法获取组合id');
    }
    if (comboId) {
      comboIdCache[comboCacheKey] = comboId;
    }
    return comboIdCache[comboCacheKey];
  }

  static async getCookieList(comboId, cookieId, updateCookieId) {
    let result;
    if (updateCookieId) {
      try {
        result = await ServerUtil.requestCdnServerApi(
          'cdn/cookie/mainList/cookieList' +
            `?datasource_comb_id=${encodeURIComponent(comboId)}` +
            `&cookie_id=${encodeURIComponent(cookieId)}` +
            `&update_cookie_id=${encodeURIComponent(updateCookieId)}`
        );
      } catch (e) {
        result = await ServerUtil.requestCdnServerApi(
          'cdn/cookie/mainList/cookieList' +
            `?datasource_comb_id=${encodeURIComponent(comboId)}` +
            `&cookie_id=${encodeURIComponent(cookieId)}`
        );
      }
    } else {
      result = await ServerUtil.requestCdnServerApi(
        'cdn/cookie/mainList/cookieList' +
          `?datasource_comb_id=${encodeURIComponent(comboId)}` +
          `&cookie_id=${encodeURIComponent(cookieId)}`
      );
    }
    if (result) {
      const weiboImgs = [];
      for (const cookie of result.cookies) {
        if (!cookie.source.type.startsWith('weibo:')) continue;
        const images = cookie.default_cookie.images?.flatMap((it) => [it.origin_url, it.compress_url]);
        if (images && images.length > 0) {
          weiboImgs.push(...images);
        }
      }
      if (PlatformHelper.isBackground) {
        weiboImgs.forEach((src) => registerUrlToAddReferer(src, 'https://m.weibo.cn/'));
      } else {
        await PlatformHelper.Message.send(MESSAGE_WEIBO_ADD_REFERER, { urls: weiboImgs });
      }
    }
    return result;
  }

  static transformCookieListToItemList(cookies) {
    return cookies
      .map((cookie) => {
        if (cookie.item.is_retweeted && !Settings.dun.showRetweet) {
          return;
        }
        const images = cookie.default_cookie.images?.map((it) => it.origin_url);
        const cover = images && images.length > 0 ? images[0] : undefined;
        const builder = CookieItem.builder(`${cookie.source.type}:${cookie.source.data}`)
          .id(cookie.item.id)
          .timeForSort(cookie.timestamp.fetcher)
          .coverImage(cover)
          .imageList(images)
          .content(cookie.default_cookie.text)
          .jumpUrl(cookie.item.url);
        if (cookie.timestamp.platform) {
          if (cookie.timestamp.platform_precision !== 'day') {
            builder.timeForDisplay(TimeUtil.format(cookie.timestamp.platform, 'yyyy-MM-dd hh:mm:ss'));
          } else {
            builder.timeForDisplay(TimeUtil.format(cookie.timestamp.platform, 'yyyy-MM-dd'));
          }
        } else {
          builder.timeForDisplay(TimeUtil.format(cookie.timestamp.fetcher || 0, 'yyyy-MM-dd hh:mm:ss'));
        }
        if (cookie.item.is_retweeted) {
          builder.retweeted(new RetweetedInfo(cookie.item.retweeted.author_name, cookie.item.retweeted.text || ''));
        }
        return builder.build();
      })
      .filter((it) => !!it);
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
            new Date(x.start_time) <= TimeUtil.changeToCCT(new Date()) &&
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
            let statusKey = md5(x.html.replace(/<div.*?>|<\/div>|<p.*?>|<\/p>|<\/img.*?>/g, ''));
            if (!announcementNoticeStatus[today][statusKey]) {
              announcementNoticeStatus[today][statusKey] = true;
              let imgReg = /<img.*?src=['"](.*?)['"]/;
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
   * 获取第三方工具链接
   * @return {Promise<{toolList: {nickname: string, avatar: string, jump_url: string}[]}>}
   */
  static async getThirdPartyToolsInfo() {
    const toolList = await this.requestApi('GET', '/canteen/operate/toolLink/list');
    return {
      toolList: toolList,
    };
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
        return;
      }
      const response = error.response;
      if (response.status >= 500 && response.status < 600) {
        checkVersionUpdate = false;
        return;
      }
      if (response.status >= 400 && response.status < 500) {
        checkVersionUpdate = false;
        return response.text();
      }
      console.log(error);
    };
    const arg = targetVersion ? `?version=${targetVersion}` : '';
    data = await HttpUtil.GET_Json(
      `${CANTEEN_API_BASE}canteen/operate/version/plugin${arg}`,
      serverOption,
      failController,
      false
    );
    if (data) {
      if (parseInt(data.code) === 0) {
        data = data.data;
      } else {
        console.warn(data.message || `获取在线版本信息响应失败：${JSON.stringify(data)}`);
        data = null;
      }
    }
    if (!data) {
      const fallbackUrl = PlatformHelper.Extension.getURL('Dun-Cookies-Info.json');
      data = await HttpUtil.GET_Json(fallbackUrl);
      data = data.upgrade;
      data.is_fallback = true;
    }
    if (!data) {
      throw new Error('获取在线版本信息失败，获取备用版本信息失败。');
    }
    if (checkVersionUpdate) {
      if (Settings.JudgmentVersion(data.version, CURRENT_VERSION) && Settings.dun.enableNotice) {
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
