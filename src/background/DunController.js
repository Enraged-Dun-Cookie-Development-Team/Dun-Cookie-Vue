/**
 * @file 蹲饼控制器
 */

import DunInfo from "../common/sync/DunInfo";
import CardList from "../common/sync/CardList";
import CurrentDataSource from "../common/sync/CurrentDataSource";
import Settings from "../common/Settings";
import {CookieFetcher, fetchLogCache} from "./CookieFetcher";

/**
 * 最后一次使用的sourceMap，用于判断是否需要重建CookieFetcher表
 * @type {{[key: string]: DataSource}}
 */
let lastSourceMap = {};
/**
 * 正在运行的fetchers，key是蹲饼器的ID
 * @type {{[key: string]: CookieFetcher}}
 */
let fetchers = {};

/**
 *
 * @param sourceMap {{[key: string]: DataSource}}
 */
function buildFetchers(sourceMap) {
  const newFetchers = {};
  Object.entries(sourceMap).forEach(([dataName, source]) => {
    const fetcherId = source.fetcherId || dataName;
    let fetcher = newFetchers[fetcherId];
    if (!fetcher) {
      fetcher = new CookieFetcher(fetcherId);
      newFetchers[fetcherId] = fetcher;
    }
    fetcher.addDataSource(source);
  });
  fetchers = Object.freeze(newFetchers);
  lastSourceMap = sourceMap;
}

/**
 * 蹲饼！ TODO 返回一个promise，全部解析完毕后resolve，用于给强制刷新提示完成
 */
function tryDun() {
  const sourceMap = CurrentDataSource.sourceMap;
  if (sourceMap !== lastSourceMap) {
    buildFetchers(sourceMap);
  }
  DunInfo.lastDunTime = new Date().getTime();
  const promiseList = [];
  for (const [_, fetcher] of Object.entries(fetchers)) {
    const promise = fetcher.fetchCookies()
      .finally(() => {
        DunInfo.counter++;
      });
    promiseList.push(promise);
  }
  Promise.allSettled(promiseList).then((values) => {
    DunInfo.roundCount++;
    const allCount = values.length;
    let successCount = 0;
    for (const value of values) {
      if (value.status === 'fulfilled') {
        successCount++;
      }
    }
    DebugUtil.debugLog(1, `===已完成第${DunInfo.roundCount}轮蹲饼，共${allCount}个蹲饼器，成功${successCount}个，失败${allCount - successCount}个===`)
  });
}

let dunTimeoutId = null;

/**
 * 启动蹲饼timer，会立刻请求一次然后按Settings.dun.intervalTime的值进行延时轮询
 */
function startDunTimer() {
  let delay = Settings.dun.intervalTime;
  // 低频模式
  if (Settings.checkLowFrequency()) {
    delay *= Settings.dun.timeOfLowFrequency;
  }
  // 数据源尚未准备好的时候0.5秒刷新一次
  if (Object.keys(CardList).length === 0 && Object.keys(CurrentDataSource.sourceMap).length === 0) {
    delay = 0.5;
  } else {
    try {
      tryDun();
    } catch (e) {
      console.error(e);
    }
  }
  dunTimeoutId = setTimeout(() => {
    startDunTimer();
  }, delay * 1000);
}


function restartDunTimer() {
  if (dunTimeoutId) {
    clearTimeout(dunTimeoutId);
    dunTimeoutId = null;
  }
  startDunTimer();
}

/**
 * 仅用于控制台调试
 */
class FetchUtils {
  all() {
    return fetchers;
  }
  getCache(fetcherId) {
    return fetchLogCache[fetcherId];
  }
  getAllCache() {
    return fetchLogCache;
  }
}

global.FetchUtils = new FetchUtils();

export {restartDunTimer, tryDun};
