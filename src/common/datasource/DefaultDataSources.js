// noinspection JSNonASCIINames

import {BilibiliDataSource} from './def/BilibiliDataSource';
import {WeiboDataSource} from './def/WeiboDataSource';
import {InGameAnnouncementDataSource} from './def/InGameAnnouncementDataSource';
import {MonsterSirenDataSource} from './def/MonsterSirenDataSource';
import {ArknightsOfficialWebDataSource} from './def/ArknightsOfficialWebDataSource';
import {TerraHistoricusDataSource} from './def/TerraHistoricusDataSource';
import {NeteaseCloudMusicDataSource} from './def/NeteaseCloudMusicDataSource';
import {IS_DEBUG} from '../Constants';

/**
 * 默认数据源
 * @type {DataSource[]}
 */
const defaultDataSourcesList = [
  new BilibiliDataSource(
    '/assets/image/bili.ico',
    '官方B站动态',
    '哔哩哔哩',
    'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web',
    0
  ),
  new WeiboDataSource(
    '/assets/image/weibo.ico',
    '官方微博',
    '微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
    1
  ),
  new InGameAnnouncementDataSource(
    '/assets/image/txz.jpg',
    '游戏内公告',
    '通讯组',
    'https://ak-conf.hypergryph.com/config/prod/announce_meta/Android/announcement.meta.json',
    2
  ),
  new WeiboDataSource(
    '/assets/image/cho3Weibo.jpg',
    '朝陇山微博',
    '朝陇山',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
    3
  ),
  new WeiboDataSource(
    '/assets/image/ys3Weibo.jpg',
    '一拾山微博',
    '一拾山',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
    4
  ),
  new MonsterSirenDataSource(
    '/assets/image/sr.png',
    '塞壬唱片官网',
    '塞壬唱片',
    'https://monster-siren.hypergryph.com/api/news',
    5
  ),
  new WeiboDataSource(
    '/assets/image/tlWeibo.jpg',
    '泰拉记事社微博',
    '泰拉记事社微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7499841383&containerid=1076037499841383',
    6
  ),
  new ArknightsOfficialWebDataSource(
    '/assets/image/mrfz.ico',
    '官网',
    '官网网站',
    'https://ak.hypergryph.com/',
    7
  ),
  new TerraHistoricusDataSource(
    '/assets/image/tl.jpg',
    '泰拉记事社官网',
    '泰拉记事社官网',
    ['https://terra-historicus.hypergryph.com/api/comic/7748', 'https://terra-historicus.hypergryph.com/api/comic/2865', 'https://terra-historicus.hypergryph.com/api/comic/9382'],
    8
  ),
  new NeteaseCloudMusicDataSource(
    '/assets/image/wyyyy.ico',
    '塞壬唱片网易云音乐',
    '网易云音乐',
    'http://music.163.com/api/artist/albums/32540734',
    9
  ),
  new WeiboDataSource(
    '/assets/image/yjwb.jpg',
    '鹰角网络微博',
    '鹰角网络微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7461423907&containerid=1076037461423907',
    10
  ),
];

// 排序，会影响页面中的显示顺序
defaultDataSourcesList.sort((a, b) => a.priority - b.priority);

/**
 * 需要添加/修改数据源应该在上方列表操作
 * @see defaultDataSourcesList
 */
const defaultDataSources = {};
for (const source of defaultDataSourcesList) {
  defaultDataSources[source.dataName] = source;
}
const defaultDataSourcesNames = Object.keys(defaultDataSources);

// 感觉没必要给DataSource多一个testUrl的属性，测试链接在这里修改吧
if (IS_DEBUG) {
  defaultDataSources['官方B站动态'].dataUrl = 'test/bJson.json?host_uid=161775300';
  defaultDataSources['官方微博'].dataUrl = 'test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937';
  defaultDataSources['游戏内公告'].dataUrl = 'test/yJson.json';
  defaultDataSources['朝陇山微博'].dataUrl = 'test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862';
  defaultDataSources['一拾山微博'].dataUrl = 'test/ysJson.json?type=uid&value=7506039414&containerid=1076037506039414';
  defaultDataSources['塞壬唱片官网'].dataUrl = 'test/srJson.json';
  defaultDataSources['泰拉记事社微博'].dataUrl = 'test/tlJson.json?type=uid&value=6441489862&containerid=1076037499841383';
  defaultDataSources['官网'].dataUrl = 'test/gw.html';
  defaultDataSources['泰拉记事社官网'].dataUrl = ['test/xbJson.json', 'test/xgbJson.json'];
  defaultDataSources['塞壬唱片网易云音乐'].dataUrl = 'test/wyyJson.json';
  defaultDataSources['鹰角网络微博'].dataUrl = 'test/yjwbJson.json?type=uid&value=7461423907&containerid=1076037461423907';
}


export {defaultDataSources, defaultDataSourcesList, defaultDataSourcesNames};
