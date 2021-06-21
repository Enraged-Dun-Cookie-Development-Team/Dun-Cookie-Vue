class DataItem {
  /**
   * 时间 【必填】
   */
  time;
  /**
   * 弹窗id 微博B站用时间戳，其他的内容用他们自己的ID 【必填】
   */
  id;
  /**
   * 条目来源 【必填】
   */
  source;
  /**
   * 判定字段 微博B站用时间 鹰角用id 【必填】
   */
  judgment;
  /**
   * 处理后内容 用于展示 微博把<br / >替换成 /r/n 后期统一处理 【必填】
   */
  dynamicInfo;
  /**
   * 处理前内容 原始字段
   */
  html;
  /**
   * 获取到的图片
   */
  image;
  /**
   * 获取到的图片list
   */
  imagelist;
  /**
   * 当前条目的类型
   */
  type;
  /**
   * 跳转后连接 【必填】
   */
  url;
  /**
   * 详情列表，以后进入二级页面使用
   */
  detail;
  /**
   * 在列表中是否为置顶内容 仅限微博
   */
  isTop;
  /**
   * 转发的内容
   */
  retweeted;
}

class RetweetedInfo {
  /**
   * 被转发内容的原作者
   * @type {string}
   */
  name;
  /**
   * 被转发的内容
   */
  dynamicInfo;

  constructor(name, dynamicInfo) {
    this.name = name;
    this.dynamicInfo = dynamicInfo;
  }
}

export {DataItem, RetweetedInfo};

