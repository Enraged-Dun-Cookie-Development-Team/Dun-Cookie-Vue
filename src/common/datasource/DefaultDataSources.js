// noinspection JSNonASCIINames

import {BilibiliDataSource} from './def/BilibiliDataSource';
import {WeiboDataSource} from './def/WeiboDataSource';
import {InGameAnnouncementDataSource} from './def/InGameAnnouncementDataSource';
import {MonsterSirenDataSource} from './def/MonsterSirenDataSource';
import {ArknightsOfficialWebDataSource} from './def/ArknightsOfficialWebDataSource';
import {TerraHistoricusDataSource} from './def/TerraHistoricusDataSource';
import {NeteaseCloudMusicDataSource} from './def/NeteaseCloudMusicDataSource';
import {ArknightsAnimeDataSource} from './def/ArknightsAnimeDataSource';
import {IS_DEBUG} from '../Constants';

function buildDatasource(promise, icon, dataName, title) {
    return promise.then(source => {
        source.icon = icon;
        source.dataName = dataName;
        source.title = title;
        return source;
    });
}

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
    sources['动画官网资讯'].dataUrl = PlatformHelper.Extension.getURL('test/anime.json');
}

/**
 * 默认数据源
 * @type {(DataSource|Promise)[]}
 */
const configList = [
    buildDatasource(BilibiliDataSource.withUid(161775300, 0), '/assets/image/icon/bili.ico', '官方B站动态', '哔哩哔哩'),
    buildDatasource(WeiboDataSource.withUid(6279793937, 1), '/assets/image/icon/weibo.ico', '官方微博', '微博'),
    new InGameAnnouncementDataSource(
        '/assets/image/txz.jpg',
        '游戏内公告',
        '通讯组',
        'https://ak-conf.hypergryph.com/config/prod/announce_meta/Android/announcement.meta.json',
        2
    ),
    buildDatasource(WeiboDataSource.withUid(6441489862, 3), '/assets/image/icon/cho3Weibo.jpg', '朝陇山微博', '朝陇山'),
    buildDatasource(WeiboDataSource.withUid(7506039414, 4), '/assets/image/icon/ys3Weibo.jpg', '一拾山微博', '一拾山'),
    new MonsterSirenDataSource(
        '/assets/image/sr.png',
        '塞壬唱片官网',
        '塞壬唱片',
        'https://monster-siren.hypergryph.com/api/news',
        5
    ),
    buildDatasource(WeiboDataSource.withUid(7499841383, 6), '/assets/image/icon/tlWeibo.jpg', '泰拉记事社微博', '泰拉记事社微博'),
    new ArknightsOfficialWebDataSource(
        '/assets/image/icon/mrfz.ico',
        '官网',
        '官网网站',
        'https://ak.hypergryph.com/',
        7
    ),
    new TerraHistoricusDataSource(
        '/assets/image/icon/tl.jpg',
        '泰拉记事社官网',
        '泰拉记事社官网',
        'https://terra-historicus.hypergryph.com/api/comic',
        8
    ),
    new NeteaseCloudMusicDataSource(
        '/assets/image/wyyyy.ico',
        '塞壬唱片网易云音乐',
        '网易云音乐',
        'https://music.163.com/api/artist/albums/32540734',
        9
    ),
    buildDatasource(WeiboDataSource.withUid(7461423907, 10), '/assets/image/icon/yjwb.jpg', '鹰角网络微博', '鹰角网络微博'),
    buildDatasource(BilibiliDataSource.withUid(1265652806, 11), '/assets/image/icon/arkzmd.jpg', '明日方舟终末地', '明日方舟终末地'),
    new ArknightsAnimeDataSource(
        '/assets/image/icon/anime.png',
        '动画官网资讯',
        '明日方舟动画',
        'https://ak.hypergryph.com/anime/api/news',
        10
    ),
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
