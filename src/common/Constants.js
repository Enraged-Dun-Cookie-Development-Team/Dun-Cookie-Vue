// region 版本号、测试模式等常量
/**
 * 是否是测试模式
 */
const IS_DEBUG = false;
/**
 * 是否输出调试日志
 * <p>
 * 需要注意的是如果输出日志太多会导致打卡开发者控制台(F12)会非常卡，所以不要动前面的<code>IS_DEBUG &&</code>以避免忘记修改导致生产版本出问题
 */
const DEBUG_LOG = IS_DEBUG && true;
/**
 * 当前配置文件版本号
 */
const CURRENT_SETTING_VERSION = 1;
/**
 * 当前插件版本号
 */
const CURRENT_VERSION = '3.0.10';
/**
 * 展示用的版本号
 */
const SHOW_VERSION = CURRENT_VERSION + (IS_DEBUG ? '【调试模式】' : '');

export {IS_DEBUG, DEBUG_LOG, CURRENT_SETTING_VERSION, CURRENT_VERSION, SHOW_VERSION};
// endregion

// region 各种参数，主要用于测试模式
/**
 * 测试模式的数据刷新间隔(秒)
 */
const TEST_DATA_REFRESH_TIME = 5;
/**
 * 理智恢复速度，非测试模式6分钟，测试模式75秒
 */
const SAN_RECOVERY_SPEED = IS_DEBUG ? 75 * 1000 : 6 * 60 * 1000;

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
const MESSAGE_CHANGE_COUNTDOWN = 'change-countdown'

const MESSAGE_FORCE_REFRESH = 'force-refresh';
const MESSAGE_WEIBO_DETAIL = 'weibo-detail';
const MESSAGE_GET_COUNTDOWN = 'countdown-list';

export {MESSAGE_SETTINGS_UPDATE, MESSAGE_SAN_UPDATE, MESSAGE_CARD_LIST_UPDATE, MESSAGE_DUN_INFO_UPDATE};
export {MESSAGE_SAN_GET, MESSAGE_DUN_INFO_GET, MESSAGE_CARD_LIST_GET,MESSAGE_CHANGE_COUNTDOWN};
export {MESSAGE_FORCE_REFRESH, MESSAGE_WEIBO_DETAIL,MESSAGE_GET_COUNTDOWN};
// endregion

// region 平台类型
const PLATFORM_CHROME = 'Chrome';
const PLATFORM_FIREFOX = 'Firefox';
const PLATFORM_EDGE = 'Edge';
const PLATFORM_NODE = 'Node';
const PLATFORM_UNKNOWN = 'Unknown';

export {PLATFORM_CHROME, PLATFORM_FIREFOX, PLATFORM_EDGE, PLATFORM_NODE, PLATFORM_UNKNOWN};
// endregion

// region 扩展内置页面
const PAGE_WELCOME = 'welcome.html';
const PAGE_OPTIONS = 'options.html';
const PAGE_DONATE = 'donate.html';
const PAGE_UPDATE = 'update.html';
const PAGE_TIME = 'time.html';
const PAGE_POPUP_WINDOW = 'popup.html';
const PAGE_GITHUB_REPO = 'https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue';

export {PAGE_WELCOME, PAGE_POPUP_WINDOW, PAGE_OPTIONS, PAGE_DONATE, PAGE_UPDATE, PAGE_GITHUB_REPO,PAGE_TIME};
// endregion

