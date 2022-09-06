/**
 * @file 蹲饼控制器
 */

import DunInfo from "../common/sync/DunInfo";
import CardList from "../common/sync/CardList";
import CurrentDataSource from "../common/sync/CurrentDataSource";
import Settings from "../common/Settings";
import {CookieFetcher, fetchLogCache} from "./CookieFetcher";

class FetcherScheduleInfo {
  /**
   * @type {CookieFetcher}
   */
  fetcher;

  /**
   * 不可修改的蹲饼间隔
   * @type {number}
   */
  intervalTime;

  /**
   * 下一次蹲饼的时间
   * @type {number}
   */
  nextScheduleTime = 0;

  constructor(fetcher, intervalTime) {
    this.fetcher = fetcher;
    this.intervalTime = intervalTime;
    Object.defineProperty(this, 'fetcher', {
      configurable: false,
      writable: false,
    });
    Object.defineProperty(this, 'intervalTime', {
      configurable: false,
      writable: false,
    });
  }

  /**
   * 更新下次蹲饼时间并返回
   * @returns {number} 下次蹲饼时间
   */
  updateNextScheduleTime() {
    this.nextScheduleTime += this.intervalTime;
    return this.nextScheduleTime;
  }
}

/**
 * 最后一次使用的sourceMap，用于判断是否需要重建fetchers
 * @type {{[key: string]: DataSource}}
 */
let lastSourceMap = {};
/**
 * 最后一次使用的intervalTime，用于判断是否需要重建fetcherSchedule
 * @type {number}
 */
let lastIntervalTime = -1;


// TODO 生成新的fetch表或者schedule表时可以根据旧信息来定义新表的轮询起始时间
//  目的是解决重新配置前刚好有一堆请求 然后重新配置后又来一堆请求 导致被ban的情况。
//  由于重新配置是一个很少发生的情况，所以该功能优先级较低

/**
 * 正在运行的fetchers，key是蹲饼器的ID
 * @type {{[key: string]: CookieFetcher}}
 */
let fetchers = {};
/**
 * fetcher的轮询时间安排表
 * @type {FetcherScheduleInfo[]}
 */
let fetcherSchedule = [];

/**
 * @param schedule  {FetcherScheduleInfo[]}
 */
function sortFetcherSchedule(schedule) {
  schedule.sort((a, b) => a.nextScheduleTime - b.nextScheduleTime);
}

/**
 * @param sourceMap {{[key: string]: DataSource}}
 */
function buildFetchers(sourceMap) {
  const newFetchers = {};
  Object.entries(sourceMap).forEach(([dataName, source]) => {
    const fetcherId = `${source.dataType.typeName}:${source.groupId || dataName}`;
    let fetcher = newFetchers[fetcherId];
    if (!fetcher) {
      fetcher = new CookieFetcher(fetcherId, source.dataType);
      newFetchers[fetcherId] = fetcher;
    }
    fetcher.addDataSource(source);
  });
  fetchers = Object.freeze(newFetchers);
  lastSourceMap = sourceMap;
}

/**
 * @param {number} globalIntervalTime 用户设置的全局蹲饼时间
 */
