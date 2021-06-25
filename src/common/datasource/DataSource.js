import HttpUtil from '../util/HttpUtil';
import {DEBUG_LOG} from '../Constants';

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
   * 用于代表一个数据源(比如官网、朝陇山，泰拉记事社等)，每个数据源必须有一个唯一的dataType，不能重复<br/>
   * 实际值建议使用域名/品牌名等不易变化的值，有必要的话长一点也没关系<br/>
   * <strong>注意：子类需要用一个<code>static get typeName() {}</code>函数来定义类型数据源类型名称</strong>，
   *              实例化的时候会自动解析(使用静态是为了便于其它文件获取)<br/>
   * <strong>注意：dataType用于在储存中标识数据源类型，非必要请不要修改，否则会导致数据解析错误。</strong>
   */
  get dataType() {
    return this.constructor.typeName;
  };
  /**
   * 数据名称(比如朝陇山，泰拉记事社等)，每个数据源必须有一个唯一的dataName，不能重复
   * <p>
   * <strong>注意：该字段用于在储存中标识数据源，非必要请不要修改，否则会导致用户储存的(该数据源的)旧配置失效。</strong>
   */
  dataName;
  /**
   * 弹窗标题
   */
  title;
  /**
   * 旧的判断数据源的字段
   * TODO 重构后应该不需要该字段，改为使用dataName判断(考虑将这个字段改为priority用来控制在设置页面的显示顺序)
   */
  source;

  /**
   * 用于获取数据的URL，可以是string或array
   */
  dataUrl;

  constructor(icon, dataName, title, dataUrl, source) {
    this.icon = icon;
    this.dataName = dataName;
    this.title = title;
    this.dataUrl = dataUrl;
    this.source = source;
  }

  fetchData() {
    let promise;
    if (typeof this.dataUrl === 'string') {
      promise = HttpUtil.GET(this.__appendTimeStamp(this.dataUrl));
    } else if (Array.isArray(this.dataUrl)) {
      promise = Promise.all(
        this.dataUrl.map(url =>
          HttpUtil.GET(this.__appendTimeStamp(url))
        )
      );
    } else {
      if (DEBUG_LOG) {
        console.log(`无效的dataUrl：${this.dataUrl}`);
      }
      return new Promise((_, reject) => {
        reject(this.dataUrl)
      });
    }
    return promise.then(value => {
      let opt = {
        dataName: this.dataName, // 数据源名称
        responseText: value,
      };
      const data = this.processData(opt);
      return data.sort((a, b) => {
        let ret = a.timeForSort - b.timeForSort
        if (ret === 0) {
          ret = a.content.localeCompare(b.content);
        }
        return ret;
      });
    });
  }

  processData(opt) {
    console.error('未实现processData方法！');
  }

  __appendTimeStamp(url) {
    // 此处是为了兼容有queryString的url和没有queryString的url，用?判断应该大概没问题吧
    if (url.indexOf('?') >= 0) {
      return `${url}&t=${new Date().getTime()}`;
    } else {
      return `${url}?t=${new Date().getTime()}`;
    }
  }
}

export {DataSource};
