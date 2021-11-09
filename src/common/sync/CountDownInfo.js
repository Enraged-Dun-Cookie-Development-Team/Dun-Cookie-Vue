import PlatformHelper from '../platform/PlatformHelper'
import NotificationUtil from '../util/NotificationUtil';

export default class CountDown {
    constructor(){

    }

    static async StartCountDown (countDm){
        // 启动倒计时
        NotificationUtil.SendNotice(`启动倒计时：${countDm.title}`,countDm.remark,null,'CountDown-' + countDm.title);
       return await this.addCountDownLocalStorage(countDm);
        // 后台开始计算时间
    }

    static async addCountDownLocalStorage(countDm){
        this.getCountDownLocalStorage().then(async data  =>  {
            if(data == undefined){
                let result = await PlatformHelper.Storage.saveLocalStorage('CountDown',JSON.stringify([{name:countDm.title,data:countDm}]));
                if(result != undefined){
                    NotificationUtil.SendNotice(`倒计时存储失败：${countDm.title}`,'数据将在浏览器关闭后丢失',null,new Date().getTime());
                    return;
                }
            }else{
                let jsonData = JSON.parse(data);
                if(jsonData.some(x=>x.name == countDm.title)){
                    NotificationUtil.SendNotice(`在倒计时列表中发现重名倒计时：${countDm.title}`,'已将该倒计时时间重置为刚刚设置的时间',null,new Date().getTime());
                    let tempData = jsonData.find(x=>x.name == countDm.title)
                    tempData.data = countDm
                }else{
                    jsonData.push({name:countDm.title,data:countDm})
                }
                let result = await PlatformHelper.Storage.saveLocalStorage('CountDown',JSON.stringify(jsonData));
                if(result != undefined){
                    NotificationUtil.SendNotice(`倒计时存储失败：${countDm.title}`,'数据将在浏览器关闭后丢失',null,new Date().getTime());
                    return;
                }
            }
        })

    }

    static async getCountDownLocalStorage(){
       return await PlatformHelper.Storage.getLocalStorage('CountDown')
    }

    static async removeCountDown(dm){
        this.getCountDownLocalStorage().then(async data  =>  {
            let jsonData = JSON.parse(data);
            jsonData = jsonData.filter(x=>x.name != dm.name)
            let result = await PlatformHelper.Storage.saveLocalStorage('CountDown',JSON.stringify(jsonData));
            if(result != undefined){
                NotificationUtil.SendNotice(`倒计时存储失败`,'本次改动将在浏览器关闭后丢失',null,new Date().getTime());
                return;
            }
        })
    }

    static async StopCountDown (title){
        await PlatformHelper.Storage.saveLocalStorage('CountDown-' + title,null);
    }

}

