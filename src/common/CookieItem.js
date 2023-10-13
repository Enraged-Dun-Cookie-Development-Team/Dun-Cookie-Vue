/**
 * 代表一块饼！
 */
class CookieItem {
  /**
   * 【必填】标识这个饼来自哪个数据源，值为数据源的唯一id
   * @type {string}
   */
  dataSource;
  /**
   * 【必填】唯一id，格式为 数据源id + _ + 该数据源内部的唯一id
   * <p>
   * 加数据源id是为了避免不同数据源内部的id重复。
   * <strong>注意：使用builder方法会自动加上数据源类型名，子类无需操心</strong>
   * @type {string}
   */
  id;
  /**
   * 【必填】用于在时间线上排序的字段，值为Unix时间戳
   * <p>
   * 应统一使用饼发布的时间，对于只有日期没有具体时间的按照用户设置将具体时间设为00:00:00或23:59:59
   * @type {string}
   */
  timeForSort;
  /**
   * 【必填】用于显示在时间线上的时间，格式应该统一为<code>yyyy-MM-dd hh:mm:ss</code>，其中hh:mm:ss是可选的
   * @type {string}
   */
  timeForDisplay;
  /**
   * 【必填】饼的内容，这里的值应该是转换后可以直接显示在页面上的，并且可以直接复制的
   * @type {string}
   */
  content;
  /**
   * 【必填】跳转链接，用于点击跳转到对应的饼
   * @type {string}
   */
  jumpUrl;
  /**
   * 封面图，用于在页面/通知上显示的饼的图片
   * @type {string}
   */
  coverImage;
  /**
   * 图片列表，对于多图的饼可以把图片全部显示出来
   */
  imageList;
  /**
   * 在列表中是否为置顶内容
   */
  isTop;
  /**
   * 转发的内容
   */
  retweeted;
  /**
   * 当使用特殊组件时，提供给组件的数据
   * <p>
   * 当提供了该属性时会自动寻找特殊组件
   * 需要在components/timeline/items下新增组件，并且在popup/index.js注册组件(组件名为dataSource的dataType.typeName)
   * @type {{[key: string]: unknown}}
   */
  componentData;

  static builder(dataSourceId) {
    const instance = new CookieItem();
    instance.dataSource = dataSourceId;
    // 其实这里用反射生成应该可读性更强一些，但是只有明确写出来IDE才能识别并自动补全
    const _builder = {
      /**
       * @see CookieItem.id
       */
      id: (val) => {
        instance.id = `${dataSourceId}_${val}`;
        return _builder;
      },
      /**
       * @see CookieItem.timeForSort
       */
      timeForSort: (val) => {
        instance.timeForSort = val;
        return _builder;
      },
      /**
       * @see CookieItem.timeForDisplay
       */
      timeForDisplay: (val) => {
        instance.timeForDisplay = val;
        return _builder;
      },
      /**
       * @see CookieItem.content
       */
      content: (val) => {
        instance.content = val;
        return _builder;
      },
      /**
       * @see CookieItem.jumpUrl
       */
      jumpUrl: (val) => {
        instance.jumpUrl = val;
        return _builder;
      },
      /**
       * @see CookieItem.coverImage
       */
      coverImage: (val) => {
        instance.coverImage = val;
        return _builder;
      },
      /**
       * @see CookieItem.imageList
       */
      imageList: (val) => {
        instance.imageList = val;
        return _builder;
      },
      /**
       * @see CookieItem.isTop
       */
      setTop: () => {
        instance.isTop = true;
        return _builder;
      },
      /**
       * @see CookieItem.retweeted
       */
      retweeted: (val) => {
        instance.retweeted = val;
        return _builder;
      },
      /**
       * @see CookieItem.componentData
       */
      componentData: (val) => {
        instance.componentData = val;
        return _builder;
      },
      build: () => instance,
    };
    return _builder;
  }
}

class RetweetedInfo {
  /**
   * 被转发内容的原作者
   */
  name;
  /**
   * 被转发的内容
   */
  content;

  constructor(name, content) {
    this.name = name;
    this.content = content;
  }
}

export { CookieItem, RetweetedInfo };
