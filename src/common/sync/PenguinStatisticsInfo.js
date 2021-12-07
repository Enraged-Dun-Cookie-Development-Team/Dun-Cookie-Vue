import PlatformHelper from '../platform/PlatformHelper'
import NotificationUtil from "@/common/util/NotificationUtil";
import HttpUtil from '../util/HttpUtil';

export default class PenguinStatistics {
    constructor() {
        return PenguinStatistics.GetNewItems();
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
            HttpUtil.GET("https://penguin-stats.io/PenguinStats/api/items?i18n=false").then(data => {
                resolve(data);
            });
        }))
        promiseList.push(new Promise(resolve => {
            HttpUtil.GET("https://penguin-stats.io/PenguinStats/api/stages").then(data => {
                resolve(data);
            });
        }))
        Promise.all(promiseList).then(data => {
            let penguinStatisticsInfo = {};
            penguinStatisticsInfo.items = JSON.parse(data[0]);
            penguinStatisticsInfo.stages = JSON.parse(data[1]);
            PlatformHelper.Storage.saveLocalStorage("PenguinStatistics", JSON.stringify(penguinStatisticsInfo)).then(_ => {
                NotificationUtil.SendNotice(`企鹅物流基础数据已更新完毕`, '', null, new Date().getTime());
            })
        })
    }

    static GetItemInfo(id) {
        return new Promise(resolve => {
            HttpUtil.GET(`https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&itemFilter=${id}&server=CN&show_closed_zones=false`).then(data => {
                resolve(data)
            })
        })
    }

    static GetStageInfo(id){
       return this.penguinStatisticsInfo.stages.find(x=>x.stageId == id)?.code;
    }

    static GetItemByText(text) {
        return this.penguinStatisticsInfo.items.filter(item => item.pron.zh.some(x => x.replaceAll('`', '').indexOf(text) != -1));
    }
}

