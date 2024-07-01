import { distance } from 'fastest-levenshtein';
import Settings from '../common/Settings';
import NotificationUtil from '../common/util/NotificationUtil';
import DunInfo from '../common/sync/DunInfo';
import { FetchData } from '@enraged-dun-cookie-development-team/cookie-fetcher-core';
import { DataSourceMeta } from '../common/datasource/DataSourceMeta';
import { BilibiliDataSource } from './fetcher/impl/local/BilibiliDataSource';
import { WeiboDataSource } from './fetcher/impl/local/WeiboDataSource';
import { NeteaseCloudMusicDataSource } from './fetcher/impl/local/NeteaseCloudMusicDataSource';
import { GameBulletinListDataSource } from './fetcher/impl/local/GameBulletinListDataSource';
import { MonsterSirenDataSource } from './fetcher/impl/local/MonsterSirenDataSource';
import { TerraHistoricusDataSource } from './fetcher/impl/local/TerraHistoricusDataSource';
import AvailableDataSourceMeta from '../common/sync/AvailableDataSourceMeta';
import { CookieItem } from '../common/CookieItem';
import CardList from '../common/sync/CardList';
import ServerUtil from '../common/util/ServerUtil';
import { registerUrlToAddReferer } from './request_interceptor';

/**
 * 最新推送的通知，用于避免不同平台的饼重复通知，每一项由[数据源的dataName, 删除空白字符的饼内容]组成
 * @type {[string, string][]}
 */
const lastCookiesCache = [];
const lastCookiesCacheStorageKey = 'cache:lastCookies';
PlatformHelper.Storage.getLocalStorage(lastCookiesCacheStorageKey).then((data) => {
  if (typeof data === 'string' && data.length > 0) {
    const cache = JSON.parse(data);
    if (Array.isArray(cache) && cache.length > 0) {
      lastCookiesCache.push(...cache);
    }
  }
});

/**
 * 只缓存指定数量的饼用于检测重复
 * @type {number}
 */
const DUPLICATE_CHECK_COUNT = 10;
/**
 * 判断饼重复的相似度阈值
 * @type {number}
 */
const DUPLICATE_THRESHOLD = 0.8;

/**
 *
 * @param sourceName {string} 数据源的dataName
 * @param cookieContent {string} 删除空白符的饼内容
 */
function isDuplicateCookie(sourceName, cookieContent) {
  // 设置相似度阈值，如果饼的相似度达到指定值(范围0~1，值越大越相似，1为完全相等)则视为重复饼
  for (const data of lastCookiesCache) {
    if (data[0] === sourceName) {
      // 相同数据源的不检测重复
      continue;
    }
    const rate = 1 - distance(cookieContent, data[1]) / Math.max(cookieContent.length, data[1].length);
    if (rate > DUPLICATE_THRESHOLD) {
      return true;
    }
  }
  return false;
}

/**
 * 新饼推送通知
 * @param source {DataSourceMeta}
 * @param newCookieList {CookieItem[]}
 * @private
 */
function tryNotice(source, newCookieList) {
  if (!Settings.dun.enableNotice) {
    return;
  }
  for (const cookie of newCookieList) {
    const cookieContent = cookie.content.replace(/\s/g, '');
    // 启用了推送重复饼，或者没启用且饼不是重复的，则进行推送
    if (Settings.dun.repetitionPush || !isDuplicateCookie(DataSourceMeta.id(source), cookieContent)) {
      NotificationUtil.SendNotice(
        `小刻在【${source.name}】里面找到了一个饼！`,
        cookieContent,
        cookie.coverImage,
        cookie.id
      );
    }
    lastCookiesCache.push([DataSourceMeta.id(source), cookieContent]);
    if (lastCookiesCache.length > DUPLICATE_CHECK_COUNT) {
      lastCookiesCache.shift();
    }
  }
  void PlatformHelper.Storage.saveLocalStorage(lastCookiesCacheStorageKey, JSON.stringify(lastCookiesCache));
}

const LocalCardMap = {};
const ServerCookieIdCache = new Set();

/**
 * 蹲饼处理器
 */
