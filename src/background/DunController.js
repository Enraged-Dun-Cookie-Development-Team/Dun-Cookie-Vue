// 蹲饼控制器
import DunInfo from "../common/sync/DunInfo";
import CardList from "../common/sync/CardList";
import CurrentDataSource from "../common/sync/CurrentDataSource";
import Settings from "../common/Settings";
import {distance} from "fastest-levenshtein";
import NotificationUtil from "../common/util/NotificationUtil";

const lowFrequencyDataSourceMap = {};
lowFrequencyDataSourceMap["朝陇山微博"] = true;
lowFrequencyDataSourceMap["泰拉记事社微博"] = true;
lowFrequencyDataSourceMap["一拾山微博"] = true;
lowFrequencyDataSourceMap["鹰角网络微博"] = true;
lowFrequencyDataSourceMap["明日方舟终末地"] = true;

/**
 * 判断这次是否要蹲这个数据源的饼，用于减小不重要饼的频率
 * @param sourceName  数据源名称
 * @param intervalTime 当前蹲饼周期
 * @param roundCount 当前蹲饼轮次
 */
function shouldDun(sourceName, intervalTime, roundCount) {
  // 减小不重要饼的频率
  if (lowFrequencyDataSourceMap[sourceName]) {
    if ((intervalTime <= 13 && roundCount % 5 !== 1) ||
      (intervalTime > 13 && intervalTime <= 15 && roundCount % 4 !== 1) ||
      (intervalTime > 15 && intervalTime <= 20 && roundCount % 3 !== 1) ||
      (intervalTime > 20 && intervalTime <= 45 && roundCount % 2 !== 1)) {
      return false;
    }
  }
  return true;
}

// 最新推送的通知，用于避免不同平台的饼重复通知
let lastNotices = [];

/**
 * 蹲饼！ TODO 返回一个promise，全部解析完毕后resolve，用于给强制刷新提示完成
 */
function tryDun(settings) {
  DunInfo.lastDunTime = new Date().getTime();
  for (const key in CardList) {
    if (CardList.hasOwnProperty(key)) {
      // 如果缓存的key不在启用列表中则删除缓存
      if (!CurrentDataSource[key]) {
        delete CardList[key];
      }
    }
  }
  DunInfo.roundCount++;
  for (const dataName in CurrentDataSource) {
    if (!shouldDun(dataName, settings.dun.intervalTime, DunInfo.roundCount)) {
      continue;
    }
    if (CurrentDataSource.hasOwnProperty(dataName)) {
      const source = CurrentDataSource[dataName];
      DunInfo.counter++;
      source.fetchData()
        .then(([newCardList, newCookieList]) => {
          const hasOldCardList = CardList[dataName] && CardList[dataName].length > 0;
          if (hasOldCardList && newCookieList.length > 0) {
            DunInfo.cookieCount += newCookieList.length;
            console.log("new cookies: ", newCookieList);
            tryNotice(source, newCookieList);
          }
          if (newCardList && newCardList.length > 0) {
            CardList[dataName] = newCardList;
          }
        })
        .catch(e => console.error(e))
        .finally(() => {
          if (!CardList[dataName]) {
            CardList[dataName] = [];
          }
        });
    }
  }
}

/**
 * 新饼推送通知
 * @param source
 * @param newCookieList
 */
function tryNotice(source, newCookieList) {
  if (!Settings.dun.enableNotice) {
    return;
  }
  for (const cookie of newCookieList) {
    let newNotice = cookie.content.replace(/\s/g, "");
    let canNotice = true;
    // 如果未启用推送重复饼则尝试计算不同平台的重复饼
    if (!Settings.dun.repetitionPush) {
      let duplicate = false;
      // 设置相似度阈值，如果饼的相似度达到指定值(范围0~1，值越大越相似，1为完全相等)则视为重复饼
      const rateThreshold = 0.8;
      for (const notice of lastNotices) {
        const rate = 1 - distance(newNotice, notice) / Math.max(newNotice.length, notice.length);
        if (rate > rateThreshold) {
          duplicate = true;
          break;
        }
      }
      if (duplicate) {
        canNotice = false;
      }
    }
    if (canNotice) {
      NotificationUtil.SendNotice(`小刻在【${source.title}】里面找到了一个饼！`, newNotice, cookie.coverImage, cookie.id)
    }
    lastNotices.push(newNotice);
    if (lastNotices.length > 5) {
      lastNotices.shift();
    }
  }
}

let dunTimeoutId = null;

/**
 * 启动蹲饼timer，会立刻请求一次然后按Settings.dun.intervalTime的值进行延时轮询
 */
function startDunTimer() {
  try {
    tryDun(Settings);
  } catch (e) {
    console.error(e);
  }

  let delay = Settings.dun.intervalTime;
  // 低频模式
  if (Settings.checkLowFrequency()) {
    delay *= Settings.dun.timeOfLowFrequency;
  }
  // 数据源尚未准备好的时候0.5秒刷新一次
  if (Object.keys(CardList).length === 0 && Object.keys(CurrentDataSource).length === 0) {
    delay = 0.5;
  }
  dunTimeoutId = setTimeout(() => {
    startDunTimer();
  }, delay * 1000);
}


function restartDunTimer() {
  if (dunTimeoutId) {
    clearTimeout(dunTimeoutId);
    dunTimeoutId = null;
  }
  startDunTimer();
}

export {restartDunTimer, tryDun};
