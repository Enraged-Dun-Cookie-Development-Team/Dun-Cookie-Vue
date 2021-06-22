/**
 * 时间相关工具类
 */
class TimeUtil {
  /**
   * 格式化Date，支持yyyy-MM-dd hh:mm:ss
   */
  static format(date, formatText) {
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
   * 计算并格式化两个Date的差值
   */
  static calcDiff(startDate, endDate) {
    if (typeof startDate === 'number') {
      startDate = new Date(startDate);
    }
    if (typeof endDate === 'number') {
      endDate = new Date(endDate);
    }
    const timeUnits = [
      [24 * 3600 * 1000, '天'],
      [3600 * 1000, '小时'],
      [60 * 1000, '分钟']
    ];
    let text = '';
    let time = Math.abs(endDate.getTime() - startDate.getTime());
    for (const unit of timeUnits) {
      if (time >= unit[0]) {
        const num = Math.floor(time / unit[0]);
        text += `${num}${unit[1]}`;
        time %= unit[0];
      }
    }
    return text || '0分钟';
  }
}

export default TimeUtil;
