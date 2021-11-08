import PlatformHelper from '../platform/PlatformHelper'

export default class CountDown {
    constructor(){

    }

    static async StartCountDown (countDm){
        let result = await PlatformHelper.Storage.saveLocalStorage('CountDown-' + countDm.title,JSON.stringify(countDm));
        if(result != ''){
            console.error('存储失败')
            return;
        }
        // 启动倒计时

    }

    static async StopCountDown (title){
        await PlatformHelper.Storage.saveLocalStorage('CountDown-' + title,null);
    }
}

