/**
 * 数据源工具类
 * <p>
 * 之所以弄一个工具类出来而不是直接放进DataSource是为了文件避免循环依赖
 */
import {defaultDataSources} from '../datasource/DefaultDataSources';

class DataSourceUtil {

  static getByName(dataName) {
    return defaultDataSources[dataName];
  }
}

export default DataSourceUtil;
