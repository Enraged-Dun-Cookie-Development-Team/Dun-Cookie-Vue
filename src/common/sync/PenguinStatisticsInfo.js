import PlatformHelper from '../platform/PlatformHelper';
import HttpUtil from '../util/HttpUtil';

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
    let options = {
      appendTimestamp: false,
    };
    promiseList.push(
      new Promise((resolve) => {
        HttpUtil.GET('https://penguin-stats.cn/PenguinStats/api/v2/items?i18n=false', options).then((data) => {
          resolve(data);
        });
      })
    );
    promiseList.push(
      new Promise((resolve) => {
        HttpUtil.GET('https://penguin-stats.cn/PenguinStats/api/v2/stages', options).then((data) => {
          resolve(data);
        });
      })
    );
    promiseList.push(
      new Promise((resolve) => {
        HttpUtil.GET('https://penguin-stats.cn/PenguinStats/api/v2/zones', options).then((data) => {
          resolve(data);
        });
      })
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
        console.log(e);
      });
  }

  static GetItemsInfo() {
    let options = {
      appendTimestamp: false,
      timeout: 60000,
    };
    return new Promise((resolve) => {
      HttpUtil.GET(
        `https://penguin-stats.cn/PenguinStats/api/v2/result/matrix?server=CN&show_closed_zones=true`,
        options
      ).then((data) => {
        resolve(data);
      });
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
