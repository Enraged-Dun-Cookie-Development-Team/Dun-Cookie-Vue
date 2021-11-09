function transformDate(dateValue) {
    if (typeof dateValue !== 'object' || dateValue.constructor !== Date) {
        dateValue = new Date(dateValue);
    }
    return dateValue;
}



/**
 * 时间相关工具类
 */
class TimeUtil {
    /**
     * 格式化Date，支持yyyy-MM-dd hh:mm:ss
     */
    static format(date, formatText) {
        date = transformDate(date);
        const o = {
            //月份
            "M+": date.getMonth() + 1,
            //日
            "d+": date.getDate(),
            //小时
            "h+": date.getHours(),
            //分
            "m+": date.getMinutes(),
            //秒
            "s+": date.getSeconds(),
            // 季度和毫秒的格式化：可以支持，但没必要
            // //季度
            // "q+": Math.floor((date.getMonth() + 3) / 3),
            // //毫秒
            // "S": date.getMilliseconds()
        };
        if (/(y+)/.test(formatText)) {
            formatText = formatText.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp("(" + k + ")").test(formatText)) {
                formatText = formatText.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return formatText;
    }

    /**
     * 计算并格式化两个Date的差值，如果startDate >= endDate会返回空值
     */
    static calcDiff(endDate, startDate = new Date()) {
        const startTime = transformDate(startDate).getTime();
        const endTime = transformDate(endDate).getTime();

        if (startTime >= endTime) {
            return '';
        }

        const timeUnits = [
            [24 * 3600 * 1000, '天'],
            [3600 * 1000, '小时'],
            [60 * 1000, '分钟']
        ];
        let text = '';
        let time = Math.abs(endTime - startTime);
        for (const unit of timeUnits) {
            if (time >= unit[0]) {
                const num = Math.floor(time / unit[0]);
                text += `${num}${unit[1]}`;
                time %= unit[0];
            }
        }
        return text || '0分钟';
    }

    /**
     * 将时间转换为中国时区 GMT+8
     */
    static changeToCCT(date) {
        let localTime = date.getTime();
        let localOffset = date.getTimezoneOffset()*60000;
        let utc = localTime + localOffset;
        let cct = utc + (3600000*8);
        let cctDate = new Date(cct);
        return cctDate;
    }

    static numberToWeek(x) {
        switch (x) {
            case 0:
                return '星期天';
            case 1:
                return '星期一';
            case 2:
                return '星期二';
            case 3:
                return '星期三';
            case 4:
                return '星期四';
            case 5:
                return '星期五';
            case 6:
                return '星期六';
            default:
                return '无效';
        }
    }

    /**
     * 时间相加 不支持负数
     * @param h
     * @param m
     * @param s
     */
    static dateAddTime(h,m,s){
        let date = new Date()
        date.setHours(date.getHours() + parseInt(h))
        date.setMinutes(date.getMinutes() + parseInt(m))
        date.setSeconds(date.getSeconds() + parseInt(s))
        return new Date(date)
    }
}

export default TimeUtil;
