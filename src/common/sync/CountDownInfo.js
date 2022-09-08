import PlatformHelper from '../platform/PlatformHelper';
import NotificationUtil from '../util/NotificationUtil';

export default class CountDown {
    constructor(){

    }

    static async StartCountDown (countDm){
        return new Promise(resolve => {
            // 启动倒计时
            NotificationUtil.SendNotice(`启动倒计时：${countDm.name}`,countDm.remark,null,'CountDown-' + countDm.name);
            this.addCountDownLocalStorage(countDm).then(_=>{
                resolve();
            });
            // 后台开始计算时间
        });
    }

    static async addCountDownLocalStorage(countDm){
        return new Promise(resolve => {
            this.getCountDownLocalStorage().then(data => {
                if (!data) {
                    PlatformHelper.Storage.saveLocalStorage('CountDown', JSON.stringify([{
                        name: countDm.name,
                        data: countDm
                    }])).then(result => {
                        if (result != undefined) {
                            NotificationUtil.SendNotice(`倒计时存储失败：${countDm.name}`, '数据将在浏览器关闭后丢失', null, new Date().getTime());
                            return;
                        }
                        resolve();
                    });
                } else {
                    let jsonData = JSON.parse(data);
                    if (jsonData.some(x => x.name == countDm.name)) {
                        let tempData = jsonData.find(x => x.name == countDm.name);
                        tempData.data = countDm;
                    } else {
                        jsonData.push({ name: countDm.name, data: countDm });
                    }
                    PlatformHelper.Storage.saveLocalStorage('CountDown', JSON.stringify(jsonData)).then(result=>{
                        if (result != undefined) {
                            NotificationUtil.SendNotice(`倒计时存储失败：${countDm.name}`, '数据将在浏览器关闭后丢失', null, new Date().getTime());
                            return;
                        }
                        resolve();
                    });
                }
            });
        });
    }

    static async getCountDownLocalStorage(){
        return await PlatformHelper.Storage.getLocalStorage('CountDown') || "[]";
    }

    static removeCountDown(item){
        return CountDown.removeCountDownByName(item.name);
    }

    static removeCountDownByName(name){
        DebugUtil.debugConsoleOutput(0, 'debug', '%c 倒计时 ', 'color: #eee; background: #DA70D6', `在存储中删除计时器[${name}]`);
        return new Promise(resolve => {
            this.getCountDownLocalStorage().then(data  =>  {
                let jsonData = JSON.parse(data);
                jsonData = jsonData.filter(x=>x.name != name);
                PlatformHelper.Storage.saveLocalStorage('CountDown',JSON.stringify(jsonData)).then(result => {
                    if(result != undefined){
                        NotificationUtil.SendNotice(`倒计时存储失败`,'本次改动将在浏览器关闭后丢失',null,new Date().getTime());
                        return;
                    }
                    resolve();
                });
            });
        });
    }

    static async StopCountDown (name){
        await PlatformHelper.Storage.saveLocalStorage('CountDown-' + name,null);
    }

}

