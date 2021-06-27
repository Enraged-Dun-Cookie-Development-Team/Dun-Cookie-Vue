import {BilibiliDataSource} from './def/BilibiliDataSource';
import HttpUtil from '../util/HttpUtil';

class CustomDataSourceBuilder {
  /**
   * 必须是类constructor
   */
  type;
  get typeName() {
    return this.type.typeName;
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
   * 构建方法，接收一个字符串参数构建出数据源，返回值应该是一个Promise<DataSource|null>或null
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
    name: BilibiliDataSource.typeName,
    builder: new CustomDataSourceBuilder(BilibiliDataSource, 'B站', '请输入B站UID', 'B站UID', function (arg) {
      const uid = parseInt(arg)
      if (uid <= 0) {
        return null;
      }
      return HttpUtil.GET_Json(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`).then(json => {
        if (json.code != 0) {
          throw 'request fail: ' + JSON.stringify(json);
        }
        const iconUrl = json.data.face;
        const dataName = this.type.typeName + '_' + uid;
        const title = json.data.name;
        const dataUrl = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}&offset_dynamic_id=0&need_top=0&platform=web`;
        return new this.type(iconUrl, dataName, title, dataUrl, BASE_PRIORITY);
      }).catch(error => {
        console.log(error);
      });
    })
  }
];

export {customDataSourceTypes};
