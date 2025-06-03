// region 版本号、调试模式等常量
/**
 * 是否是调试模式
 */
export const IS_DEBUG = false;
/**
 * 当前配置文件版本号
 */
export const CURRENT_SETTING_VERSION = 6;
/**
 * 当前插件版本号
 */
export const CURRENT_VERSION = process.env.VUE_APP_PROJECT_VERSION;
/**
 * 展示用的版本号
 */
export const SHOW_VERSION = CURRENT_VERSION + (IS_DEBUG ? '【调试模式】' : '');

/**
 * 启用的增强特性
 * @type {string[]}
 */
export const ENABLE_FEATURES = (process.env.VUE_APP_ENABLE_FEATURES || '')
  .split(',')
  // 这里是将local_fetch视为隐藏启用的功能，不打印到日志
  .filter((v) => v.length > 0 && v !== 'local_fetch');
/**
 * 构建者
 */
export const BUILD_BY = process.env.VUE_APP_BUILD_BY;
/**
 * 构建签名
 */
export const BUILD_SIGN = process.env.VUE_APP_BUILD_SIGN;
// endregion

// region 各种参数，主要用于测试模式
/**
 * 理智恢复速度，非测试模式6分钟，测试模式75秒
 */
const SAN_RECOVERY_SPEED = IS_DEBUG ? 75 * 1000 : 6 * 60 * 1000;

export { SAN_RECOVERY_SPEED };
// endregion

// region message通信相关常量
export const MESSAGE_SETTINGS_UPDATE = 'settings-update';
export const MESSAGE_SAN_UPDATE = 'san-update';

export const MESSAGE_SAN_GET = 'san-get';

export const MESSAGE_CHANGE_COUNTDOWN = 'change-countdown';
export const MESSAGE_GET_COUNTDOWN = 'countdown-list';
// endregion

// region 平台类型
export const PLATFORM_CHROME = 'Chrome';
export const PLATFORM_FIREFOX = 'Firefox';
export const PLATFORM_EDGE = 'Edge';
export const PLATFORM_UNKNOWN = 'Unknown';
// endregion

// region 扩展内置页面
export const PAGE_WELCOME = 'welcome.html';
export const PAGE_OPTIONS = 'options.html';
export const PAGE_UPDATE = 'update.html';
export const PAGE_TIME = 'time.html';
export const PAGE_POPUP_WINDOW = 'popup.html';
export const PAGE_GITHUB_REPO = 'https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue';
export const PAGE_CEOBECANTEEN_WEB_ABOUT_US = 'https://www.ceobecanteen.top/#about-us';
export const PAGE_CEOBECANTEEN_WEB_SPONSOR = 'https://www.ceobecanteen.top/#sponsor';
// endregion

// region 杂项
export const TOOL_QR_URL = 'https://www.bilibili.com/video/BV1ru4y1x7cZ/';

export const CANTEEN_API_BASE = process.env.VUE_APP_API_SERVER_BASE;
export const CANTEEN_CDN_API_BASE = process.env.VUE_APP_API_CDN_BASE;
export const CANTEEN_CDN_SERVER_API_BASE = process.env.VUE_APP_API_SERVER_CDN_BASE;

export const dayInfo = [
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

export const countDown = [
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

export const toolDefaults = [
  {
    id: 'local_ceobe_canteen_timer',
    localized_name: { zh_CN: '小刻食堂计时器', en_US: 'Ceobe Canteen Timer' },
    localized_description: { zh_CN: '', en_US: '' },
    localized_slogen: { zh_CN: '', en_US: '' },
    localized_tags: { zh_CN: [], en_US: [] },
    icon_url: '/assets/image/icon.png',
    links: [
      {
        primary: true,
        regionality: 'CHINA_MAINLAND',
        localized_name: { zh_CN: '小刻食堂计时器', en_US: 'Ceobe Canteen Timer' },
        url: '../time.html',
      },
    ],
    isActivated: true,
  },
];
// endregion
