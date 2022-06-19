import HttpUtil from '../util/HttpUtil';
import DataSourceUtil from '../util/DataSourceUtil';
import DebugUtil from '../util/DebugUtil';
import PlatformHelper from '../platform/PlatformHelper';

/**
 * 表示一个数据源
 * <p>
 *
 * <strong>注意：子类需要定义一个<code>static get typeName() {}</code>函数，详情参考dataType的注释</strong>
 * @see dataType
 */
class DataSource {
  /**
   * 用于在设置页面中显示的图标
   * @type {string}
   */
  icon;
  /**
   * 关于dataType：<br/>
   * 用于代表一种数据源(比如微博、B站等)，每种数据源必须有一个唯一的dataType，不能重复<br/>
   * 实际值建议使用域名/品牌名等不易变化的值，有必要的话长一点也没关系<br/>
   * <strong>注意：子类需要用一个<code>static get typeName() {}</code>函数来定义类型数据源类型名称</strong>，
   *              实例化的时候会自动解析(使用静态是为了便于其它文件获取)<br/>
   * <strong>注意：dataType用于在储存中标识数据源类型，非必要请不要修改，修改后会导致数据解析错误。</strong>
   * @type {string}
   */
  dataType;
  /**
   * 数据名称(比如朝陇山，泰拉记事社等)，每个数据源必须有一个唯一的dataName，不能重复
   * <p>
   * <strong>注意：该字段用于在储存中标识数据源，非必要请不要修改，修改后会导致用户储存的(该数据源的)旧配置失效。</strong>
   * @type {string}
   */
  dataName;
  /**
   * 指定蹲饼器ID，使用相同的蹲饼器ID的数据源将共用一个蹲饼器
   * <p>
   * 不指定的话将自动使用dataName作为ID
   * @type {string|undefined}
   */
  fetcherId;
  /**
   * 弹窗标题
   * @type {string}
   */
  title;
  /**
   * 优先级，用于在显示时排序，越小越靠前
   * @type {number}
   */
  priority;
  /**
   * 用于获取数据的URL，可以是string或array
   * @type {string|string[]}
   */
  dataUrl;


  /**
   * 缓存旧饼ID
   * @type {{[key: string]: boolean}}
   * @private
   */
  _cookieIdCache = {};

  /**
   * @param config {DataSourceConfig} 数据源配置
   */
  constructor(config) {
    this.icon = config.icon;
    this.dataName = config.dataName;
    this.dataType = this.constructor.typeName;
    this.fetcherId = config.fetcherId;
    this.title = config.title;
    this.dataUrl = config.dataUrl;
    this.priority = config.priority;
    // 避免私有属性被json序列化传递
    Object.defineProperty(this, '_cookieIdCache', {
      enumerable: false
    });
  }

  /**
   * 从数据源获取并解析数据
   * @return {Promise<FetchResult>}
   */
  async fetchData() {
    let promise;
    if (typeof this.dataUrl === 'string') {
      promise = HttpUtil.GET(this.dataUrl);
    } else if (Array.isArray(this.dataUrl)) {
      promise = Promise.all(
        this.dataUrl.map(url => HttpUtil.GET(url))
      );
    } else {
      throw new Error(`数据源[${this.dataName}]的dataUrl无效：${this.dataUrl}`);
    }
    const response = await promise;
    if (!response) {
      throw new Error(`数据源[${this.dataName}]获取数据失败`);
    }
    const data = await this.processData(response);
    if (!data) {
      DebugUtil.debugLog(1, `数据源[${this.dataName}]获取的原始数据`, response);
      throw new Error(`数据源[${this.dataName}]解析结果为空`);
    }
    try {
      const allCookies = DataSourceUtil.sortData(data);
      const newCookies = this._filterNewCookie(allCookies);
      return new FetchResult(allCookies, newCookies);
    } catch (e) {
      console.warn(`处理数据源[${this.dataName}]的解析结果时发生异常：${e.message}`);
      throw e;
    }
  }

