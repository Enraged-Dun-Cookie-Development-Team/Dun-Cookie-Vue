/**
 * 与小刻食堂服务器通信相关工具
 */
import HttpUtil from "./HttpUtil";
import PlatformHelper from "../platform/PlatformHelper";
import InsiderUtil from "./InsiderUtil";
import Settings from "../Settings";
import { CANTEEN_INTERFACE_LIST, CANTEEN_SERVER_LIST, CURRENT_VERSION } from "../Constants";
import NotificationUtil from "./NotificationUtil";
import TimeUtil from "./TimeUtil";
import PromiseUtil from "./PromiseUtil";

export default class ServerUtil {
    static async checkOnlineInfo(shouldNotice) {
        await new Promise(resolve => Settings.doAfterInit(() => resolve()));
        let data;
        try {
            data = await PromiseUtil.any(CANTEEN_INTERFACE_LIST.map(api => HttpUtil.GET_Json(api + "canteen/info")), res => !!res);
        } catch (e) {
            console.log(e);
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


                let today = TimeUtil.format(new Date(), 'yyyy-MM-dd');
                let announcementNoticeStatus = await PlatformHelper.Storage.getLocalStorage("announcement-notice-status") || {};

                filterList.map(x => {
                    if (x.notice) {
                        if (!announcementNoticeStatus[today]) {
                            announcementNoticeStatus = {};
                            announcementNoticeStatus[today] = {};
                        }
                        if (!announcementNoticeStatus[today][today + "-" + x.notice]) {
                            announcementNoticeStatus[today][today + "-" + x.notice] = true;
                            let imgReg = /<img.*?src='(.*?)'/;
                            let imgUrl = x.html.match(imgReg)[1];
                            let removeTagReg = /<\/?.+?\/?>/g;
                            let divReg = /<\/div>/g;

                            let content = x.html.replace(/\s+/g, '');
                            content = content.replace(divReg, '\n');
                            content = content.replace(removeTagReg, '');

                            imgUrl = imgUrl == "/assets/image/" + Settings.logo ? "/assets/image/announcement.png" : imgUrl;

                            NotificationUtil.SendNotice("博士，重要公告，记得开列表看噢！", content, imgUrl, "announcement" + new Date().getTime());
                        }
                    }
                })
                PlatformHelper.Storage.saveLocalStorage("announcement-notice-status", announcementNoticeStatus)
            }
        }
        return data;
    }

    /**
     * 获取公告信息
     */
    static async getAnnouncementInfo(shouldNotice) {
        await new Promise(resolve => Settings.doAfterInit(() => resolve()));
        let data;
        try {
            let options = {
                appendTimestamp: false
            }
            data = await PromiseUtil.any(CANTEEN_SERVER_LIST.map(api => HttpUtil.GET_Json(api + "canteen/operate/announcement/list", options)), res => !!res);
            data = data.data
        } catch (e) {
            console.log(e);
        }
        if (!data) {
            const fallbackUrl = PlatformHelper.Extension.getURL("Dun-Cookies-Info.json");
            data = await HttpUtil.GET_Json(fallbackUrl);
            data = data.list
        }
        if (!data) {
            return data;
        }
        if (shouldNotice) {
            if (Settings.feature.announcementNotice) {
                let filterList = data.filter(
                    (x) =>
                        new Date(x.starTime) <= TimeUtil.changeToCCT(new Date()) &&
                        new Date(x.overTime) >= TimeUtil.changeToCCT(new Date())
                );

                let today = TimeUtil.format(new Date(), 'yyyy-MM-dd');
                let announcementNoticeStatus = await PlatformHelper.Storage.getLocalStorage("announcement-notice-status") || {};

                // 判断当天是否推送过
                filterList.map(x => {
                    if (x.notice) {
                        if (!announcementNoticeStatus[today]) {
                            announcementNoticeStatus = {};
                            announcementNoticeStatus[today] = {};
                        }
                        if (!announcementNoticeStatus[today][today + "-" + x.notice]) {
                            announcementNoticeStatus[today][today + "-" + x.notice] = true;
                            let imgReg = /<img.*?src='(.*?)'/;
                            let imgUrl = x.html.match(imgReg)[1];
                            let removeTagReg = /<\/?.+?\/?>/g;
                            let divReg = /<\/div>/g;

                            let content = x.html.replace(/\s+/g, '');
                            content = content.replace(divReg, '\n');
                            content = content.replace(removeTagReg, '');

                            imgUrl = imgUrl == "/assets/image/" + Settings.logo ? "/assets/image/announcement.png" : imgUrl;

                            NotificationUtil.SendNotice("博士，重要公告，记得开列表看噢！", content, imgUrl, "announcement" + new Date().getTime());
                        }
                    }
                })
                PlatformHelper.Storage.saveLocalStorage("announcement-notice-status", announcementNoticeStatus)
            }
        }
        return data;
    }

    /** 
     * 获取视频信息
     */
    static async getVideoInfo() {
        await new Promise(resolve => Settings.doAfterInit(() => resolve()));
        let data;
        try {
            let options = {
                appendTimestamp: false
            }
            data = await PromiseUtil.any(CANTEEN_SERVER_LIST.map(api => HttpUtil.GET_Json(api + "canteen/operate/video/list", options)), res => !!res);
            data = data.data
        } catch (e) {
            console.log(e);
        }
        if (!data) {
            const fallbackUrl = PlatformHelper.Extension.getURL("Dun-Cookies-Info.json");
            data = await HttpUtil.GET_Json(fallbackUrl);
            data = data.btnList
        }
        return data;
    }

    /** 
     * 获取公告资源信息
     */
    static async getResourceInfo() {
        await new Promise(resolve => Settings.doAfterInit(() => resolve()));
        let data;
        try {
            let options = {
                appendTimestamp: false
            }
            data = await PromiseUtil.any(CANTEEN_SERVER_LIST.map(api => HttpUtil.GET_Json(api + "canteen/operate/resource/get", options)), res => !!res);
            data = data.data
        } catch (e) {
            console.log(e);
        }
        if (!data) {
            const fallbackUrl = PlatformHelper.Extension.getURL("Dun-Cookies-Info.json");
            data = await HttpUtil.GET_Json(fallbackUrl);
            data = data.dayInfo
        }
        return data;
    }

    /**
     * @param currentVersion {boolean} 是否获取当前版本信息
     * @param shouldNotice {boolean}
     */
    static async getVersionInfo(currentVersion, shouldNotice) {
        await new Promise(resolve => Settings.doAfterInit(() => resolve()));
        let data;
        let networkBroken = false;
        try {
            let options = {
                appendTimestamp: false
            }
            if (currentVersion) {
                data = await PromiseUtil.any(CANTEEN_SERVER_LIST.map(api => HttpUtil.GET_Json(api + "canteen/operate/version/plugin?version=" + CURRENT_VERSION, options)), res => !!res);
            } else {
                data = await PromiseUtil.any(CANTEEN_SERVER_LIST.map(api => HttpUtil.GET_Json(api + "canteen/operate/version/plugin", options)), res => !!res);
            }
            data = data.data
        } catch (e) {
            // 只有断网返回没有状态会进入catch
            networkBroken = true;
            console.log(e);
        }
        if (!data) {
            const fallbackUrl = PlatformHelper.Extension.getURL("Dun-Cookies-Info.json");
            data = await HttpUtil.GET_Json(fallbackUrl);
            data = data.upgrade
            // 如果检测到是断网，将版本赋值成当前版本，避免弹出更新提醒
            if (networkBroken == true) {
                data.version = CURRENT_VERSION
            }
        }
        if (!data) {
            return data;
        }
        if (shouldNotice) {
            if (Settings.JudgmentVersion(data.upgrade.v, CURRENT_VERSION) && Settings.dun.enableNotice) {
                NotificationUtil.SendNotice("小刻食堂翻新啦！！", "快来使用新的小刻食堂噢！一定有很多好玩的新功能啦！！", null, "update");
            }
        }
        return data;
    }
}