// region 杂项
const TOOL_QR_URL = 'https://arknightscommunity.drblack-system.com/15386.html';
const CANTEEN_INTERFACE_LIST = ['http://api.ceobecanteen.top/'];
// TODO 直接从common.js里面copy过来的，等待优化重构
const quickJump = {
  source: [
    {
      url: "https://ak.hypergryph.com/#information",
      name: "官方网站",
      img: '/assets/image/icon/mrfz.ico'
    },
    {
      url: "https://space.bilibili.com/161775300/dynamic",
      name: "官方哔哩哔哩",
      img: '/assets/image/icon/bili.ico'
    },
    {
      url: "https://weibo.com/arknights",
      name: "官方微博",
      img: '/assets/image/icon/weibo.ico'
    },
    {
      url: "https://weibo.com/u/6441489862",
      name: "朝陇山微博",
      img: '/assets/image/icon/cho3Weibo.jpg',
      radius: true,
    },
    {
      url: "https://weibo.com/u/7506039414",
      name: "一拾山微博",
      img: '/assets/image/icon/ys3Weibo.jpg',
      radius: true,
    },
    {
      url: "https://monster-siren.hypergryph.com/",
      name: "塞壬官网",
      img: '/assets/image/icon/sr.ico',
      radius: true,
    },
    {
      url: "https://weibo.com/u/7499841383",
      name: "泰拉记事社微博",
      img: '/assets/image/icon/tlWeibo.jpg',
      radius: true,
    },
    {
      url: "https://terra-historicus.hypergryph.com/",
      name: "泰拉记事社官网",
      img: '/assets/image/icon/tl.jpg',
      radius: true,
    },
    {
      url: "https://weibo.com/u/7461423907",
      name: "鹰角网络微博",
      img: '/assets/image/icon/yjwb.jpg',
      radius: true,
    },
  ],
  tool: [
    {
      url: "http://prts.wiki/",
      name: "PRTS.Wiki",
      img: "/assets/image/link/akwiki.png",
      radius: true,
    },
    {
      url: "https://mapcn.ark-nights.com",
      name: "PRTS.Map",
      img: "/assets/image/link/akmap.ico",
      radius: true,
    },
    {
      url: "https://penguin-stats.cn/",
      name: "企鹅物流",
      img: "/assets/image/link/penguin_stats_logo.webp",
      radius: true,
    },
    {
      url: "https://arkn.lolicon.app/#/",
      name: "明日方舟工具箱",
      img: "/assets/image/link/arktools.png",
      radius: true,
    },
    {
      url: "https://opssr.net/",
      name: "源石作战室",
      img: "/assets/image/link/yszzs.png",
      radius: true,
    },
    {
      url: "https://kokodayo.fun/",
      name: "Kokodayo",
      img: "/assets/image/link/kkdy.png",
      radius: true,
    },
    {
      url: "https://aog.wiki/",
      name: "刷素材一图流",
      img: "/assets/image/link/akgraph.ico",
      radius: true,
    },
    {
      url: "https://viktorlab.cn/akdata/",
      name: "Arknight DPS",
      img: "/assets/image/link/dps.ico",
      radius: true,
    },
    {
      url: "https://arknightscommunity.drblack-system.com/",
      name: "泰拉通讯枢纽",
      img: "/assets/image/link/tltxsn.png",
      radius: false,
    },
    {
      url: "../time.html",
      name: "小刻食堂计时器",
      img: "/assets/image/icon.png",
      radius: false,
    },
  ],
  url: []
};

const dayInfo = [
  {
    type: 1,
    name: "高级作战记录",
    day: [1, 2, 3, 4, 5, 6, 0],
    src: '/assets/image/game/LS.png'
  },
  {
    type: 2,
    name: "龙门币",
    day: [2, 4, 6, 0],
    src: '/assets/image/game/CE.png'
  },
  {
    type: 3,
    name: "采购凭证",
    day: [1, 4, 6, 0],
    src: '/assets/image/game/AP.png'
  },
  {
    type: 4,
    name: "碳素",
    day: [1, 3, 5, 6],
    src: '/assets/image/game/SK.png'
  },
  {
    type: 5,
    name: "技巧概要",
    day: [2, 3, 5, 0],
    src: '/assets/image/game/CA.png'
  },
  {
    type: 6,
    name: "摧枯拉朽",
    day: [1, 2, 5, 6],
    src: '/assets/image/game/PRB.png'
  },
  {
    type: 7,
    name: "身先士卒",
    day: [2, 3, 6, 0],
    src: '/assets/image/game/PRD.png'
  },
  {
    type: 8,
    name: "固若金汤",
    day: [1, 4, 5, 0],
    src: '/assets/image/game/PRA.png'
  },
  {
    type: 9,
    name: "势不可当",
    day: [3, 4, 6, 0],
    src: '/assets/image/game/PRC.png'
  },
];

const countDown = [
  {
    index:1,
    name: '公招倒计时1',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime:new Date(2021,1,1,9,0,0),
    stopTime:null,
  },
  {index:2,
    name: '公招倒计时2',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime:new Date(2021,1,1,9,0,0)
  },
  {
    index:3,
    name: '公招倒计时3',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime:new Date(2021,1,1,9,0,0)
  },
  {
    index:4,
    name: '公招倒计时4',
    selectableRange: '00:00:00 - 09:00:00',
    pickerTime:new Date(2021,1,1,9,0,0)
  },
  {
    index:5,
    name: '线索交流倒计时',
    pickerTime:new Date(2021,1,1,23,59,59)
  },
  {
    index:6,
    name: '专精倒计时',
    pickerTime:new Date(2021,1,1,23,59,59)
  },
  {
    index:7,
    name: '办公室倒计时',
    pickerTime:new Date(2021,1,1,23,59,59)
  },
  {
    index:8,
    name: '备用',
    pickerTime:new Date(2021,1,1,23,59,59)
  }
];

export {quickJump, dayInfo,countDown, TOOL_QR_URL, CANTEEN_INTERFACE_LIST};
// endregion