  /**
   * 从饼列表中筛选出新饼(该方法不是幂等的，每次调用都会记录参数提供的饼，下次调用的时候这些就是旧饼了)
   * @param cardList
   * @private
   */
  _filterNewCookie(cardList) {
    const newCookieList = [];
    for (const cookie of cardList) {
      if (!this._cookieIdCache[cookie.id]) {
        newCookieList.push(cookie);
      }
      this._cookieIdCache[cookie.id] = true;
    }
    return newCookieList;
  }

  async processData(rawDataText) {
    console.error(`数据源[${this.dataName}]未实现processData方法！`);
  }

  /**
   * @return {Promise<UserInfo|null>}
   */
  static async getOrFetchUserInfo(uid, type) {
    try {
      const cacheKey = "cache_" + type.typeName + '_' + uid;
      let data = await PlatformHelper.Storage.getLocalStorage(cacheKey);
      if (!data) {
        data = await type.fetchUserInfo(uid);
      }
      if (!data) {
        return null;
      }
      await PlatformHelper.Storage.saveLocalStorage(cacheKey, data);
      return data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

}

/**
 * 数据源配置
 */
class DataSourceConfig {
  /**
   * @type {string}
   * @see DataSource.icon
   */
  icon;
  /**
   * @type {string}
   * @see DataSource.dataName
   */
  dataName;
  /**
   * @type {string}
   * @see DataSource.title
   */
  title;
  /**
   * @type {string|string[]}
   * @see DataSource.dataUrl
   */
  dataUrl;
  /**
   * 优先级默认100
   * @type {number}
   * @see DataSource.priority
   */
  priority = 100;
  /**
   * @type {string|undefined}
   * @see DataSource.fetcherId
   */
  fetcherId;


  static builder() {
    const instance = new DataSourceConfig();
    // 其实这里用反射生成应该可读性更强一些，但是只有明确写出来IDE才能识别并自动补全
    const _builder = {
      /**
       * @param val {string}
       * @see DataSource.icon
       */
      icon: (val) => {
        instance.icon = val;
        return _builder;
      },
      /**
       * @param val {string}
       * @see DataSource.dataName
       */
      dataName: (val) => {
        instance.dataName = val;
        return _builder;
      },
      /**
       * @param val {string}
       * @see DataSource.title
       */
      title: (val) => {
        instance.title = val;
        return _builder;
      },
      /**
       * @param val {string}
       * @see DataSource.dataUrl
       */
      dataUrl: (val) => {
        instance.dataUrl = val;
        return _builder;
      },
      /**
       * @param val {number}
       * @see DataSource.priority
       */
      priority: (val) => {
        instance.priority = val;
        return _builder;
      },
      /**
       * @param val {string}
       * @see DataSource.fetcherId
       */
      fetcherId: (val) => {
        instance.fetcherId = val;
        return _builder;
      },
      build: () => instance,
    };
    return _builder;
  }
}

class UserInfo {
  dataName;
  username;
  avatarUrl;
  version = 1;
  timestamp;

  constructor(dataName, username, avatarUrl) {
    this.dataName = dataName;
    this.username = username;
    this.avatarUrl = avatarUrl;
    this.timestamp = new Date().getTime();
  }
}

/**
 * 蹲饼结果
 */
class FetchResult {
  /**
   * 本次蹲到的所有饼(包括旧饼)，顺序为从新到旧
   * @type {DataItem[]}
   */
  allCookies;
  /**
   * 本次蹲到的新饼，顺序为从新到旧
   * @type {DataItem[]}
   */
  newCookies;

  /**
   * 两个参数都要求从新到旧排序
   * @param allCookies {DataItem[]} 本次蹲到的所有饼(包括旧饼)
   * @param newCookies {DataItem[]} 本次蹲到的新饼
   */
  constructor(allCookies, newCookies) {
    this.allCookies = allCookies;
    this.newCookies = newCookies;
  }
}


export {DataSource, DataSourceConfig, UserInfo, FetchResult};
