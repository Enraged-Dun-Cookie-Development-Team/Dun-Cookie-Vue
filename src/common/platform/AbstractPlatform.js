import DebugUtil from "../util/DebugUtil";

// 其实这玩意不是很有必要提取成常量，但是提取了也没坏处(至少修改起来比较方便)
const unsupportedTip = "该平台未实现该接口！请联系[小刻食堂]开发者解决该问题";

// TODO 实现子类时，如果是callback的方法(Chrome v2)，务必检查runtime.lastError。如果是Promise的方法(Chrome v3、Firefox)，务必catch。
//  所有接口的返回值务必使用Promise(catch放在哪里的问题可以再考虑)
//  当所有接口检查过确认进行了上述的错误处理后，才能删掉这条TODO

// TODO 提取Chrome和Firefox中的公共代码
/**
 * 抽象平台.
 * <p>
 * 需要注意的是：如果是无法实现的接口，也应由子类主动实现一个空方法，如果子类不实现就会抛异常，这种设计的目的是为了避免子类忘记实现接口(所以说js没有抽象方法真的惨)
 */
export default class AbstractPlatform {

    static __MESSAGE_WITHOUT_RESPONSE = '__NO_RESPONSE__'

    /**
     * 是否是后台线程(后台线程应该有且只有一个，尽量将需要计算的内容都放入后台线程)
     * @return {boolean}
     */
    get isBackground() {
        throw unsupportedTip;
    };

    /**
     * 获取当前是否是移动端
     * @return {boolean}
     */
    get isMobile() {
        throw unsupportedTip;
    };

    /**
     * 浏览器类型
     * @return {string}
     */
    get PlatformType() {
        throw unsupportedTip;
    };

    /**
     * 操作系统
     * @return {Promise<any>}
     */
    getPlatformInfo() {
        throw unsupportedTip;
    };

    // TODO 关于数据同步
    //  如果使用浏览器自带的同步功能：
    //  Chrome可以简单地将storage.local改为storage.sync，Firefox需要在改为storage.sync后参考以下链接进行相应设置(Edge不清楚，按理说应该是和Chrome一样的)
    //  https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync

    /**
     * 读取本地储存中的内容
     * @param {string|string[]|object} name 如果不提供该参数则返回储存中的全部内容
     * @return {Promise} 读取成功则resolve(键值对，如果请求的是单个string则直接返回值)，读取失败则reject
     */
    getLocalStorage(name) {
        throw unsupportedTip;
    };

    /**
     * 将数据储存到本地
     * @param {string} name
     * @param data
     * @return {Promise} 储存成功则resolve(无任何参数)，储存失败则reject
     */
    saveLocalStorage(name, data) {
        throw unsupportedTip;
    };

    /**
     * 向其它页面发送消息
     * @param type 消息类型，只有监听指定类型的监听器才能接收到消息
     * @param data 消息内容
     * @return {Promise} 如果有消息接收者有返回消息的话可以在这个Promise获取(注意：如果没有返回消息的话Promise会得到undefined)
     */
    sendMessage(type, data) {
        throw unsupportedTip;
    };

    /**
     * 监听message
     * @param id 监听器ID，暂时的用途只有调试输出
     * @param type 如果不提供type或者type为false则监听所有信息，否则只监听对应type的信息
     * @param listener 监听器，接收一个参数处理信息，可以使用返回值返回消息
     */
    addMessageListener(id, type, listener) {
        throw unsupportedTip;
    };

    /**
     * 设置点击扩展图标时的弹出窗
     * @param url 指定弹出窗的url，如果不提供改参数则会移除弹出窗
     * @return {Promise}
     */
    setPopup(url) {
        throw unsupportedTip;
    };

    /**
     * 获取扩展插件中指定文件对应的URL
     * @param file
     * @return {string}
     */
    getURLForExtensionFile(file) {
        throw unsupportedTip;
    };


    /**
     * 获取全部窗口
     * @return {Promise} 返回全部的窗口
     */
    getAllWindow() {
        throw unsupportedTip;
    };

    /**
     * 创建一个桌面通知
     * @param id 通知ID
     * @param iconUrl 图标URL
     * @param title 标题
     * @param message 内容
     * @param imageUrl 图片URL
     * @return {Promise}
     */
    createNotifications(id, iconUrl, title, message, imageUrl) {
        throw unsupportedTip;
    };

    /**
     * 注册桌面通知被点击的监听器
     * @param listener 监听器，接收一个参数(通知ID)
     */
    addNotificationClickListener(listener) {
        throw unsupportedTip;
    };

    /**
     * 监听浏览器中的插件图标点击事件。
     * <p>
     * <strong>注意：当设置了弹出菜单的时候不会触发监听器</strong>
     * @param listener 监听器，接收一个参数(当前页面的tab对象)
     */
    addIconClickListener(listener) {
        throw unsupportedTip;
    };

    /**
     * 在新标签页中打开指定url
     * @param url 目标url
     * @return {Promise}
     */
    createTab(url) {
        throw unsupportedTip;
    };

