import {BilibiliDataSource} from './datasources/BilibiliDataSource';
import {WeiboDataSource} from './datasources/WeiboDataSource';
import {InGameAnnouncementDataSource} from './datasources/InGameAnnouncementDataSource';
import {MonsterSirenDataSource} from './datasources/MonsterSirenDataSource';
import {ArknightsOfficialWebDataSource} from './datasources/ArknightsOfficialWebDataSource';
import {TerraHistoricusDataSource} from './datasources/TerraHistoricusDataSource';
import {NeteaseCloudMusicDataSource} from './datasources/NeteaseCloudMusicDataSource';

/**
 * 默认数据源
 * @type {DataSource[]}
 */
const defaultDataSources = [
  new BilibiliDataSource(
    '/assets/image/bili.ico',
    '官方B站动态',
    'B站',
    'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web',
    0
  ),
  new WeiboDataSource(
    '/assets/image/weibo.ico',
    '官方微博',
    '官方微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
    1
  ),
  new InGameAnnouncementDataSource(
    '/assets/image/txz.ico',
    '游戏内公告',
    '通讯组',
    'https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json',
    2
  ),
  new WeiboDataSource(
    '/assets/image/cho3Weibo.ico',
    '朝陇山微博',
    '朝陇山',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
    3
  ),
  new WeiboDataSource(
    '/assets/image/cho3Weibo.ico',
    '一拾山微博',
    '一拾山',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
    4
  ),
  new MonsterSirenDataSource(
    '/assets/image/sr.ico',
    '塞壬唱片官网',
    '塞壬唱片',
    'https://monster-siren.hypergryph.com/api/news',
    5
  ),
  new WeiboDataSource(
    '/assets/image/tlWeibo.ico',
    '泰拉记事社微博',
    '泰拉记事社微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7499841383&containerid=1076037499841383',
    6
  ),
  new ArknightsOfficialWebDataSource(
    '/assets/image/mrfz.ico',
    '官网',
    '官网',
    'https://ak.hypergryph.com/',
    7
  ),
  new TerraHistoricusDataSource(
    '/assets/image/tl.ico',
    '泰拉记事社官网',
    '泰拉记事社',
    ['https://terra-historicus.hypergryph.com/api/comic/7748', 'https://terra-historicus.hypergryph.com/api/comic/2865'],
    8
  ),
  new NeteaseCloudMusicDataSource(
    '/assets/image/wyyyy.ico',
    '塞壬唱片网易云音乐',
    '网易云音乐',
    'http://music.163.com/api/artist/albums/32540734',
    9
  ),
];

export default defaultDataSources;
