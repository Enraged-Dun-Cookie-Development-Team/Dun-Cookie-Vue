// noinspection JSNonASCIINames

import {BilibiliDataSource} from './def/BilibiliDataSource';
import {WeiboDataSource} from './def/WeiboDataSource';
import {InGameAnnouncementDataSource} from './def/InGameAnnouncementDataSource';
import {MonsterSirenDataSource} from './def/MonsterSirenDataSource';
import {ArknightsOfficialWebDataSource} from './def/ArknightsOfficialWebDataSource';
import {TerraHistoricusDataSource} from './def/TerraHistoricusDataSource';
import {NeteaseCloudMusicDataSource} from './def/NeteaseCloudMusicDataSource';
import {USE_TEST_URL} from '../Constants';
import {DataSourceConfig} from "./DataSource";

async function buildDefaultDataSourcesList() {
    const promiseList = [];
    for (const config of configList) {
        if (config.constructor === Promise) {
            promiseList.push(config);
        } else if (!!config.dataName) {
            promiseList.push(Promise.resolve(config))
        }
    }
    const results = await Promise.allSettled(promiseList)
    const sources = {};
    for (const result of results) {
        if (result.status) {
            if (result.value) {
                sources[result.value.dataName] = result.value;
            } else {
                console.error(result);
            }
        } else {
            console.error(result.reason);
        }
    }
    return sources;
}

function setTestUrl(sources) {

    // 感觉没必要给DataSource多一个testUrl的属性，测试链接在这里修改吧
    sources['官方B站动态'].dataUrl = PlatformHelper.Extension.getURL('test/bJson.json');
    sources['官方微博'].dataUrl = PlatformHelper.Extension.getURL('test/wJson.json');
    sources['游戏内公告'].dataUrl = PlatformHelper.Extension.getURL('test/yJson.json');
    sources['朝陇山微博'].dataUrl = PlatformHelper.Extension.getURL('test/cJson.json');
    sources['一拾山微博'].dataUrl = PlatformHelper.Extension.getURL('test/ysJson.json');
    sources['塞壬唱片官网'].dataUrl = PlatformHelper.Extension.getURL('test/srJson.json');
    sources['泰拉记事社微博'].dataUrl = PlatformHelper.Extension.getURL('test/tlJson.json');
    sources['官网'].dataUrl = PlatformHelper.Extension.getURL('test/gw.html');
    sources['泰拉记事社官网'].dataUrl = PlatformHelper.Extension.getURL('test/tljssJson.json');
    sources['塞壬唱片网易云音乐'].dataUrl = PlatformHelper.Extension.getURL('test/wyyJson.json');
    sources['鹰角网络微博'].dataUrl = PlatformHelper.Extension.getURL('test/yjwbJson.json');
}

const SHARE_DEFAULT_GROUP = 'share';

/**
 * 默认数据源
 * @type {(DataSource|Promise<DataSource>)[]}
 */
const configList = [
    BilibiliDataSource.withUid(161775300, (config) => {
        config
          .icon('/assets/image/icon/bili.ico')
          .dataName('官方B站动态')
          .title('哔哩哔哩')
          .priority(0);
    }),
    WeiboDataSource.withUid(6279793937, (config) => {
        config
          .icon('/assets/image/icon/weibo.ico')
          .dataName('官方微博')
          .title('微博')
          .priority(1);
    }),
    new InGameAnnouncementDataSource(
      DataSourceConfig.builder()
        .icon('/assets/image/txz.jpg')
        .dataName('游戏内公告')
        .title('通讯组')
        .dataUrl('https://ak-conf.hypergryph.com/config/prod/announce_meta/Android/announcement.meta.json')
        .priority(2)
        .build()
    ),
    WeiboDataSource.withUid(6441489862, (config) => {
        config
          .icon('/assets/image/icon/cho3Weibo.jpg')
          .dataName('朝陇山微博')
          .title('朝陇山')
          .priority(3);
    }),
    WeiboDataSource.withUid(7506039414, (config) => {
        config
          .icon('/assets/image/icon/ys3Weibo.jpg')
          .dataName('一拾山微博')
          .title('一拾山')
          .priority(4)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    new MonsterSirenDataSource(
      DataSourceConfig.builder()
        .icon('/assets/image/sr.png')
        .dataName('塞壬唱片官网')
        .title('塞壬唱片')
        .dataUrl('https://monster-siren.hypergryph.com/api/news')
        .priority(5)
        .build()
    ),
    WeiboDataSource.withUid(7499841383, (config) => {
        config
          .icon('/assets/image/icon/tlWeibo.jpg')
          .dataName('泰拉记事社微博')
          .title('泰拉记事社微博')
          .priority(6)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    new ArknightsOfficialWebDataSource(
      DataSourceConfig.builder()
        .icon('/assets/image/icon/mrfz.ico')
        .dataName('官网')
        .title('官网网站')
        .dataUrl('https://ak.hypergryph.com/')
        .priority(7)
        .build()
    ),
    new TerraHistoricusDataSource(
      DataSourceConfig.builder()
        .icon('/assets/image/icon/tl.jpg')
        .dataName('泰拉记事社官网')
        .title('泰拉记事社官网')
        .dataUrl('https://terra-historicus.hypergryph.com/api/comic')
        .priority(8)
        .build()
    ),
    NeteaseCloudMusicDataSource.withUid(32540734, (config) => {
        config
          .icon('/assets/image/wyyyy.ico')
          .dataName('塞壬唱片网易云音乐')
          .title('网易云音乐')
          .priority(9);
    }),
    WeiboDataSource.withUid(7461423907, (config) => {
        config
          .icon('/assets/image/icon/yjwb.jpg')
          .dataName('鹰角网络微博')
          .title('鹰角网络微博')
          .priority(10)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    BilibiliDataSource.withUid(1265652806, (config) => {
        config
          .icon('/assets/image/icon/arkzmd.jpg')
          .dataName('明日方舟终末地')
          .title('明日方舟终末地')
          .priority(11)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    BilibiliDataSource.withUid(1883857209, (config) => {
        config
          .priority(12)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    BilibiliDataSource.withUid(1554642444, (config) => {
        config
          .priority(13)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    BilibiliDataSource.withUid(2123591088, (config) => {
        config
          .priority(14)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    WeiboDataSource.withUid(7683268725, (config) => {
        config
          .priority(15)
          .groupId(SHARE_DEFAULT_GROUP);
    }),
    NeteaseCloudMusicDataSource.withUid(50653540, (config) => {
        config
          .priority(16);
    }),
];


/**
 * 需要添加/修改数据源应该在上方configList操作
 * @see configList
 */
const defaultDataSources = {};
const defaultDataSourcesList = [];
const initPromise = buildDefaultDataSourcesList().then(res => {
    Object.assign(defaultDataSources, res);
    if (USE_TEST_URL) {
        setTestUrl(defaultDataSources);
    }
    const list = [];
    for (const key in defaultDataSources) {
        if (defaultDataSources.hasOwnProperty(key)) {
            list.push(defaultDataSources[key]);
        }
    }
    // 按优先级排序
    list.sort((a, b) => a.priority - b.priority);
    // 冻结所有默认数据源，避免被意外修改
    list.map(val => Object.freeze(val));
    defaultDataSourcesList.splice(0);
    defaultDataSourcesList.push(...list);
});

async function getDefaultDataSources() {
    await initPromise;
    return defaultDataSources;
}

async function getDefaultDataSourcesList() {
    await initPromise;
    return defaultDataSourcesList;
}

export {getDefaultDataSources, getDefaultDataSourcesList};
