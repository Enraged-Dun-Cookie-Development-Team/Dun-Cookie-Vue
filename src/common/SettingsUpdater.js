import { CURRENT_SETTING_VERSION } from './Constants';
import { deepAssign } from './util/CommonFunctions';
import AvailableDataSourceMeta from './sync/AvailableDataSourceMeta';

async function updateLegacyToV1(oldSettings) {
  console.log('从旧配置升级：');
  console.log(oldSettings);
  const newSettings = {
    dun: {},
    display: {},
    san: {},
  };

  if (oldSettings.hasOwnProperty('time')) newSettings.dun.intervalTime = oldSettings.time;
  if (oldSettings.hasOwnProperty('fontsize')) newSettings.display.fontSize = oldSettings.fontsize;
  if (oldSettings.hasOwnProperty('imgshow')) newSettings.display.showImage = oldSettings.imgshow;
  if (oldSettings.hasOwnProperty('isTag')) newSettings.display.showByTag = oldSettings.isTag;
  if (oldSettings.hasOwnProperty('tagActiveName')) newSettings.display.defaultTag = oldSettings.tagActiveName;
  if (oldSettings.hasOwnProperty('isTop')) newSettings.dun.sortModeForOnlyDate = oldSettings.isTop ? 1 : 2;
  if (oldSettings.hasOwnProperty('isPush')) newSettings.dun.enableNotice = oldSettings.isPush;
  if (oldSettings.hasOwnProperty('darkshow')) newSettings.display.darkMode = oldSettings.darkshow;
  if (oldSettings.hasOwnProperty('lowfrequency')) newSettings.dun.autoLowFrequency = oldSettings.lowfrequency;
  if (oldSettings.hasOwnProperty('lowfrequencyTime')) newSettings.dun.lowFrequencyTime = oldSettings.lowfrequencyTime;
  if (oldSettings.hasOwnProperty('retweeted')) newSettings.dun.showRetweet = oldSettings.retweeted;
  if (oldSettings.hasOwnProperty('sanShow')) newSettings.san.noticeWhenFull = oldSettings.sanShow;
  if (oldSettings.hasOwnProperty('saneMax')) newSettings.san.maxValue = oldSettings.saneMax;
  if (oldSettings.hasOwnProperty('isWindow')) newSettings.display.windowMode = oldSettings.isWindow;

  console.log('升级完毕，新配置：');
  console.log(newSettings);
  return newSettings;
}

function updateV1ToV2(oldSettings) {
  console.log('从V1配置升级：');
  console.log(oldSettings);
  const newSettings = deepAssign({}, oldSettings);

  Reflect.deleteProperty(newSettings, 'currentDataSources');

  console.log('升级V2完毕，新配置：');
  console.log(newSettings);
  return newSettings;
}

function updateV2ToV3(oldSettings) {
  console.log('从V2配置升级：');
  console.log(oldSettings);
  const newSettings = deepAssign({}, oldSettings);

  switch (newSettings.dun?.gamePlatform) {
    case 'Android':
      newSettings.dun.gamePlatform = 'official/Android';
      break;
    case 'IOS':
      newSettings.dun.gamePlatform = 'official/IOS';
      break;
    default:
      newSettings.dun.gamePlatform = 'official/Android';
      break;
  }

  console.log('升级V3完毕，新配置：');
  console.log(newSettings);
  return newSettings;
}

