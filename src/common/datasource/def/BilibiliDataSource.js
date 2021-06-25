import {DataSource} from '../DataSource';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';

/**
 * 哔哩哔哩数据源。
 * <p>
 */
export class BilibiliDataSource extends DataSource {

  static get typeName() {
    return 'bilibili_dynamic';
  };

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
      data.data.cards.forEach(x => {
        const dynamicInfo = JSON.parse(x.card);
        const builder = DataItem.builder(opt.dataName)
          .id(x.desc.timestamp)
          .timeForSort(x.desc.timestamp * 1000)
          .timeForDisplay(TimeUtil.format(new Date(x.desc.timestamp * 1000), 'yyyy-MM-dd hh:mm:ss'))
          .jumpUrl(`https://t.bilibili.com/${x.desc.dynamic_id_str}`)
          .imageList(dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src));

        switch (parseInt(x.desc.type)) {
          // 普通动态
          case 2: {
            builder
              .coverImage((dynamicInfo.item.pictures && dynamicInfo.item.pictures.length > 0) ? dynamicInfo.item.pictures[0].img_src : null)
              .content(dynamicInfo.item.description);
            break;
          }
          // 无图片动态
          case 4: {
            builder
              .content(dynamicInfo.item.content);
            break;
          }
          // 视频
          case 8: {
            builder
              .coverImage(dynamicInfo.pic)
              .content(dynamicInfo.dynamic);
            break;
          }
          // 专栏
          case 64: {
            builder
              .coverImage((dynamicInfo.image_urls && dynamicInfo.image_urls.length > 0) ? dynamicInfo.image_urls[0] : null)
              .content(dynamicInfo.summary);
            break;
          }
          // 不支持的类型直接返回
          default:
            return;
        }
        list.push(builder.build());
      });
      return list;
    }
  }
}
