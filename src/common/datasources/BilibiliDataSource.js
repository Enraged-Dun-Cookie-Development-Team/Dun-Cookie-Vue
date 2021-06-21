import {DataSource} from '../DataSource';

/**
 * 哔哩哔哩数据源。
 * <p>
 */
export class BilibiliDataSource extends DataSource {

  constructor(icon, dataName, title, dataUrl, source) {
    super(icon, dataName, title, dataUrl, source);
  }

  processData(opt) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
      data.data.cards.forEach(x => {
        if (x.desc.type == 2 || x.desc.type == 4 || x.desc.type == 8 || x.desc.type == 64) {
          let dynamicInfo = JSON.parse(x.card);
          let card = {
            time: x.desc.timestamp,
            id: x.desc.timestamp,
            judgment: x.desc.timestamp,
            imageList: dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src),
            source: opt.source,
          };
          //  desc.type  8 是视频 64是专栏 2是动态 4是无图片动态
          if (x.desc.type == 2) {
            card.image = (dynamicInfo.item.pictures && dynamicInfo.item.pictures.length > 0) ? dynamicInfo.item.pictures[0].img_src : null;
            card.dynamicInfo = dynamicInfo.item.description;
            card.type = 2;
            card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
          } else if (x.desc.type == 4) {
            card.dynamicInfo = dynamicInfo.item.content;
            card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
            card.type = 4;
          } else if (x.desc.type == 8) {
            card.image = dynamicInfo.pic;
            card.dynamicInfo = dynamicInfo.dynamic;
            card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
            card.type = 8;
          } else if (x.desc.type == 64) {
            card.image = (dynamicInfo.image_urls && dynamicInfo.image_urls.length > 0) ? dynamicInfo.image_urls[0] : null;
            card.dynamicInfo = dynamicInfo.summary;
            card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
            card.type = 64;
          }
          list.push(card);
        }

      });
      return list.sort((x, y) => y.judgment - x.judgment);
    }
  }
}
