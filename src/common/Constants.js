// region 版本号、测试模式等常量
/**
 * Debug等级，小于等于0的值为关闭debug
 * @type {number} Debug等级
 */
const DEBUG_LEVEL = 0;
/**
 * 是否是测试模式
 */
const IS_DEBUG = DEBUG_LEVEL > 0;
/**
 * 是否输出调试日志
 * <p>
 * 需要注意的是如果输出日志太多会导致打卡开发者控制台(F12)会非常卡，所以不要动前面的<code>IS_DEBUG &&</code>以避免忘记修改导致生产版本出问题
 */
const DEBUG_LOG = IS_DEBUG && true;

/**
 * 当前配置文件版本号
 */
const CURRENT_SETTING_VERSION = 5;
/**
 * 当前插件版本号
 */
const CURRENT_VERSION = process.env.VUE_APP_PROJECT_VERSION;
/**
 * 展示用的版本号
 */
const SHOW_VERSION = CURRENT_VERSION + (IS_DEBUG ? '【调试模式】' : '');

/**
 * 启用的增强特性
 * @type {string[]}
 */
const ENABLE_FEATURES = (process.env.VUE_APP_ENABLE_FEATURES || '')
  .split(',')
  .filter((v) => v.length > 0 && !['local_fetch'].includes(v));
/**
 * 构建者
 */
const BUILD_BY = process.env.VUE_APP_BUILD_BY;
/**
 * 构建签名
 */
const BUILD_SIGN = process.env.VUE_APP_BUILD_SIGN;

export {
  IS_DEBUG,
  DEBUG_LEVEL,
  DEBUG_LOG,
  CURRENT_SETTING_VERSION,
  CURRENT_VERSION,
  SHOW_VERSION,
  ENABLE_FEATURES,
  BUILD_BY,
  BUILD_SIGN,
};
// endregion

// region 各种参数，主要用于测试模式
/**
 * 理智恢复速度，非测试模式6分钟，测试模式75秒
 */
const SAN_RECOVERY_SPEED = IS_DEBUG ? 75 * 1000 : 6 * 60 * 1000;

export { SAN_RECOVERY_SPEED };
// endregion

// region message通信相关常量
const MESSAGE_SETTINGS_UPDATE = 'settings-update';
const MESSAGE_SAN_UPDATE = 'san-update';

const MESSAGE_SAN_GET = 'san-get';
const MESSAGE_CHANGE_COUNTDOWN = 'change-countdown';

const MESSAGE_WEIBO_ADD_REFERER = 'weibo-add-referer';
const MESSAGE_GET_COUNTDOWN = 'countdown-list';

export { MESSAGE_SETTINGS_UPDATE, MESSAGE_SAN_UPDATE };
export { MESSAGE_SAN_GET, MESSAGE_CHANGE_COUNTDOWN };
export { MESSAGE_WEIBO_ADD_REFERER, MESSAGE_GET_COUNTDOWN };
// endregion

// region 平台类型
const PLATFORM_CHROME = 'Chrome';
const PLATFORM_FIREFOX = 'Firefox';
const PLATFORM_EDGE = 'Edge';
const PLATFORM_UNKNOWN = 'Unknown';

export { PLATFORM_CHROME, PLATFORM_FIREFOX, PLATFORM_EDGE, PLATFORM_UNKNOWN };
// endregion

// region 扩展内置页面
const PAGE_WELCOME = 'welcome.html';
const PAGE_OPTIONS = 'options.html';
const PAGE_UPDATE = 'update.html';
const PAGE_TIME = 'time.html';
const PAGE_POPUP_WINDOW = 'popup.html';
const PAGE_GITHUB_REPO = 'https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue';
const PAGE_CEOBECANTEEN_WEB_ABOUT_US = 'https://www.ceobecanteen.top/#about-us';
const PAGE_CEOBECANTEEN_WEB_SPONSOR = 'https://www.ceobecanteen.top/#sponsor';

export {
  PAGE_WELCOME,
  PAGE_POPUP_WINDOW,
  PAGE_OPTIONS,
  PAGE_UPDATE,
  PAGE_GITHUB_REPO,
  PAGE_TIME,
  PAGE_CEOBECANTEEN_WEB_ABOUT_US,
  PAGE_CEOBECANTEEN_WEB_SPONSOR,
};
// endregion

// region 杂项
const TOOL_QR_URL = 'https://arknightscommunity.drblack-system.com/15386.html';

const CANTEEN_API_BASE = process.env.VUE_APP_API_SERVER_BASE;
const CANTEEN_CDN_API_BASE = process.env.VUE_APP_API_CDN_BASE;
const CANTEEN_CDN_SERVER_API_BASE = process.env.VUE_APP_API_SERVER_CDN_BASE;

const dayInfo = [
  {
    type: 1,
    name: '高级作战记录',
    day: [1, 2, 3, 4, 5, 6, 0],
    src: '/assets/image/game/LS.png',
  },
  {
    type: 2,
    name: '龙门币',
    day: [2, 4, 6, 0],
    src: '/assets/image/game/CE.png',
  },
  {
    type: 3,
    name: '采购凭证',
    day: [1, 4, 6, 0],
    src: '/assets/image/game/AP.png',
  },
  {
    type: 4,
    name: '碳素',
    day: [1, 3, 5, 6],
    src: '/assets/image/game/SK.png',
  },
  {
    type: 5,
    name: '技巧概要',
    day: [2, 3, 5, 0],
    src: '/assets/image/game/CA.png',
  },
  {
    type: 6,
    name: '摧枯拉朽',
    day: [1, 2, 5, 6],
    src: '/assets/image/game/PRB.png',
  },
  {
    type: 7,
    name: '身先士卒',
    day: [2, 3, 6, 0],
    src: '/assets/image/game/PRD.png',
  },
  {
    type: 8,
    name: '固若金汤',
    day: [1, 4, 5, 0],
    src: '/assets/image/game/PRA.png',
  },
  {
    type: 9,
    name: '势不可当',
    day: [3, 4, 6, 0],
    src: '/assets/image/game/PRC.png',
  },
];

const countDown = [
  {
    index: 1,
    name: '公招倒计时1',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime: new Date(2021, 1, 1, 9, 0, 0),
    stopTime: null,
  },
  { index: 2, name: '公招倒计时2', selectableRange: '00:00:00 - 09:00:00', pickerTime: new Date(2021, 1, 1, 9, 0, 0) },
  {
    index: 3,
    name: '公招倒计时3',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime: new Date(2021, 1, 1, 9, 0, 0),
  },
  {
    index: 4,
    name: '公招倒计时4',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime: new Date(2021, 1, 1, 9, 0, 0),
  },
  {
    index: 5,
    name: '线索交流倒计时',
    pickerTime: new Date(2021, 1, 1, 23, 59, 59),
  },
  {
    index: 6,
    name: '专精倒计时',
    pickerTime: new Date(2021, 1, 1, 23, 59, 59),
  },
  {
    index: 7,
    name: '办公室倒计时',
    pickerTime: new Date(2021, 1, 1, 23, 59, 59),
  },
  {
    index: 8,
    name: '备用',
    pickerTime: new Date(2021, 1, 1, 23, 59, 59),
  },
];

export { dayInfo, countDown, TOOL_QR_URL, CANTEEN_API_BASE, CANTEEN_CDN_API_BASE, CANTEEN_CDN_SERVER_API_BASE };
// endregion
