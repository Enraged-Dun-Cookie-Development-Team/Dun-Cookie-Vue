export class DataSourceMeta {
  /**
   * 数据源类型，用于一些数据源识别用途
   */
  type;
  /**
   * 数据源的数据id，具体的id格式取决于数据源，要求必须是string，数字id也要转换成string处理
   */
  dataId;
  /**
   * 数据源名称，用于显示
   */
  name;
  /**
   * 数据源图标，用于显示
   */
  icon;

  /**
   * @param meta {DataSourceMeta}
   * @return {string}
   */
  static id(meta) {
    return `${meta.type}:${meta.dataId}`;
  }
}
