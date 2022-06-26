import {distance} from "fastest-levenshtein";
import Settings from "../common/Settings";
import NotificationUtil from "../common/util/NotificationUtil";
import CardList from "../common/sync/CardList";
import DunInfo from "../common/sync/DunInfo";

/**
 * 最新推送的通知，用于避免不同平台的饼重复通知，每一项由[数据源的dataName, 删除空白字符的饼内容]组成
 * @type {[string, string][]}
 */
const lastCookiesCache = [];
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
    const rate = 1 - distance(cookieContent, data[1]) / Math.max(cookieContent.length,  data[1].length);
    if (rate > DUPLICATE_THRESHOLD) {
      return true;
    }
  }
  return false;
}

/**
 * 新饼推送通知
 * @param source {DataSource}
 * @param newCookieList {DataItem[]}
 * @private
 */
function tryNotice(source, newCookieList) {
  if (!Settings.dun.enableNotice) {
    return;
  }
  for (const cookie of newCookieList) {
    const cookieContent = cookie.content.replace(/\s/g, "");
    // 启用了推送重复饼，或者没启用且饼不是重复的，则进行推送
    if (Settings.dun.repetitionPush || !isDuplicateCookie(source.dataName, cookieContent)) {
      NotificationUtil.SendNotice(`小刻在【${source.title}】里面找到了一个饼！`, cookieContent, cookie.coverImage, cookie.id);
    }
    lastCookiesCache.push([source.dataName, cookieContent]);
    if (lastCookiesCache.length > DUPLICATE_CHECK_COUNT) {
      lastCookiesCache.shift();
    }
  }
}

/**
 * 蹲饼处理器
 */
class CookieHandler {

  /**
   *
   * @param source {DataSource}
   * @param fetchResult {FetchResult}
   */
  static handle(source, fetchResult) {
    const {newCookies, allCookies} = fetchResult;
    const hasOldCardList = CardList[source.dataName] && CardList[source.dataName].length > 0;
    if (hasOldCardList && newCookies.length > 0) {
      DunInfo.cookieCount += newCookies.length;
      console.log("new cookies: ", newCookies);
      tryNotice(source, newCookies);
    }
    if (allCookies && allCookies.length > 0) {
      CardList[source.dataName] = allCookies;
    }
  }
}

export {CookieHandler};
