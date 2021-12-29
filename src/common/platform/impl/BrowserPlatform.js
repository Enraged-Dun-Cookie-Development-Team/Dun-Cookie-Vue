import AbstractPlatform from '../AbstractPlatform';
import $ from "jquery";
import janvas from "../../util/janvas.min";

const IGNORE_MESSAGE_ERROR_1 = 'Could not establish connection. Receiving end does not exist.';
const IGNORE_MESSAGE_ERROR_2 = 'The message port closed before a response was received.';

let _isBackground;
let _isMobile;

/**
 * 浏览器平台，放置与具体浏览器无关的通用逻辑
 */
export default class BrowserPlatform extends AbstractPlatform {

  constructor() {
    super();
    // 这部分放在类里面的原因是放在外面会被意外执行导致报错
    // 判断当前url中是否包含background(已知的其它方法都是Promise，都不能保证在isBackground被使用之前完成判断)
    _isBackground = window.document.URL.indexOf('background') !== -1;
    console.log(`Current isBackground: ${_isBackground}`);

    const head = navigator.userAgent;
    _isMobile = head.indexOf("Android") > 1 || head.indexOf("iPhone") > 1;
  }

  get isBackground() {
    return _isBackground;
  }

  get isMobile() {
    return _isMobile;
  }

  get PlatformType() {
    return "Browser";
  }

  loadImages(obj) {
    return new Promise(resolve => {
      janvas.Utils.loadImages(obj, (data) => {
        resolve(data);
      });
    })
  }

  sendHttpRequest(url, method) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      let err;
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          err = xhr;
        }
      }
      xhr.onerror = () => {
        err = `请求URL时发生异常：${url}`;
      }
      xhr.onloadend = () => {
        if (!!err) {
          reject(err);
        }
      }
      xhr.send();
    });
  }

  getHtmlParser() {
    return $;
  }

  __shouldIgnoreMessageError(errMsg) {
    return errMsg === IGNORE_MESSAGE_ERROR_1 || errMsg === IGNORE_MESSAGE_ERROR_2;
  }

}
