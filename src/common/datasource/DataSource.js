import HttpUtil from '../util/HttpUtil';
import {DEBUG_LOG} from '../Constants';
import DataSourceUtil from '../util/DataSourceUtil';
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
   */
  icon;
  /**
   * 关于dataType：<br/>
   * 用于代表一种数据源(比如微博、B站等)，每种数据源必须有一个唯一的dataType，不能重复<br/>
   * 实际值建议使用域名/品牌名等不易变化的值，有必要的话长一点也没关系<br/>
   * <strong>注意：子类需要用一个<code>static get typeName() {}</code>函数来定义类型数据源类型名称</strong>，
   *              实例化的时候会自动解析(使用静态是为了便于其它文件获取)<br/>
   * <strong>注意：dataType用于在储存中标识数据源类型，非必要请不要修改，修改后会导致数据解析错误。</strong>
   */
  dataType;
  /**
   * 数据名称(比如朝陇山，泰拉记事社等)，每个数据源必须有一个唯一的dataName，不能重复
   * <p>
   * <strong>注意：该字段用于在储存中标识数据源，非必要请不要修改，修改后会导致用户储存的(该数据源的)旧配置失效。</strong>
   */
  dataName;
  /**
   * 弹窗标题
   */
  title;
  /**
   * 优先级，用于在显示时排序，越小越靠前
   */
  priority;
  /**
   * 用于获取数据的URL，可以是string或array
   */
  dataUrl;

  constructor(icon, dataName, title, dataUrl, priority = 100) {
    this.icon = icon;
    this.dataName = dataName;
    this.dataType = this.constructor.typeName;
    this.title = title;
    this.dataUrl = dataUrl;
    this.priority = priority;
  }

  async fetchData() {
    let promise;
    if (typeof this.dataUrl === 'string') {
      promise = HttpUtil.GET(this.dataUrl);
    } else if (Array.isArray(this.dataUrl)) {
      promise = Promise.all(
        this.dataUrl.map(url => HttpUtil.GET(url))
      );
    } else {
      if (DEBUG_LOG) {
        console.log(`无效的dataUrl：${this.dataUrl}`);
      }
      return new Promise((_, reject) => {
        reject(this.dataUrl);
      });
    }
    const response = await promise;
    if (!response) {
      console.error(`${this.dataName}获取数据失败`);
      return null;
    }
    try {
      if (!this.tmp_cache) this.tmp_cache = [];
      this.tmp_cache.push(response);
      if (this.tmp_cache.length > 2) this.tmp_cache.shift();
      const data = await this.processData(response);
      return DataSourceUtil.sortData(data);
    } catch (e) {
      console.error(`数据源[${this.dataName}]解析失败：${e.message}`);
      return null;
    }
  }

  async processData(rawDataText) {
    console.error('未实现processData方法！');
  }

  /**
   * @return {Promise<UserInfo|null>}
   */
  static async getOrFetchUserInfo(uid, type) {
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

export {DataSource, UserInfo};
