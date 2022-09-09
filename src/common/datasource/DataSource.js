import HttpUtil from '../util/HttpUtil';
import DataSourceUtil from '../util/DataSourceUtil';
import DebugUtil from '../util/DebugUtil';
import PlatformHelper from '../platform/PlatformHelper';

/**
 * 这个类型提示用any是因为他类型识别有问题，用Function会提示错误，数组的0号位置应当是数据源的constructor
 * @type {{[key: string]: [any, DataSourceTypeInfo]}}
 */
const dataTypeCache = {};

/**
 * 表示一个数据源
 * <p>
 *
 * <strong>注意：子类需要定义一个<code>static get typeInfo() {}</code>函数，详情参考dataType的注释</strong>
 * @see dataType
 */
class DataSource {
  /**
   * 用于在设置页面中显示的图标
   * @type {string}
   */
  icon;
  /**
   * 数据源类型信息，详细说明参考{@link DataSourceTypeInfo}中各个字段的信息
   * <strong>注意：子类需要用一个<code>static get typeInfo() {}</code>函数来定义类型数据源类型信息，且应当是单例的</strong>，
   *              实例化的时候会自动解析(使用静态是为了便于其它文件获取)<br/>
   * @type {DataSourceTypeInfo}
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
   * 指定分组ID，使用相同的分组ID的数据源将共用一个蹲饼器
   * <p>
   * 不指定的话将自动使用dataName作为分组ID<br>
   * <strong>注意：具体的蹲饼策略中只有相同类型的数据源会作为同一组进行轮换蹲饼，不同类型的同名分组在内部实现上会被拆分成不同的蹲饼组</strong>
   * @type {string|undefined}
   */
  groupId;
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
    this.dataType = this.constructor.typeInfo;
    this._verifyTypeInfo();
    this.groupId = config.groupId;
    this.title = config.title;
    this.dataUrl = config.dataUrl;
    this.priority = config.priority;
    // 避免私有属性被json序列化传递
    Object.defineProperty(this, '_cookieIdCache', {
      enumerable: false,
    });
  }

  /**
   * @private
   */
  _verifyTypeInfo() {
    if (!this.dataType || this.dataType.constructor !== DataSourceTypeInfo) {
      DebugUtil.debugLogError(0, `子类未定义静态typeInfo方法`, this);
    }
    if (dataTypeCache[this.dataType.typeName]) {
      if (this.constructor !== dataTypeCache[this.dataType.typeName][0]) {
        DebugUtil.debugLogError(0, `${this.dataType.typeName}的typeName可能有重复，这可能会导致数据源识别异常`, this);
      }
      if (this.dataType !== dataTypeCache[this.dataType.typeName][1]) {
        DebugUtil.debugLogWarn(0, `${this.dataType.typeName}的typeInfo方法返回的不是单例`, this);
      }
    } else {
      dataTypeCache[this.dataType.typeName] = [this.constructor, this.dataType];
    }
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
      promise = Promise.all(this.dataUrl.map((url) => HttpUtil.GET(url)));
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
      return new FetchResult(response, allCookies, newCookies);
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

  /**
   * @param rawDataText {string}
   * @returns {Promise<DataItem[]>}
   */
  async processData(rawDataText) {
    console.error(`数据源[${this.dataName}]未实现processData方法！`);
  }

  /**
   * @return {Promise<UserInfo|null>}
   */
  static async getOrFetchUserInfo(uid, type) {
    try {
      const cacheKey = 'cache_' + type.typeInfo.typeName + '_' + uid;
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

class DataSourceTypeInfo {
  /**
   * 关于typeName：<br/>
   * 用于代表一种数据源(比如微博、B站等)，每种数据源必须有一个唯一的typeName，不能重复<br/>
   * 实际值建议使用域名/品牌名等不易变化的值，有必要的话长一点也没关系<br/>
   * <strong>注意：typeName用于在储存中标识数据源类型，非必要请不要修改，修改后会导致数据解析错误。</strong>
   * @type {string}
   */
  typeName;
  /**
   * 当前数据源类型的多个数据源对象的请求频率限制，当值不是正数时视为无限制，单位：毫秒
   * @type {number|undefined}
   */
  requestFrequencyLimit;

  /**
   *
   * @param typeName {string}
   * @param requestFrequencyLimit {number|undefined}
   */
  constructor(typeName, requestFrequencyLimit = undefined) {
    this.typeName = typeName;
    this.requestFrequencyLimit = requestFrequencyLimit;
    Object.freeze(this);
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
   * @see DataSource.groupId
   */
  groupId;

  /**
   * @returns {DataSourceConfigBuilder}
   */
  static builder() {
    return new DataSourceConfigBuilder();
  }
}

/**
 * 虽然这些方法直接放在DataSourceConfig里面链式调用，而不使用builder也是可行的，但是语义上感觉不太合适，
 * 用builder可以体现出config尚未准备好的语义
 */
class DataSourceConfigBuilder {
  /**
   * @type {DataSourceConfig}
   */
  _instance = new DataSourceConfig();

  /**
   * @param val {string}
   * @returns {DataSourceConfigBuilder}
   * @see DataSource.icon
   */
  icon(val) {
    this._instance.icon = val;
    return this;
  }

  /**
   * @param val {string}
   * @returns {DataSourceConfigBuilder}
   * @see DataSource.dataName
   */
  dataName(val) {
    this._instance.dataName = val;
    return this;
  }

  /**
   * @param val {string}
   * @returns {DataSourceConfigBuilder}
   * @see DataSource.title
   */
  title(val) {
    this._instance.title = val;
    return this;
  }

  /**
   * @param val {string}
   * @returns {DataSourceConfigBuilder}
   * @see DataSource.dataUrl
   */
  dataUrl(val) {
    this._instance.dataUrl = val;
    return this;
  }

  /**
   * @param val {number}
   * @returns {DataSourceConfigBuilder}
   * @see DataSource.priority
   */
  priority(val) {
    this._instance.priority = val;
    return this;
  }

  /**
   * @param val {string}
   * @returns {DataSourceConfigBuilder}
   * @see DataSource.groupId
   */
  groupId(val) {
    this._instance.groupId = val;
    return this;
  }

  build() {
    return this._instance;
  }
}

class UserInfo {
  username;
  avatarUrl;
  version = 1;
  timestamp;

  constructor(username, avatarUrl) {
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
   * 本次蹲到的饼的原始数据
   * @type {string|string[]}
   */
  rawContent;
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
   * @param rawContent {string|string[]} 本次蹲到的饼的原始数据
   * @param allCookies {DataItem[]} 本次蹲到的所有饼(包括旧饼)
   * @param newCookies {DataItem[]} 本次蹲到的新饼
   */
  constructor(rawContent, allCookies, newCookies) {
    this.rawContent = rawContent;
    this.allCookies = allCookies;
    this.newCookies = newCookies;
    Object.freeze(this);
  }
}

export { DataSource, DataSourceTypeInfo, DataSourceConfig, UserInfo, FetchResult };