async function updateV3ToV4(oldSettings) {
  console.log('从V3配置升级：');
  console.log(oldSettings);
  const newSettings = deepAssign({}, oldSettings);

  newSettings.open = false;
  newSettings.enableDataSources = oldSettings.enableDataSources
    .map((dataName) => {
      switch (dataName) {
        case '官方B站动态':
          return { type: 'bilibili:dynamic-by-uid', dataId: '161775300' };
        case '官方微博':
          return { type: 'weibo:dynamic-by-uid', dataId: '6279793937' };
        case '游戏内公告':
          return { type: 'arknights-game:bulletin-list', dataId: '-' };
        case '朝陇山微博':
          return { type: 'weibo:dynamic-by-uid', dataId: '6441489862' };
        case '一拾山微博':
          return { type: 'weibo:dynamic-by-uid', dataId: '7506039414' };
        case '塞壬唱片官网':
          return { type: 'arknights-website:monster-siren', dataId: '-' };
        case '泰拉记事社微博':
          return { type: 'weibo:dynamic-by-uid', dataId: '7499841383' };
        case '官网':
          return { type: 'arknights-website:official-website', dataId: '-' };
        case '泰拉记事社官网':
          return { type: 'arknights-website:terra-historicus', dataId: '-' };
        case '塞壬唱片网易云音乐':
          return { type: 'netease-cloud-music:albums-by-artist', dataId: '32540734' };
        case '鹰角网络微博':
          return { type: 'weibo:dynamic-by-uid', dataId: '7461423907' };
        case '明日方舟终末地':
          return { type: 'bilibili:dynamic-by-uid', dataId: '1265652806' };
        case 'bilibili_dynamic_1883857209':
          return { type: 'bilibili:dynamic-by-uid', dataId: '1883857209' };
        case 'bilibili_dynamic_1554642444':
          return { type: 'bilibili:dynamic-by-uid', dataId: '1554642444' };
        case 'bilibili_dynamic_2123591088':
          return { type: 'bilibili:dynamic-by-uid', dataId: '2123591088' };
        case 'weibo_7683268725':
          return { type: 'weibo:dynamic-by-uid', dataId: '7683268725' };
        case 'music.163.com_50653540':
          return { type: 'netease-cloud-music:albums-by-artist', dataId: '50653540' };
        case 'weibo_7745672941':
          return { type: 'weibo:dynamic-by-uid', dataId: '7745672941' };
        case '明日方舟终末地微博':
          return { type: 'weibo:dynamic-by-uid', dataId: '7745672941' };
        default:
          return;
      }
    })
    .filter((it) => !!it);
  if (oldSettings.dun.gamePlatform) {
    const platform = oldSettings.dun.gamePlatform;
    if (platform.toLowerCase().indexOf('android') >= 0) {
      newSettings.enableDataSources.push({ type: 'arknights-game:bulletin-list', dataId: 'Android' });
      newSettings.enableDataSources.push({ type: 'arknights-game:version', dataId: 'Android' });
    } else if (platform.toLowerCase().indexOf('ios') >= 0) {
      newSettings.enableDataSources.push({ type: 'arknights-game:bulletin-list', dataId: 'IOS' });
      newSettings.enableDataSources.push({ type: 'arknights-game:version', dataId: 'IOS' });
    } else if (platform.toLowerCase().indexOf('bilibili') >= 0) {
      newSettings.enableDataSources.push({ type: 'arknights-game:bulletin-list', dataId: 'Bilibili' });
      newSettings.enableDataSources.push({ type: 'arknights-game:version', dataId: 'Bilibili' });
    }
  }
  delete newSettings.dun.gamePlatform;
  delete newSettings.display.showByTag;
  delete newSettings.display.defaultTag;

  await new Promise((resolve) => {
    AvailableDataSourceMeta.doAfterInit(() => {
      oldSettings.customDataSources.map((custom) => {
        const type = custom.type === 'bilibili_dynamic' ? 'bilibili:dynamic-by-uid' : 'weibo:dynamic-by-uid';
        const dataId = custom.arg;
        AvailableDataSourceMeta.custom[`${type}:${dataId}`] = { type, dataId };
      });
      resolve();
    });
  });

  console.log('升级V4完毕，新配置：');
  console.log(newSettings);
  return newSettings;
}

function updateV4ToV5(oldSettings) {
  console.log('从V4配置升级：');
  console.log(oldSettings);
  const newSettings = deepAssign({}, oldSettings);

  // 由于上个版本更新后再次进行了修改，上个版本部分用户漏删了这两个字段，这个版本再次执行删除
  delete newSettings.display.showByTag;
  delete newSettings.display.defaultTag;
  // 这个是上版本完全忘记删的
  delete newSettings.customDataSources;

  if (newSettings.open) {
    newSettings.agreeLicense = 'v1';
  }

  console.log('升级V5完毕，新配置：');
  console.log(newSettings);
  return newSettings;
}

function updateV5ToV6(oldSettings) {
  console.log('从V5配置升级：');
  console.log(oldSettings);
  const newSettings = deepAssign({}, oldSettings);

  // 删除上个版本单独存放的quickJump
  PlatformHelper.Storage.removeLocalStorage('quickJump');

  newSettings.quickJump = {
    source: [],
    tool: [
      [
        {
          id: 'local_ceobe_canteen_timer',
          localized_name: {
            zh_CN: '小刻食堂计时器',
            en_US: 'Ceobe Canteen Timer',
          },
          localized_description: {
            zh_CN: '',
            en_US: '',
          },
          localized_slogen: {
            zh_CN: '',
            en_US: '',
          },
          localized_tags: {
            zh_CN: [],
            en_US: [],
          },
          icon_url: '/assets/image/icon.png',
          links: [
            {
              primary: true,
              regionality: 'CHINA_MAINLAND',
              localized_name: {
                zh_CN: '小刻食堂计时器',
                en_US: 'Ceobe Canteen Timer',
              },
              url: '../time.html',
            },
          ],
          isActivated: true,
        },
      ],
    ],
  };

  console.log('升级V6完毕，新配置：');
  console.log(newSettings);
  return newSettings;
}

async function updateSettings(oldSettings) {
  // 版本号一致直接返回
  if (parseInt(oldSettings.version) === CURRENT_SETTING_VERSION) {
    return oldSettings;
  }
  // 无版本号的旧配置文件升级
  if (!oldSettings.version) {
    oldSettings = await updateLegacyToV1(oldSettings);
  }

  let currentVersion = parseInt(oldSettings.version);
  let currentSettings = deepAssign({}, oldSettings);
  Reflect.deleteProperty(currentSettings, 'version');
  while (currentVersion < CURRENT_SETTING_VERSION) {
    switch (currentVersion) {
      case 1:
        currentSettings = updateV1ToV2(currentSettings);
        break;
      case 2:
        currentSettings = updateV2ToV3(currentSettings);
        break;
      case 3:
        currentSettings = await updateV3ToV4(currentSettings);
        break;
      case 4:
        currentSettings = updateV4ToV5(currentSettings);
        break;
      case 5:
        currentSettings = updateV5ToV6(currentSettings);
        break;
    }
    currentVersion++;
  }
  currentSettings.version = CURRENT_SETTING_VERSION;
  return currentSettings;
}

export { updateSettings };
