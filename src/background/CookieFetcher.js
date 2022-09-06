import {CookieHandler} from "./CookieHandler";
import {IS_DEBUG} from "../common/Constants";

/**
 * 蹲饼日志缓存，用于分析问题
 * @type {{[key: string]: FetchLogItem[]}}
 */
const fetchLogCache = {};

/**
 * 蹲饼器
 */
class CookieFetcher {
  /**
   * 蹲饼器ID
   */
  id;

  /**
   * 数据源类型
   * @type {DataSourceTypeInfo}
   */
  sourceType;

  /**
   * 数据源列表
   * @type Array<DataSource>
   */
  sourceList = [];

  /**
   * 下一次蹲饼的数据源索引
   * @type {number}
   * @private
   */
  _index = -1;

  /**
   * @param id {string} 蹲饼器ID
   * @param sourceType {DataSourceTypeInfo} 数据源类型
   */
  constructor(id, sourceType) {
    this.id = id;
    this.sourceType = sourceType;
  }

  /**
   * 添加数据源
   * @param source {DataSource} 要添加的数据源
   */
  addDataSource(source) {
    if (source.dataType !== this.sourceType) {
      DebugUtil.debugLogError(0, `[${source.dataType.typeName}]类型的数据源[${source.dataName}]`
        + `被尝试加入到[${this.sourceType.typeName}]类型的蹲饼分组中，已禁止本次加入`);
      return;
    }
    this.sourceList.push(source);
  }

  get dataSourceCount() {
    return this.sourceList.length;
  }

  /**
   *
   * @returns {Promise<FetchResult>}
   */
  fetchCookies() {
    const source = this._nextDataSource();
    const startTime = new Date().getTime();
    return source.fetchData()
      .then((fetchResult) => {
        if (IS_DEBUG) {
          this._debugLogSuccess(startTime, source, fetchResult);
        }
        CookieHandler.handle(source, fetchResult);
        return fetchResult;
      }, (reason) => {
        this._logFail(startTime, source, reason);
        // 重新抛出异常，让上层调用方能感知到异常
        throw reason;
      });
  }

  /**
   * 获取下一个数据源，会在数据源列表中自动循环获取
   * @returns {DataSource}
   * @private
   */
  _nextDataSource() {
    this._index++;
    if (this._index >= this.sourceList.length) {
      this._index = 0;
    }
    const source = this.sourceList[this._index];
    return source;
  }

  /**
   * @param startTime {number}
   * @param source {DataSource}
   * @param fetchResult {FetchResult}
   * @private
   */
  _debugLogSuccess(startTime, source, fetchResult) {
    const endTime = new Date().getTime();
    let cache = fetchLogCache[this.id];
    if (!cache) {
      cache = [];
      fetchLogCache[this.id] = cache;
    }
    cache.push(new FetchLogItem(true, startTime, endTime - startTime, source, fetchResult, null));
    DebugUtil.debugLog(5, `[${this.id}]成功获取数据：`, {
      dataName: source.dataName,
      dataType: source.dataType.typeName,
      fetchResult: fetchResult
    });
  }

  /**
   * @param startTime {number}
   * @param source {DataSource}
   * @param reason
   * @private
   */
  _logFail(startTime, source, reason) {
    if (IS_DEBUG) {
      const endTime = new Date().getTime();
      let cache = fetchLogCache[this.id];
      if (!cache) {
        cache = [];
        fetchLogCache[this.id] = cache;
      }
      cache.push(new FetchLogItem(false, startTime, endTime - startTime, source, null, reason));
    }
    DebugUtil.debugLogError(0, `[${this.id}]获取数据失败：`, {
      dataName: source.dataName,
      dataType: source.dataType.typeName,
      reason: reason
    });
  }
}

class FetchLogItem {
  /**
   * 是否蹲饼成功
   */
  success;
  /**
   * 蹲饼时间(Unix时间戳)
   */
  fetchTime;
  /**
   * 蹲饼消耗的时间(单位：毫秒)
   */
  fetchTimeConsumed;
  /**
   * 数据源名称
   */
  dataName;
  /**
   * 数据源
   */
  source;
  /**
   * 蹲饼结果，当且仅当success为true时有值
   */
  fetchResult;
  /**
   * 失败原因，当且仅当success为false时有值
   */
  failReason;

  constructor(success, fetchTime, fetchTimeConsumed, source, fetchResult, failReason) {
    this.success = success;
    this.fetchTime = fetchTime;
    this.fetchTimeConsumed = fetchTimeConsumed;
    this.dataName = source.dataName;
    this.source = source;
    this.fetchResult = fetchResult;
    this.failReason = failReason;
    Object.freeze(this);
  }
}

export {CookieFetcher, fetchLogCache}