    __buildCreateData(window, url, type, width, height, state) {
        const createData = {
            url: url,
            type: type,
        };
        let canUsePosition = true;
        if (state) {
            createData.state = state;
            if (['minimized', 'maximized', 'fullscreen'].indexOf(state) >= 0) {
                canUsePosition = false;
            }
        }
        if (canUsePosition) {
            createData.width = width;
            createData.height = height;
            const left = Math.round((window.width - width) * 0.5 + window.left);
            const top = Math.round((window.height - height) * 0.5 + window.top);
            createData.top = Math.round(top);
            createData.left = Math.round(left);
        }
        return createData;
    }

    /**
     * 打开新窗口
     * @param url 新窗口显示的url
     * @param type 窗口类型
     * @param width 窗口宽度
     * @param height 窗口高度
     * @param state 窗口的初始状态，可以不提供，当该值为minimized/maximized/fullscreen时width、height参数无效
     * @return {Promise} resolve接收一个参数(新窗口的tab对象)
     */
    createWindow(url, type, width, height, state) {
        throw unsupportedTip;
    };

    /**
     * 更新窗口信息
     * @param winId 窗口id
     * @param width 窗口宽度
     * @param height 窗口高度
     * @return {Promise} resolve接收一个参数(新窗口的tab对象)
     */
    updateWindow(winId, width, height) {
        throw unsupportedTip;
    };

    /**
     * 关闭指定窗口
     * @param windowId 要关闭的窗口ID
     * @return {Promise}
     */
    removeWindow(windowId) {
        throw unsupportedTip;
    };

    /**
     * 下载指定url的内容
     * @param url 目标url
     * @param filename 文件名，如果传入空字符串或者非string类型的值则使用浏览器默认的文件名
     * @param saveAs 是否提供文件选择对话框，true->提供，false->不提供，非boolean类型的值->使用浏览器默认设置
     * @return {Promise} resolve接收一个参数(下载任务的id)
     */
    download(url, filename, saveAs) {
        throw unsupportedTip;
    };

    /**
     * 监听扩展插件的安装事件。
     * <p>
     * @param listener 监听器，接收一个参数(details{id,previousVersion,reason})
     */
    addInstallListener(listener) {
        throw unsupportedTip;
    };

    /**
     * 发送HTTP请求
     * @param url 目标url
     * @param method 请求方法(GET/POST等)
     * @param timeout 超时(单位：毫秒)，不提供或小于等于0时无限等待直至到达浏览器内置超时
     * @return {Promise} resolve接收一个参数(http响应内容)
     */
    sendHttpRequest(url, method, timeout) {
        throw unsupportedTip;
    };

    /**
     * 设置扩展图标的标记文字
     * @param text {string}
     * @return {Promise}
     */
    setBadgeText(text) {
        throw unsupportedTip;
    }

    /**
     * 设置扩展图标的标记背景色
     * @param color {[number,number,number,number]} rgba(range 0-255)
     * @return {Promise}
     */
    setBadgeBackgroundColor(color) {
        throw unsupportedTip;
    }

    /**
     * 创建定时警报
     * @param name {string | undefined}
     * @param alarmInfo {{when?: number, delayInMinutes?: number, periodInMinutes?: number} | undefined}
     * @return {void}
     */
    createAlarm(name, alarmInfo) {
        throw unsupportedTip;
    }

    /**
     * 清除全部警报
     * @return {Promise<boolean>}
     */
    clearAllAlarms() {
        throw unsupportedTip;
    }

    /**
     * 监听alarm事件
     * <p>
     * @param listener 监听器，接收一个参数(alarm)
     */
    addAlarmsListener(listener) {
        throw unsupportedTip;
    };

    /**
     * 返回的对象可以当成jQuery的$来使用
     *
     * @return {jQuery}
     */
    getHtmlParser() {
        throw unsupportedTip;
    }

    /**
     * 生成某条数据的分享图片
     * @param dataItem {DataItem}
     * @param iconUrl {string}
     * @param sourceIconUrl {string}
     * @param imageUrl {string?}
     * @return {Promise}
     */
    generateShareImage(dataItem, iconUrl, sourceIconUrl, imageUrl) {
        throw unsupportedTip;
    }

    /**
     * 统一的message接收处理逻辑
     * @protected
     */
    __handleReceiverMessage(id, type, message, listener) {
        let value;

        if (!type || message.type === type) {
            DebugUtil.debugLog(7, `${id} - ${type}|${message.type} - receiverMessage`, message);
            if (!type) {
                value = listener(message);
            } else {
                value = listener(message.data);
            }

            if (value !== null && value !== undefined) {
                DebugUtil.debugLog(7, `${id} - ${type}|${message.type} - receiverMessage - response`, value);
                return value;
            } else {
                DebugUtil.debugLog(8, `${id} - ${type}|${message.type} - receiverMessage - responseEmpty`);
                // 必须要返回点什么东西来避免报错
                return AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE;
            }
        }
    }

    /**
     * 统一的message构建逻辑
     * @protected
     */
    __buildMessageToSend(type, data) {
        DebugUtil.debugLog(7, `sendMessage - ${type}`, data || 'no-data');
        const message = { type: type };
        if (data) {
            message.data = data;
        }
        return message;
    }

    /**
     * 统一的message响应处理逻辑
     * @protected
     */
    __transformResponseMessage(type, response) {
        if (response === AbstractPlatform.__MESSAGE_WITHOUT_RESPONSE) {
            DebugUtil.debugLog(8, `response - ${type} - empty`);
            return;
        }
        DebugUtil.debugLog(7, `response - ${type}`, response);
        return response;
    }

}

