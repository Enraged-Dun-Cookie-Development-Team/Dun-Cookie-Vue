import ChromePlatform from './ChromePlatform';
import {PLATFORM_EDGE} from '../../Constants';

// 根据MDN中的兼容性表格中的说明，Edge会将message发给同一个页面的onMessageListener，因此在每个页面生成一个唯一id，接收时过滤掉相同页面的消息
// https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage#browser_compatibility
const _pageId = String(Math.floor(Math.random() * 1000000));

/**
 * 由于Edge内核是chromium，因此直接继承ChromePlatform，仅特殊部分进行单独处理
 */
export default class EdgePlatform extends ChromePlatform {

    constructor() {
        super();
    }

    get PlatformType() {
        return PLATFORM_EDGE;
    }

    __buildMessageToSend(type, data) {
        const message = super.__buildMessageToSend(type, data);
        message.page = _pageId;
        return message;
    }

    __handleReceiverMessage(type, message, listener) {
        if (message.page !== _pageId) {
            return super.__handleReceiverMessage(type, message, listener);
        }
    }

}
