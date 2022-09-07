import {createSyncData, DataSyncMode} from "./SyncData";

class CurrentDataSource {

  /**
   * 数据源表，是一个被Object.freeze冻结的对象
   * @type {{[key: string]: DataSource} & Object}
   */
  get sourceMap() {
    return this._sourceMap;
  }
  /**
   * @type {{[key: string]: DataSource} & Object}
   */
  _sourceMap = Object.freeze({});


  /**
   * 设置新数据源表
   * @param newSourceMap {{[key: string]: DataSource}}
   */
  setSourceMap(newSourceMap) {
    if (!PlatformHelper.isBackground) {
      throw new Error("仅允许后台调用");
    }
    this._sourceMap = Object.assign({}, newSourceMap);
    Object.freeze(this._sourceMap);
  }

  /**
   * @param dataName {string}
   * @returns {DataSource}
   */
  getByName(dataName) {
    return this._sourceMap[dataName];
  }
}

function updateHandler(target, data, changed) {
  if (data._sourceMap && typeof data._sourceMap === "object") {
    target._sourceMap = Object.freeze(data._sourceMap);
    changed._sourceMap = true;
  }
}

/**
 * @type {CurrentDataSource & CanSync}
 */
const instance = createSyncData(new CurrentDataSource(), 'currentDataSource', DataSyncMode.ONLY_BACKGROUND_WRITABLE, false, updateHandler);
export default instance;