class CookieHandler {
  /**
   * @type {(configId: string, fetchData: FetchData) => Promise<void>}
   */
  static handleLocal = async (configId, fetchData) => {
    if (!fetchData.success) return;
    DunInfo.counter++;
    DunInfo.lastDunTime = Date.now();

    /**
     * @param list
     * @param sourceId
     * @return {Promise<CookieItem[]>}
     */
    const transform = (list, sourceId) => {
      return Promise.all(
        list
          .map((it) => {
            if (it.type === 'common') {
              switch (it.dataSourceId.typeId) {
                case 'bilibili:dynamic-by-uid':
                  return BilibiliDataSource.processData(it.rawContent, sourceId);
                case 'weibo:dynamic-by-uid':
                  return WeiboDataSource.processData(it.rawContent, sourceId);
                case 'netease-cloud-music:albums-by-artist':
                  return NeteaseCloudMusicDataSource.processData(it.rawContent, sourceId);
                case 'arknights-game:bulletin-list':
                  return GameBulletinListDataSource.processData(it.rawContent, sourceId);
                case 'arknights-website:monster-siren':
                  return MonsterSirenDataSource.processData(it.rawContent, sourceId);
                case 'arknights-website:terra-historicus':
                  return TerraHistoricusDataSource.processData(it.rawContent, sourceId);
                default:
                  console.warn('不支持的数据源类型：' + it.dataSourceId.typeId);
              }
            }
          })
          .map((it) => {
            if (it.imageList && it.imageList.length > 0 && !it.coverImage) {
              it.coverImage = it.imageList[0];
            }
            return it;
          })
          .filter((it) => !!it)
      );
    };

    const newCookies = await transform(fetchData.result.newCookies, fetchData.source.idStr);
    const allCookies = await transform(fetchData.result.allCookies, fetchData.source.idStr);
    allCookies
      .filter((it) => it.dataSource.startsWith('weibo:'))
      .forEach((it) => {
        if (it.coverImage) registerUrlToAddReferer(it.coverImage, 'https://m.weibo.cn/');
        if (it.imageList && it.imageList.length > 0) {
          it.imageList.forEach((src) => registerUrlToAddReferer(src, 'https://m.weibo.cn/'));
        }
      });

    const hasOldCardList = LocalCardMap[fetchData.source.idStr] && LocalCardMap[fetchData.source.idStr].length > 0;
    if (hasOldCardList && newCookies.length > 0) {
      DunInfo.cookieCount += newCookies.length;
      console.log('new cookies: ', newCookies);
      await new Promise((r) => AvailableDataSourceMeta.doAfterInit(r));
      tryNotice(AvailableDataSourceMeta.getById(fetchData.source.idStr), newCookies);
    }
    if (allCookies && allCookies.length > 0) {
      LocalCardMap[fetchData.source.idStr] = allCookies;
    }
    CardList.firstPageCookieList[configId] = Object.values(LocalCardMap)
      .reduce((acc, cur) => [...acc, ...cur], [])
      .sort((x, y) => {
        // 时间戳大的优先
        let ret = new Date(y.timeForSort).getTime() - new Date(x.timeForSort).getTime();
        if (ret === 0) {
          // 相同时间，则比较数据源
          ret = x.dataSource.localeCompare(y.dataSource);
        }
        if (ret === 0) {
          // 相同时间、数据源也相同，则根据id排序，id大的优先
          ret = y.id.localeCompare(x.id);
        }
        return ret;
      });
    CardList.sendUpdateAtNextTick();
  };

  static handleServerNotChange() {
    DunInfo.counter++;
    DunInfo.lastDunTime = Date.now();
  }

  static handleServerNull(configId) {
    DunInfo.counter++;
    DunInfo.lastDunTime = Date.now();
    CardList.firstPageCookieList[configId] = [];
    CardList.sendUpdateAtNextTick();
  }

  static async handleServer(configId, data) {
    const items = ServerUtil.transformCookieListToItemList(data.cookies);

    DunInfo.counter++;
    DunInfo.lastDunTime = Date.now();
    if (ServerCookieIdCache.size > 0) {
      const newCookies = items.filter((it) => !ServerCookieIdCache.has(it.id));
      DunInfo.cookieCount += newCookies.length;
      console.log('new cookies: ', newCookies);
      await new Promise((r) => AvailableDataSourceMeta.doAfterInit(r));
      const cookiesMap = newCookies.reduce((prev, current) => {
        if (!prev[current.dataSource]) {
          prev[current.dataSource] = [];
        }
        prev[current.dataSource].push(current);
        return prev;
      }, {});
      for (const entry of Object.entries(cookiesMap)) {
        try {
          tryNotice(AvailableDataSourceMeta.getById(entry[0]), entry[1]);
        } catch (e) {
          console.log(e);
        }
      }
    }

    items.forEach((it) => ServerCookieIdCache.add(it.id));

    CardList.firstPageCookieList[configId] = items;
    CardList.sendUpdateAtNextTick();
    await PlatformHelper.Storage.saveLocalStorage('server_cookie_list_next_page_id', data.next_page_id || '');
  }

  static resetLastServerList() {
    ServerCookieIdCache.clear();
  }
}

export { CookieHandler };
