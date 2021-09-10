import PlatformHelper from '../platform/PlatformHelper';

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
