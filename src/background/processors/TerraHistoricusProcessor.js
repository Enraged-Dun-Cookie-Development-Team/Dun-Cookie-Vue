import {BaseProcessor} from "./BaseProcessor";

/**
 * 泰拉记事社(官网)处理器。
 * <p>
 */
export class TerraHistoricusProcessor extends BaseProcessor {
  process(opt, kazeLocalData, kazeFun) {
    let list = [];
    opt.responseText.map(x => {
      let info = JSON.parse(x).data;
      info.episodes.reverse();
      list.push({
        time: info.updateTime,
        id: info.updateTime,
        judgment: info.updateTime,
        dynamicInfo: `泰拉记事社${info.title}已更新`,
        name: info.title,
        source: opt.source,
        image: info.cover,
        html: info,
        url: `https://terra-historicus.hypergryph.com/comic/${info.cid}`,
      });
    });
    return list.sort((x, y) => y.time - x.time);
  }
}
