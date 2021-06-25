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

  /**
   * 合并数据，可以将合并的数据进行排序(默认启用排序)
   */
  static mergeAllData(data, sort = true) {
    const result = Object.values(data)
      .reduce((acc, cur) => [...acc, ...cur], []);
    if (sort) {
      result.sort((x, y) => {
        // 时间戳大的优先
        let ret = new Date(y.timeForSort).getTime() - new Date(x.timeForSort).getTime();
        if (ret === 0) {
          // 相同时间，则数据源优先级小的优先
          ret = DataSourceUtil.getByName(x.dataSource).priority - DataSourceUtil.getByName(y.dataSource).priority;
        }
        if (ret === 0) {
          // 相同时间、数据源优先级也相同，则根据id排序，id小的优先
          ret = x.id.localeCompare(y.id);
        }
        return ret;
      });
    }
    return result;
  }
}

export default DataSourceUtil;
