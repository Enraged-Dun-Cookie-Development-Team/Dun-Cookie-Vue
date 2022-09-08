import PlatformHelper from '../platform/PlatformHelper';
import DebugUtil from "./DebugUtil";

function appendTimeStamp(urlStr) {
    const url = new URL(urlStr);
    url.searchParams.set('t', new Date().getTime().toString());
    return url.toString();
}

class HttpUtil {

    /**
   * 向指定的url发送get请求并解析为JSON
   * @param url 想要请求的url
   * @param {Object} options 可选的参数对象
   * @param {boolean?} options.appendTimestamp 是否要增加时间戳参数以避免缓存，默认为true
   * @param {number?} options.timeout 超时(单位：毫秒)，默认5秒
   * @param {function?} options.failController 控制catch回调函数，默认在ok为false时抛出异常
   * @return {Promise}
   */
    static async GET_Json(url, options = {}) {
        const response = await HttpUtil.GET(url, options);
        if (response) {
            return JSON.parse(response);
        }
    }

    /**
   * 向指定的url发送get请求
   * @param url 想要请求的url
   * @param {Object} options 可选的参数对象
   * @param {boolean?} options.appendTimestamp 是否要增加时间戳参数以避免缓存，默认为true
   * @param {number?} options.timeout 超时(单位：毫秒)，默认10秒
   * @param {function?} options.failController 控制catch回调函数，默认在ok为false时抛出异常
   * @return {Promise}
   */
    static async GET(url, options = {}) {
        if (typeof options.appendTimestamp != 'boolean' || options.appendTimestamp) {
            url = appendTimeStamp(url);
        }
        DebugUtil.debugLog(7, `正在请求URL：${url}`);
        try {
            return await PlatformHelper.Http.sendGet(url, options);
        } catch (e) {
            let errMsg = `请求URL时发生异常：${url}`;
            if (typeof e !== "string") {
                // 为避免出现错误提示使用户迷惑，故仅使用log而不使用warn或error
                console.log(e);
            } else {
                errMsg = e;
            }
            DebugUtil.debugLog(0, errMsg);
        }
    }
}

export default HttpUtil;
