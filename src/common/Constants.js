// region 版本号、测试模式等常量
/**
 * 是否是测试模式
 */
const IS_TEST = true;
/**
 * 是否输出调试日志
 * <p>
 * 需要注意的是如果输出日志太多会导致打卡开发者控制台(F12)会非常卡
 */
const DEBUG_LOG = IS_TEST;
/**
 * 当前插件版本号
 */
const CURRENT_VERSION = '2.1.0';
/**
 * 展示用的版本号
 */
const SHOW_VERSION = CURRENT_VERSION + (IS_TEST ? '【测试模式】' : '');

export {IS_TEST, DEBUG_LOG, CURRENT_VERSION, SHOW_VERSION};
// endregion

// region 各种参数，主要用于测试模式
/**
 * 测试模式的数据刷新间隔(秒)
 */
const TEST_DATA_REFRESH_TIME = 3;
/**
 * 理智恢复速度，非测试模式6分钟，测试模式30秒
 */
const SAN_RECOVERY_SPEED = IS_TEST ? 30 * 1000 : 6 * 60 * 1000;

export {TEST_DATA_REFRESH_TIME, SAN_RECOVERY_SPEED};
// endregion

// region message通信相关常量
const MESSAGE_SETTINGS_UPDATE = 'settings-update';
const MESSAGE_SAN_UPDATE = 'san-update';
const MESSAGE_CARD_LIST_UPDATE = 'cardList-update';
const MESSAGE_DUN_INFO_UPDATE = 'dunInfo-update';

const MESSAGE_SAN_GET = 'san-get';
const MESSAGE_DUN_INFO_GET = 'dunInfo-get';
const MESSAGE_CARD_LIST_GET = 'cardList-get';

const MESSAGE_FORCE_REFRESH = 'force-refresh';

export {MESSAGE_SETTINGS_UPDATE, MESSAGE_SAN_UPDATE, MESSAGE_CARD_LIST_UPDATE, MESSAGE_DUN_INFO_UPDATE};
export {MESSAGE_SAN_GET, MESSAGE_DUN_INFO_GET, MESSAGE_CARD_LIST_GET};
export {MESSAGE_FORCE_REFRESH};
// endregion

// region 浏览器类型
const BROWSER_CHROME = 'Chrome';
const BROWSER_FIREFOX = 'Firefox';
const BROWSER_MOBILE_PHONE = 'MobilePhone';
const BROWSER_UNKNOWN = 'Unknown';

export {BROWSER_CHROME, BROWSER_FIREFOX, BROWSER_MOBILE_PHONE, BROWSER_UNKNOWN};
// endregion
