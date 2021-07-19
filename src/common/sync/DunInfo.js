import {MESSAGE_DUN_INFO_GET, MESSAGE_DUN_INFO_UPDATE} from '../Constants';
import {deepAssign} from '../util/CommonFunctions';
import PlatformHelper from '../platform/PlatformHelper';

/**
 * 蹲饼数据
 * <p>
 * 插件停止后该数据会丢失(目前看来不需要持久化)
 */
class DunInfo {
  // 蹲饼次数
  counter = 0;
  // 蹲到的饼的数量
  cookieCount = 0;
  // 最后一次蹲饼时间
  lastDunTime = -1;

  constructor() {
    PlatformHelper.Message.send(MESSAGE_DUN_INFO_GET).then(data => deepAssign(this, data));
    PlatformHelper.Message.registerListener('dunInfo', MESSAGE_DUN_INFO_UPDATE, data => deepAssign(this, data));
  }

  saveUpdate() {
    PlatformHelper.Message.send(MESSAGE_DUN_INFO_UPDATE, this);
  }
}

const instance = new DunInfo();
export default instance;
