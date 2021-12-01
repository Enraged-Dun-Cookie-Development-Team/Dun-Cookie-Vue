/**
 * 与小刻食堂服务器通信相关工具
 */
import HttpUtil from "./HttpUtil";
import PlatformHelper from "../platform/PlatformHelper";
import InsiderUtil from "./InsiderUtil";
import Settings from "../Settings";
import {CANTEEN_INTERFACE_LIST, CURRENT_VERSION} from "../Constants";
import NotificationUtil from "./NotificationUtil";
import TimeUtil from "./TimeUtil";
import PromiseUtil from "./PromiseUtil";

export default class ServerUtil {
    static async checkOnlineInfo(shouldNotice) {
        let data;
        try {
            data = await PromiseUtil.any(CANTEEN_INTERFACE_LIST.map(api => HttpUtil.GET_Json(api + "canteen/info")), res => !!res);
        } catch (e) {
            console.log(e);
        }
        if (!data) {
            try {
                data = await HttpUtil.GET_Json("http://cdn.liuziyang.vip/Dun-Cookies-Info.json");
            } catch (e) {
                console.log(e);
            }
        }
        if (!data) {
            const fallbackUrl = PlatformHelper.Extension.getURL("Dun-Cookies-Info.json");
            data = await HttpUtil.GET_Json(fallbackUrl);
        }
        if (!data) {
            return data;
        }
        InsiderUtil.resetInsiderLevel(data.insider);
        Settings.logo = data.logo;
        Settings.saveSettings().then();
        if (shouldNotice) {
            if (Settings.JudgmentVersion(data.upgrade.v, CURRENT_VERSION) && Settings.dun.enableNotice) {
                NotificationUtil.SendNotice("小刻食堂翻新啦！！", "快来使用新的小刻食堂噢！一定有很多好玩的新功能啦！！", null, "update");
            }

            if (Settings.feature.announcementNotice) {
                let filterList = data.list.filter(
                    (x) =>
                        new Date(x.starTime) <= TimeUtil.changeToCCT(new Date()) &&
                        new Date(x.overTime) >= TimeUtil.changeToCCT(new Date())
                );

                filterList.map(x => {
                    if (x.notice) {
                        let imgReg = /<img.*?src='(.*?)'/;
                        let imgUrl = x.html.match(imgReg)[1];
                        let removeTagReg = /<\/?.+?\/?>/g;
                        let divReg = /<\/div>/g;

                        let content = x.html.replace(/\s+/g, '');
                        content = content.replace(divReg, '\n');
                        content = content.replace(removeTagReg, '');

                        imgUrl =  imgUrl == "/assets/image/" + Settings.logo ? "/assets/image/announcement.png" : imgUrl;

                        NotificationUtil.SendNotice("博士，重要公告，记得开列表看噢！", content, imgUrl, "announcement" + new Date().getTime());
                    }
                })
            }
        }
        return data;
    }
}
