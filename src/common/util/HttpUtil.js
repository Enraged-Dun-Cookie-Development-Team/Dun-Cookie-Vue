import PlatformHelper from '../platform/PlatformHelper';
import {DEBUG_LOG} from "../Constants";

class HttpUtil {

  static appendTimeStamp(url) {
    // 此处是为了兼容有queryString的url和没有queryString的url，用?判断应该大概没问题吧
    if (url.indexOf('?') >= 0) {
      return `${url}&t=${new Date().getTime()}`;
    } else {
      return `${url}?t=${new Date().getTime()}`;
    }
  }

  /**
   * 向指定的url发送get请求并解析为JSON
   * @param url 想要请求的url
   * @return {Promise}
   */
  static async GET_Json(url) {
    const response = await HttpUtil.GET(url);
    if (response) {
      return JSON.parse(response);
    }
  }

  /**
   * 向指定的url发送get请求
   * @param url 想要请求的url
   * @return {Promise}
   */
  static async GET(url) {
    if (DEBUG_LOG) {
      console.log(`正在请求URL：${url}`);
    }
    try {
      return await PlatformHelper.Http.sendGet(url);
    } catch (e) {
      // 为避免出现错误提示使用户迷惑，故仅使用log而不使用warn或error
      console.log(e);
    }
  }
}

export default HttpUtil
