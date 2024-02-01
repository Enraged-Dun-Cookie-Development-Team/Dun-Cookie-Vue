import { AbstractCookieFetcher } from '../AbstractCookieFetcher';
import { FetchController } from '@enraged-dun-cookie-development-team/cookie-fetcher-core';
import { DefaultLogger } from '@enraged-dun-cookie-development-team/common/logger';
import PlatformHelper from '../../../common/platform/PlatformHelper';
import { CookieHandler } from '../../CookieHandler';
import DebugUtil from '../../../common/util/DebugUtil';
/* IFTRUE_feature__local_fetch */
import { registerDefaultDataSourceTypes } from '@enraged-dun-cookie-development-team/cookie-fetcher';

registerDefaultDataSourceTypes();
/* FITRUE_feature__local_fetch */

const pad = (num) => (num > 9 ? `${num}` : `0${num}`);

export class CustomLocalCookieFetcher extends AbstractCookieFetcher {
  dataIdKeyInConfig = {
    'bilibili:dynamic-by-uid': 'uid',
    'weibo:dynamic-by-uid': 'uid',
    'netease-cloud-music:albums-by-artist': 'artistId',
    'arknights-game:announcement': 'platform',
    'arknights-game:bulletin-list': 'platform',
    'arknights-game:version': 'platform',
  };

  /**
   * @type {FetchController}
   */
  fetchController;
  controllerConfig;
  runningFlag = false;

  updateGroupIntervalByTimeRange(defaultInterval, fetchConfig, group) {
    const lowInterval = defaultInterval * fetchConfig.lowFrequencyMultiple;
    if (!group.interval_by_time_range || group.interval_by_time_range.length === 0) {
      const [start, end] = fetchConfig.lowFrequencyTimeRange;
      // 只判断小于和大于的情况，其它情况视为异常，但不抛异常只做静默忽略
      if (start < end) {
        group.interval_by_time_range = [
          {
            time_range: [`${pad(start)}:00`, `${pad(end)}:00`],
            interval: lowInterval,
          },
        ];
      } else if (start > end) {
        group.interval_by_time_range = [
          { time_range: [`00:00`, `${pad(end)}:00`], interval: lowInterval },
          { time_range: [`${pad(start)}:00`, `24:00`], interval: lowInterval },
        ];
      }
    } else {
      // 由于计算复杂，如果已存在时间范围设置就忽略用户设置，只修改蹲饼频率
      for (const range of group.interval_by_time_range) {
        range.interval = Math.max(range.interval, lowInterval);
      }
    }
  }

  startWithFetcherControllerConfig(fetcherControllerConfig, fetchConfig) {
    FetchController.validateConfig(fetcherControllerConfig);
    DebugUtil.debugLog(0, '使用本地蹲饼配置：', fetcherControllerConfig);
    this.fetchController = FetchController.create(
      fetcherControllerConfig,
      (fetchData) => {
        if (fetchData.success) {
          void CookieHandler.handleLocal(fetchConfig.id, fetchData);
        } else {
          this.failCount++;
          console.log(fetchData.error);
        }
      },
      DefaultLogger,
      {
        async readCookieIds(source) {
          return (await PlatformHelper.Storage.getLocalStorage('cache_cookie_ids__' + source.idStr)) || false;
        },
        async writeCookieIds(source, cookieIds) {
          await PlatformHelper.Storage.saveLocalStorage('cache_cookie_ids__' + source.idStr, cookieIds);
          return true;
        },
      }
    );
    this.runningFlag = true;
    this.controllerConfig = fetcherControllerConfig;
    this.fetchController.start();
  }

  async start(fetchConfig) {
    if (this.runningFlag) return;
    const config = {
      default_interval: fetchConfig.globalInterval * 1000,
      groups: [],
    };
    const customGroups = {};
    const commonGroupConfig = {};
    if (fetchConfig.lowFrequencyTimeRange && fetchConfig.lowFrequencyMultiple > 1) {
      this.updateGroupIntervalByTimeRange(config.default_interval, fetchConfig, commonGroupConfig);
    }
    for (const { type, dataId } of fetchConfig.enableDataSourceList) {
      if (!customGroups[type]) customGroups[type] = { type: type, datasource: [], ...commonGroupConfig };
      const source = {};
      if (this.dataIdKeyInConfig[type]) {
        source[this.dataIdKeyInConfig[type]] = dataId;
      }
      customGroups[type].datasource.push(source);
    }
    config.groups.push(...Object.values(customGroups).filter((group) => group.datasource.length > 0));
    this.startWithFetcherControllerConfig(config, fetchConfig);
  }

  async stop() {
    if (this.fetchController) await this.fetchController.stop();
    this.controllerConfig = undefined;
    this.runningFlag = false;
  }

  async _checkAvailable() {
    // 尝试访问百度确认网络连接正常
    await fetch('https://www.baidu.com/', { mode: 'no-cors' });
    return true;
  }
}
