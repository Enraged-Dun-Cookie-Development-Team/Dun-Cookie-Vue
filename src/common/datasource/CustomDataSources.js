import { BilibiliDataSource } from './def/BilibiliDataSource';
import { WeiboDataSource } from './def/WeiboDataSource';

class CustomDataSourceBuilder {
  /**
   * 必须是类constructor
   */
  type;

  get typeName() {
    return this.type.typeInfo.typeName;
  }

  /**
   * 用来显示的类型名称
   */
  title;
  /**
   * 用于浮动显示参数提示
   */
  argTip;
  /**
   * 用于输入框的placeholder
   */
  argPlaceholder;
  /**
   * 构建方法，接收一个字符串参数构建出数据源，返回值应该是一个Promise<DataSource|null>
   */
  build;

  constructor(type, title, argTip, argPlaceholder, build) {
    this.type = type;
    this.title = title;
    this.argTip = argTip;
    this.argPlaceholder = argPlaceholder;
    this.build = build.bind(this);
  }
}

// 优先级暂定1000，后续支持自定义(最小值1000保证默认数据源排在前面)
const BASE_PRIORITY = 1000;

const customDataSourceTypes = [
  {
    name: BilibiliDataSource.typeInfo.typeName,
    builder: new CustomDataSourceBuilder(BilibiliDataSource, 'B站', '请输入B站UID', 'B站UID', function (arg) {
      if (!/^\d+$/.test(arg)) {
        return Promise.reject('非法UID');
      }
      return BilibiliDataSource.withUid(arg, (config) => {
        config.priority = BASE_PRIORITY;
      });
    }),
  },
  {
    name: WeiboDataSource.typeInfo.typeName,
    builder: new CustomDataSourceBuilder(WeiboDataSource, '微博', '请输入微博UID', '微博UID', function (arg) {
      if (!/^\d+$/.test(arg)) {
        return Promise.reject('非法UID');
      }
      return WeiboDataSource.withUid(arg, (config) => {
        config.priority = BASE_PRIORITY;
      });
    }),
  },
];
const customDataSourceTypesByName = {};
for (const type of customDataSourceTypes) {
  customDataSourceTypesByName[type.name] = type.builder;
}

export { customDataSourceTypes, customDataSourceTypesByName };
