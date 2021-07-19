import PlatformHelper from '../platform/PlatformHelper';

class HttpUtil {

  /**
   * 向指定的url发送get请求并解析为JSON
   * @param url 想要请求的url
   * @return {Promise}
   */
  static GET_Json(url) {
    try {
      return HttpUtil.GET(url).then(response => JSON.parse(response));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 向指定的url发送get请求
   * @param url 想要请求的url
   * @return {Promise}
   */
  static GET(url) {
    return PlatformHelper.Http.sendGet(url).catch(error => console.error(error));
  }
}

export default HttpUtil
