import PlatformHelper from '../platform/PlatformHelper';
import { Http } from '@enraged-dun-cookie-development-team/common/request';
import { Logger } from '../util/Logger';

export default class PenguinStatistics {
  constructor() {
    // return PenguinStatistics.GetNewItems();
  }

  penguinStatisticsInfo = {};

  static GetItems() {
    return new Promise((resolve) => {
      PlatformHelper.Storage.getLocalStorage('PenguinStatistics').then((data) => {
        this.penguinStatisticsInfo = JSON.parse(data);
        resolve(this.penguinStatisticsInfo);
      });
    });
  }

  static GetNewItems() {
    let promiseList = [];
    const options = {
      appendTimestamp: false,
    };
    promiseList.push(
      Http.get('https://penguin-stats.cn/PenguinStats/api/v2/items?i18n=false', options),
      Http.get('https://penguin-stats.cn/PenguinStats/api/v2/stages', options),
      Http.get('https://penguin-stats.cn/PenguinStats/api/v2/zones', options)
    );
    Promise.all(promiseList)
      .then((data) => {
        let penguinStatisticsInfo = {};
        penguinStatisticsInfo.items = JSON.parse(data[0]);
        penguinStatisticsInfo.stages = JSON.parse(data[1]);
        penguinStatisticsInfo.zones = JSON.parse(data[2]);
        PlatformHelper.Storage.saveLocalStorage('PenguinStatistics', JSON.stringify(penguinStatisticsInfo)).then(
          (_) => {
            // NotificationUtil.SendNotice(`企鹅物流基础数据已更新完毕`, '', null, new Date().getTime());
          }
        );
      })
      .catch((e) => {
        Logger.logError(e);
      });
  }

  static GetItemsInfo() {
    return Http.get(`https://penguin-stats.cn/PenguinStats/api/v2/result/matrix?server=CN&show_closed_zones=true`, {
      appendTimestamp: false,
      timeout: 60000,
    });
  }

  static GetStageInfo(id) {
    return this.penguinStatisticsInfo.stages.find((x) => x.stageId == id);
  }

  static GetZonesInfo(id) {
    return this.penguinStatisticsInfo.zones.find((x) => x.zoneId == id);
  }

  static GetItemByText(text) {
    return this.penguinStatisticsInfo.items.filter(
      (item) =>
        item.itemType != 'RECRUIT_TAG' && // 判断是否不为公招tag
        ((item.pron.zh && item.pron.zh.some((x) => x.replaceAll('`', '').indexOf(text) != -1)) || //判断中文相关拼音是否存在，去除字中间的`
          (item.alias.zh && item.alias.zh.some((x) => x.replaceAll('`', '').indexOf(text) != -1)))
    ); //判断中文相关文字是否存在，去除字中间的`
  }
}
