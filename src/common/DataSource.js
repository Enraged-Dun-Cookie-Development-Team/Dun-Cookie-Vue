import HttpUtil from './HttpUtil';
import {DEBUG_LOG} from './Constants';

/**
 * 表示一个数据源
 */
class DataSource {
  /**
   * 用于在设置页面中显示的图标
   */
  icon;
  /**
   * 数据名称(比如朝陇山，泰拉记事社等)，每个数据源必须有一个唯一的dataName，不能重复
   * <p>
   * <strong>注意：该字段用于在储存中标识数据源，请不要修改，否则会导致用户储存的(该数据源的)旧配置失效</strong>
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
        url: this.dataUrl,//网址
        title: this.title,//弹窗标题
        dataName: this.dataName,//数据源对象名称
        source: this.source,
        responseText: value,
      };
      return this.processData(opt);
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
