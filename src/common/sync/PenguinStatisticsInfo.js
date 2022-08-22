import PlatformHelper from '../platform/PlatformHelper'
import HttpUtil from '../util/HttpUtil';

export default class PenguinStatistics {
    constructor() {
        // return PenguinStatistics.GetNewItems();
    }

    penguinStatisticsInfo = {};

    static GetItems() {
        return new Promise((resolve) => {
            PlatformHelper.Storage.getLocalStorage("PenguinStatistics").then(data => {
                this.penguinStatisticsInfo = JSON.parse(data);
                resolve(this.penguinStatisticsInfo);
            })
        });
    }

    static GetNewItems() {
        let promiseList = [];
        promiseList.push(new Promise(resolve => {
            HttpUtil.GET("https://penguin-stats.io/PenguinStats/api/v2/items?i18n=false", false).then(data => {
                resolve(data);
            });
        }))
        promiseList.push(new Promise(resolve => {
            HttpUtil.GET("https://penguin-stats.io/PenguinStats/api/v2/stages", false).then(data => {
                resolve(data);
            });
        }))
        promiseList.push(new Promise(resolve => {
            HttpUtil.GET("https://penguin-stats.io/PenguinStats/api/v2/zones", false).then(data => {
                resolve(data);
            });
        }))
        Promise.all(promiseList).then(data => {
            let penguinStatisticsInfo = {};
            penguinStatisticsInfo.items = JSON.parse(data[0]);
            penguinStatisticsInfo.stages = JSON.parse(data[1]);
            penguinStatisticsInfo.zones = JSON.parse(data[2]);
            PlatformHelper.Storage.saveLocalStorage("PenguinStatistics", JSON.stringify(penguinStatisticsInfo)).then(_ => {
                // NotificationUtil.SendNotice(`企鹅物流基础数据已更新完毕`, '', null, new Date().getTime());
            })
        }).catch(e => {
            console.log(e);
        })
    }

    static GetItemInfo(id) {
        return new Promise(resolve => {
            HttpUtil.GET(`https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&itemFilter=${id}&server=CN&show_closed_zones=true`, false).then(data => {
                resolve(data)
            })
        })
    }

    static GetStageInfo(id) {
        return this.penguinStatisticsInfo.stages.find(x => x.stageId == id);
    }

    static GetZonesInfo(id) {
        return this.penguinStatisticsInfo.zones.find(x => x.zoneId == id);
    }

    static GetItemByText(text) {
        return this.penguinStatisticsInfo.items.filter(item => item.itemType != "RECRUIT_TAG" && ((item.pron.zh && item.pron.zh.some(x => x.replaceAll('`', '').indexOf(text) != -1)) || (item.alias.zh && item.alias.zh.some(x => x.replaceAll('`', '').indexOf(text) != -1))));
    }
}

