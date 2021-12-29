import AbstractPlatform from '../AbstractPlatform';
import $ from "jquery";
import {CURRENT_VERSION, TOOL_QR_URL} from "../../Constants";
import Settings from "../../Settings";
import DataSourceUtil from "../../util/DataSourceUtil";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

const IGNORE_MESSAGE_ERROR_1 = 'Could not establish connection. Receiving end does not exist.';
const IGNORE_MESSAGE_ERROR_2 = 'The message port closed before a response was received.';

let _isBackground;
let _isMobile;

const imageCache = {};
const qrcodeCache = {};

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

  async generateShareImage(dataItem, imageUrl) {
    if (typeof imageUrl !== 'string') {
      imageUrl = dataItem.coverImage;
    }
    const image = await this.__loadImage(imageUrl);
    // 整体宽度以图片宽度为准，至少680，左右再各加10的边距
    const canvasWidth = Math.max(680, image.width) + 20;

    const wrapper = document.createElement('div');
    wrapper.style.position = "absolute";
    wrapper.style.minWidth = canvasWidth + "px";
    wrapper.style.maxWidth = canvasWidth + "px";
    wrapper.style.whiteSpace = "break-all";
    wrapper.style.font = "16px Microsoft Yahei";
    wrapper.style.color = "#848488";
    let html = dataItem.content.replace('\n', '<br/>');
    if (dataItem.retweeted) {
      html += `<div>
          转发自 ${dataItem.retweeted.name}:
          <br/>
          <span>${dataItem.retweeted.content}</span>
        </div>`
    }
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
    const textCanvasPromise = html2canvas(wrapper, {
      backgroundColor: null,
      width: canvasWidth,
    });
    textCanvasPromise.finally(() => {
      document.body.removeChild(wrapper);
    });

    // 减掉左右边距
    const headerCanvasPromise = this.__generateImageHeader(canvasWidth - 20, dataItem);

    const [headerCanvas, textCanvas] = await Promise.all([headerCanvasPromise, textCanvasPromise]);
    const canvasHeight = headerCanvas.height + 10 + textCanvas.height + 10 + image.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(headerCanvas, 10, 0);
    ctx.drawImage(textCanvas, 10, headerCanvas.height + 10);
    ctx.drawImage(image, (canvasWidth - image.width) / 2, headerCanvas.height + 10 + textCanvas.height + 10);
    return canvas;
  }

  /**
   * 生成图片头部，不考虑边距
   *
   * @param width {number}
   * @param dataItem {DataItem}
   * @return {Promise<HTMLCanvasElement>}
   * @private
   */
  async __generateImageHeader(width, dataItem) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = 120;
    const iconPromise = this.__loadImage("/assets/image/" + Settings.logo);
    const sourceIconPromise = this.__loadImage(DataSourceUtil.getByName(dataItem.dataSource).icon);
    const jumpQrCodePromise = this.__generateQrcode(dataItem.jumpUrl);
    const toolQrCodePromise = this.__generateQrcode(TOOL_QR_URL);
    /**
     * 这个类型提示用来避免ide的类型不匹配警告
     * @type {(HTMLImageElement|HTMLCanvasElement)[]}
     */
    const promiseResult = await Promise.all(
      [iconPromise, sourceIconPromise, jumpQrCodePromise, toolQrCodePromise]
    );
    const [icon, sourceIcon, jumpQrCode, toolQrCode] = promiseResult;

    // 小刻食堂信息
    ctx.fillStyle = "#23ade5";
    ctx.font = "36px Microsoft Yahei";
    ctx.fillText(`小刻食堂 V${CURRENT_VERSION}`, 120, 50);
    ctx.drawImage(icon, 10, 10, 100, 100);

    // 数据源信息
    ctx.fillStyle = "#848488";
    ctx.font = "20px Microsoft Yahei";
    ctx.fillText(`${dataItem.dataSource}`, 170, 90);
    ctx.drawImage(sourceIcon, 120, 70, 40, 40);

    ctx.fillStyle = "#909399";
    ctx.font = "14px Microsoft Yahei";
    ctx.fillText(`${dataItem.timeForDisplay}`, 170, 110);

    // 二维码
    const qrcodeSize = 90;
    ctx.fillStyle = "#23ade5";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const toolQrCodeOffset = canvas.width - qrcodeSize;
    const jumpQrCodeOffset = toolQrCodeOffset - 20 - qrcodeSize;
    ctx.drawImage(jumpQrCode, jumpQrCodeOffset, 10, qrcodeSize, qrcodeSize);
    ctx.fillText(`数据来源`, jumpQrCodeOffset + (qrcodeSize / 2), 10 + qrcodeSize + 5);
    ctx.drawImage(toolQrCode, toolQrCodeOffset, 10, qrcodeSize, qrcodeSize);
    ctx.fillText(`食堂介绍`, toolQrCodeOffset + (qrcodeSize / 2), 10 + qrcodeSize + 5);

    return canvas;
  }

  /**
   * @return {Promise<HTMLImageElement>}
   */
  __loadImage(src) {
    if (imageCache[src]) {
      return Promise.resolve(imageCache[src]);
    }
    const icon = document.createElement('img');
    icon.crossOrigin = "anonymous";
    icon.src = src;
    return new Promise((resolve, reject) => {
      icon.onload = () => {
        imageCache[src] = icon;
        resolve(icon);
      }
      icon.onerror = reject;
    });
  }

  /**
   * @return {Promise<HTMLImageElement>}
   */
  __generateQrcode(text) {
    if (qrcodeCache[text]) {
      return Promise.resolve(qrcodeCache[text]);
    }
    const qrcode = new QRCode.toCanvas(text, {margin: 0});
    return qrcode.then(canvas => {
      qrcodeCache[text] = canvas;
      return canvas;
    });
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
