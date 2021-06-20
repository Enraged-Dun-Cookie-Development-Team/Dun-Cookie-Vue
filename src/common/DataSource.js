import HttpUtil from './HttpUtil';
import {BiliBiliProcessor} from '../background/processors/BiliBiliProcessor';
import {WeiboProcessor} from '../background/processors/WeiboProcessor';
import {DevNewsProcessor} from '../background/processors/DevNewsProcessor';
import {MonsterSirenProcessor} from '../background/processors/MonsterSirenProcessor';
import {ArknightsOfficialWebProcessor} from '../background/processors/ArknightsOfficialWebProcessor';
import {TerraHistoricusProcessor} from '../background/processors/TerraHistoricusProcessor';
import {NeteaseCloudMusicProcessor} from '../background/processors/NeteaseCloudMusicProcessor';

/**
 * 表示一个数据源
 */
class DataSource {
  /**
   * 用于在设置页面中显示的图标
   */
  icon;
  /**
   * 数据名称(比如朝陇山，泰拉记事社等)，每个数据源必须有一个唯一的dataName，不能重复
   */
  dataName;
  /**
   * 弹窗标题
   */
  title;
  /**
   * 旧的判断数据源的字段
   * TODO 重构后应该不需要该字段，改为使用dataName判断(考虑将这个字段改为priority用来控制在设置页面的显示顺序)
   */
  source;

  /**
   * 用于获取数据的URL，可以是string或array
   */
  dataUrl;

  /**
   * 处理器
   */
  processor;

  constructor(icon, dataName, title, dataUrl, processor, source) {
    this.icon = icon;
    this.dataName = dataName;
    this.title = title;
    this.dataUrl = dataUrl;
    this.processor = processor;
    this.source = source;
  }

  fetchData(kazeLocalData, kazeFun) {
    let promise;
    if (typeof this.dataUrl === 'string') {
      promise = HttpUtil.GET(this.__appendTimeStamp(this.dataUrl));
    } else if (Array.isArray(this.dataUrl)) {
      promise = Promise.all(
        this.dataUrl.map(url =>
          HttpUtil.GET(this.__appendTimeStamp(url))
        )
      );
    } else {
      console.log(`无效的dataUrl：${this.dataUrl}`);
      return new Promise((_, reject) => {
        reject(this.dataUrl)
      });
    }
    return promise.then(value => {
      let opt = {
        url: this.dataUrl,//网址
        title: this.title,//弹窗标题
        dataName: this.dataName,//数据源对象名称
        source: this.source,
        responseText: value,
      };
      return this.processor.process(opt, kazeLocalData, kazeFun);
    });
  }

  __appendTimeStamp(url) {
    if (url.indexOf('?') >= 0) {
      return `${url}&t=${new Date().getTime()}`;
    } else {
      return `${url}?t=${new Date().getTime()}`;
    }
  }
}

const defaultDataSources = [
  new DataSource(
    '/assets/image/bili.ico',
    '官方B站动态',
    'B站',
    'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web',
    new BiliBiliProcessor(),
    0
  ),
  new DataSource(
    '/assets/image/weibo.ico',
    '官方微博',
    '官方微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
    new WeiboProcessor(),
    1
  ),
  new DataSource(
    '/assets/image/txz.ico',
    '游戏内公告',
    '通讯组',
    'https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json',
    new DevNewsProcessor(),
    2
  ),
  new DataSource(
    '/assets/image/cho3Weibo.ico',
    '朝陇山微博',
    '朝陇山',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
    new WeiboProcessor(),
    3
  ),
  new DataSource(
    '/assets/image/cho3Weibo.ico',
    '一拾山微博',
    '一拾山',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
    new WeiboProcessor(),
    4
  ),
  new DataSource(
    '/assets/image/sr.ico',
    '塞壬唱片官网',
    '塞壬唱片',
    'https://monster-siren.hypergryph.com/api/news',
    new MonsterSirenProcessor(),
    5
  ),
  new DataSource(
    '/assets/image/tlWeibo.ico',
    '泰拉记事社微博',
    '泰拉记事社微博',
    'https://m.weibo.cn/api/container/getIndex?type=uid&value=7499841383&containerid=1076037499841383',
    new WeiboProcessor(),
    6
  ),
  new DataSource(
    '/assets/image/mrfz.ico',
    '官网',
    '官网',
    'https://ak.hypergryph.com/',
    new ArknightsOfficialWebProcessor(),
    7
  ),
  new DataSource(
    '/assets/image/tl.ico',
    '泰拉记事社官网',
    '泰拉记事社',
    ['https://terra-historicus.hypergryph.com/api/comic/7748', 'https://terra-historicus.hypergryph.com/api/comic/2865'],
    new TerraHistoricusProcessor(),
    8
  ),
  new DataSource(
    '/assets/image/wyyyy.ico',
    '塞壬唱片网易云音乐',
    '网易云音乐',
    'http://music.163.com/api/artist/albums/32540734',
    new NeteaseCloudMusicProcessor(),
    9
  ),
];

export {DataSource, defaultDataSources};
