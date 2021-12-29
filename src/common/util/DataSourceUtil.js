/**
 * 数据源工具类
 * <p>
 * 之所以弄一个工具类出来而不是直接放进DataSource是为了文件避免循环依赖
 */
import Settings from '../Settings';

class DataSourceUtil {

  /**
   * @param dataName {string}
   * @return {DataSource|undefined}
   */
  static getByName(dataName) {
    return Settings.currentDataSources[dataName];
  }

  /**
   * 将k-v结构的数据转换成按照优先级排序的list，用于分类显示的排序
   */
  static transformToSortList(data) {
    const list = [];
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        list.push({
          dataName: k,
          data: data[k]
        });
      }
    }
    list.sort((a, b) => {
      return DataSourceUtil.getByName(a.dataName).priority - DataSourceUtil.getByName(b.dataName).priority;
    });
    return list;
  }

  /**
   * 合并数据，可以将合并的数据进行排序(默认启用排序)
   */
  static mergeAllData(data, sort = true) {
    const result = Object.values(data)
      .reduce((acc, cur) => [...acc, ...cur], []);
    if (sort) {
      DataSourceUtil.sortData(result);
    }
    return result;
  }

  static sortData(data) {
    if (data) {
      data.sort((x, y) => {
        // 时间戳大的优先
        let ret = new Date(y.timeForSort).getTime() - new Date(x.timeForSort).getTime();
        if (ret === 0) {
          // 相同时间，则数据源优先级小的优先
          ret = DataSourceUtil.getByName(x.dataSource).priority - DataSourceUtil.getByName(y.dataSource).priority;
        }
        if (ret === 0) {
          // 相同时间、数据源优先级也相同，则根据id排序，id大的优先
          ret = y.id.localeCompare(x.id);
        }
        return ret;
      });
    }
    return data;
  }
}

export default DataSourceUtil;
