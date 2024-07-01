import DebugUtil from '../common/util/DebugUtil';
import CountDown from '../common/sync/CountDownInfo';
import PlatformHelper from '../common/platform/PlatformHelper';
import NotificationUtil from '../common/util/NotificationUtil';
import TimeUtil from '../common/util/TimeUtil';

function countDownDebugLog(...data) {
  DebugUtil.debugConsoleOutput(0, 'debug', '%c 倒计时 ', 'color: white; background: #DA70D6', ...data);
}

const countDownThreshold = 5 * 60 * 1000;
let countDownFlag = false;
const countDown = {
  sendNoticeList: [],
  countDownList: [],
  Start() {
    CountDown.getCountDownLocalStorage().then((data) => {
      data = JSON.parse(data);
      if (data) {
        this.countDownList = [];
        data
          .map((x) => x.data)
          .forEach((item) => {
            this.countDownList.push(item);
            const endTime = new Date(item.stopTime).getTime();
            const delayTime = endTime - new Date().getTime();
            if (delayTime >= countDownThreshold) {
              countDownDebugLog(`设置alarm[${item.name}]-指定时间：${new Date(endTime).toLocaleString()}`);
              const uniqueName = 'countdown_' + item.name + '|' + Math.random().toFixed(3).substring(2, 5);
              PlatformHelper.Alarms.create(uniqueName, { when: endTime });
            } else {
              countDownDebugLog(`设置setTimeout[${item.name}]-延时：${delayTime}`);
              this.sendNoticeList.push(
                setTimeout((_) => {
                  NotificationUtil.SendNotice(
                    `倒计时完毕`,
                    `${item.name} 到点了！`,
                    null,
                    'countdown_' + new Date().getTime()
                  );
                  // 有过通知后从内存中删除计时器数据
                  CountDown.removeCountDown(item);
                }, delayTime)
              );
            }
          });
      }
    });
  },
  Change() {
    if (countDownFlag) {
      return;
    }
    countDownFlag = true;
    countDownDebugLog('清空setTimeout');
    this.sendNoticeList.forEach((id) => {
      clearTimeout(id);
    });
    this.sendNoticeList = [];
    countDownDebugLog('清空alarms');
    // TODO 简单粗暴全清了显然不行
    // PlatformHelper.Alarms.clearAll().finally(() => {
    //   this.Start();
    //   countDownFlag = false;
    // });
  },
  GetAllCountDown() {
    let list = [];
    this.countDownList.forEach((item) => {
      let value = TimeUtil.calcDiff(new Date(item.stopTime), new Date());
      if (value != '') {
        list.push({ ...item, timeStr: value, stopTime: TimeUtil.format(item.stopTime, 'yyyy-MM-dd hh:mm:ss') });
      }
    });
    return list;
  },
};

function countdownAlarmHandler(alarm) {
  if (!alarm || !alarm.name) return;
  if (alarm.name.startsWith('countdown_')) {
    const countDownName = name.split('|')[0].substring('countdown_'.length);
    NotificationUtil.SendNotice(`倒计时完毕`, `${countDownName} 到点了！`, null, 'countdown_' + new Date().getTime());
    void CountDown.removeCountDownByName(countDownName);
  }
}

// TODO 暂时没有启用倒计时
export function CountDownInit() {
  countDown.Start();
  PlatformHelper.osIsMac().then((isMac) => {
    if (isMac) {
      setInterval(() => countDown.Change(), 10 * 60 * 1000);
    }
  });
  PlatformHelper.Alarms.addListener(countdownAlarmHandler);
}