function buildFetcherSchedule(globalIntervalTime) {
  /**
   * @type {{[key: string]: CookieFetcher[]}}
   */
  const fetchersGroupByType = {};
  Object.values(fetchers).forEach(f => {
    let list = fetchersGroupByType[f.sourceType.typeName];
    if (!list) {
      list = [];
      fetchersGroupByType[f.sourceType.typeName] = list;
    }
    list.push(f);
  });
  // 使用整秒，这样日志里记的timestamp可能会更好看一些，然后
  const startTime = Math.ceil(new Date().getTime() / 1000) * 1000;
  /**
   * @type {[string, FetcherScheduleInfo[]][]}
   */
  const scheduleByGroup = Object.entries(fetchersGroupByType).map(([groupKey, list]) => {
    const type = list[0].sourceType;
    /**
     * @type {[CookieFetcher, number]} 蹲饼分组，组内数据源数量
     */
    const listWithCount = list.map(f => [f, f.dataSourceCount]);
    // TODO 这部分变量名看似无意义，
    //  实际上是引用 https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue/wiki/蹲饼器策略 中的文档的变量名
    const G = list.length;
    const C = type.requestFrequencyLimit;
    const M = globalIntervalTime;
    const N = listWithCount.map(val => val[1]).reduce((prev, current) => prev + current, 0);
    const X = M / C;
    const Y = M / N;
    const Z = M / G;
    /**
     * @type {CookieFetcher[]}
     */
    let finalList;
    let finalIntervalTime;
    if (X >= N) {
      finalList = listWithCount.flatMap(([f, c]) => Array(c).fill(f));
      finalIntervalTime = M;
    } else if (X >= G) {
      let count = N;
      let idx = 0;
      // 默认一轮内数据源全都蹲一遍，判断一轮蹲的次数是否大于可接受数量
      while (count > X) {
        // 减少组内有复数的蹲饼组单轮蹲的数量
        if (listWithCount[idx][1] > 1) {
          listWithCount[idx][1]--;
          count--;
        }
        idx++;
        // 返回第一组蹲饼组重新计算
        if (idx >= listWithCount.length) {
          idx = 0;
        }
      }
      finalList = listWithCount.flatMap(([f, c]) => Array(c).fill(f));
      finalIntervalTime = M;
    } else {
      /**
       * @type {number} 强制蹲饼频率，平台最小蹲饼间隔*组数量
       */
      const B = C * G;
      finalList = listWithCount.map(([f]) => f);
      finalIntervalTime = B;
    }
    /**
     * @type {FetcherScheduleInfo[]}
     */
    const scheduleList = [];
    let initNextTime = startTime;
    finalList.forEach((f) => {
      const info = new FetcherScheduleInfo(f, finalIntervalTime);
      info.nextScheduleTime = initNextTime;   // 赋值这个调度器初始开始蹲饼时间
      scheduleList.push(info);
      initNextTime += finalIntervalTime;      // 用于计算下个调度器开始时间
    });
    return [groupKey, scheduleList];
  });
  /**
   * @type {FetcherScheduleInfo[]}
   */
  const finalFetcherSchedule = [];
  scheduleByGroup.forEach(([_, list]) => {
    finalFetcherSchedule.push(...list);
  });
  sortFetcherSchedule(finalFetcherSchedule);
  fetcherSchedule = finalFetcherSchedule;
}

/**
 * 蹲饼！
 * @param {boolean} force 强制手动刷新
 * @return {Promise}
 */
function tryDun(force = false) {
  DunInfo.lastDunTime = new Date().getTime();
  const promiseList = [];
  const currentTime = new Date().getTime();
  for (const schedule of fetcherSchedule) {
    if (force || schedule.nextScheduleTime >= currentTime) {
      const promise = schedule.fetcher.fetchCookies()
        .finally(() => {
          DunInfo.counter++;
          schedule.updateNextScheduleTime();
        });
      promiseList.push(promise);
    }
  }
  return Promise.allSettled(promiseList).then((values) => {
    DunInfo.roundCount++;
    const allCount = values.length;
    let successCount = 0;
    for (const value of values) {
      if (value.status === 'fulfilled') {
        successCount++;
      }
    }
    sortFetcherSchedule(fetcherSchedule);
    DebugUtil.debugLog(1, `===已完成第${DunInfo.roundCount}轮蹲饼${force ? '(本轮为手动强制刷新)' : ''}，共${allCount}个蹲饼器，成功${successCount}个，失败${allCount - successCount}个===`);
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
      const sourceMap = CurrentDataSource.sourceMap;
      let intervalTime = delay;
      if (sourceMap !== lastSourceMap) {
        buildFetchers(sourceMap);
        buildFetcherSchedule(intervalTime);
      } else if (intervalTime !== lastIntervalTime) {
        buildFetcherSchedule(intervalTime);
      }
      // noinspection JSIgnoredPromiseFromCall
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
  getLog(fetcherId) {
    return fetchLogCache[fetcherId];
  }
  getAllLog() {
    return fetchLogCache;
  }
}

global.FetchUtils = new FetchUtils();

export {restartDunTimer, tryDun};
