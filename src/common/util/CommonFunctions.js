/**
 * 这里放不方便分类的公共方法
 */

import HttpUtil from './HttpUtil';
import Settings from '../Settings';
import {CURRENT_VERSION} from '../Constants';
import NotificationUtil from './NotificationUtil';
import PlatformHelper from '../platform/PlatformHelper';
import InsiderUtil from './InsiderUtil';

/**
 * 递归合并对象
 * <p>
 * <strong>注意：子元素是数组的会直接复制而不会递归合并</strong>
 */
function deepAssign(target, obj) {
    if (!target) target = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                //判断obj子元素是否为对象，如果是则递归复制，否则简单复制
                const val = obj[key];
                if (val && typeof val === "object" && !Array.isArray(val)) {
                    target[key] = deepAssign(target[key], obj[key]);
                } else {
                    target[key] = val;
                }
            }
        }
    }
    return target;
}

async function checkOnlineInfo(shouldNotice) {
    let data;
    try {
        const url = "http://cdn.liuziyang.vip/Dun-Cookies-Info.json?t=" + new Date().getTime();
        data = await HttpUtil.GET_Json(url);
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
    if (shouldNotice) {
        if (Settings.JudgmentVersion(data.upgrade.v, CURRENT_VERSION) && Settings.dun.enableNotice) {
            NotificationUtil.SendNotice("小刻食堂翻新啦！！", "快来使用新的小刻食堂噢！一定有很多好玩的新功能啦！！", null, "update");
        }

        if (Settings.feature.announcementNotice) {
            let filterList = data.list.filter(
                (x) =>
                    new Date(x.starTime) <= new Date() &&
                    new Date(x.overTime) >= new Date()
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
                    NotificationUtil.SendNotice("博士，重要公告，记得开列表看噢！", content, imgUrl, "announcement" + new Date().getTime());
                }
            })
        }
    }
    return data;
}

export {deepAssign, checkOnlineInfo};
