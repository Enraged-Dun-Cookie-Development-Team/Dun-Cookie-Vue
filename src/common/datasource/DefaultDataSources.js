// noinspection JSNonASCIINames

import {BilibiliDataSource} from './def/BilibiliDataSource';
import {WeiboDataSource} from './def/WeiboDataSource';
import {InGameAnnouncementDataSource} from './def/InGameAnnouncementDataSource';
import {MonsterSirenDataSource} from './def/MonsterSirenDataSource';
import {ArknightsOfficialWebDataSource} from './def/ArknightsOfficialWebDataSource';
import {TerraHistoricusDataSource} from './def/TerraHistoricusDataSource';
import {NeteaseCloudMusicDataSource} from './def/NeteaseCloudMusicDataSource';
import {IS_DEBUG} from '../Constants';
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

/**
 * 默认数据源
 * @type {(DataSource|Promise<DataSource>)[]}
 */
const configList = [
    BilibiliDataSource.withUid(161775300, (config) => {
        config.icon =  '/assets/image/icon/bili.ico';
        config.dataName = '官方B站动态';
        config.title = '哔哩哔哩';
        config.priority = 0;
    }),
    WeiboDataSource.withUid(6279793937, (config) => {
        config.icon =  '/assets/image/icon/weibo.ico';
        config.dataName = '官方微博';
        config.title = '微博';
        config.priority = 1;
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
        config.icon =  '/assets/image/icon/cho3Weibo.jpg';
        config.dataName = '朝陇山微博';
        config.title = '朝陇山';
        config.priority = 3;
    }),
    WeiboDataSource.withUid(7506039414, (config) => {
        config.icon =  '/assets/image/icon/ys3Weibo.jpg';
        config.dataName = '一拾山微博';
        config.title = '一拾山';
        config.priority = 4;
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
        config.icon =  '/assets/image/icon/tlWeibo.jpg';
        config.dataName = '泰拉记事社微博';
        config.title = '泰拉记事社微博';
        config.priority = 6;
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
    new NeteaseCloudMusicDataSource(
      DataSourceConfig.builder()
        .icon('/assets/image/wyyyy.ico')
        .dataName('塞壬唱片网易云音乐')
        .title('网易云音乐')
        .dataUrl('https://music.163.com/api/artist/albums/32540734')
        .priority(9)
        .build()
    ),
    WeiboDataSource.withUid(7461423907, (config) => {
        config.icon =  '/assets/image/icon/yjwb.jpg';
        config.dataName = '鹰角网络微博';
        config.title = '鹰角网络微博';
        config.priority = 10;
    }),
    BilibiliDataSource.withUid(1265652806, (config) => {
        config.icon =  '/assets/image/icon/arkzmd.jpg';
        config.dataName = '明日方舟终末地';
        config.title = '明日方舟终末地';
        config.priority = 11;
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
    if (IS_DEBUG) {
        setTestUrl(defaultDataSources);
    }
    const list = [];
    for (const key in defaultDataSources) {
        if (defaultDataSources.hasOwnProperty(key)) {
            list.push(defaultDataSources[key]);
        }
    }
    list.sort((a, b) => a.priority - b.priority);
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
