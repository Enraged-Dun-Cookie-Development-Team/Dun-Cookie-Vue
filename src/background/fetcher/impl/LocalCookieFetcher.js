import { AbstractCookieFetcher } from '../AbstractCookieFetcher';
import ServerUtil from '../../../common/util/ServerUtil';
import { FetchController } from '@enraged-dun-cookie-development-team/cookie-fetcher-core';
import { registerDefaultDataSourceTypes } from '@enraged-dun-cookie-development-team/cookie-fetcher';
import { DefaultLogger } from '@enraged-dun-cookie-development-team/common/logger';
import PlatformHelper from '../../../common/platform/PlatformHelper';
import { CookieHandler } from '../../CookieHandler';
import DebugUtil from '../../../common/util/DebugUtil';

registerDefaultDataSourceTypes();

const dataIdKeyInConfig = {
  'bilibili:dynamic-by-uid': 'uid',
  'weibo:dynamic-by-uid': 'uid',
  'netease-cloud-music:albums-by-artist': 'artistId',
  'arknights-game:announcement': 'platform',
  'arknights-game:bulletin-list': 'platform',
  'arknights-game:version': 'platform',
};

export class LocalCookieFetcher extends AbstractCookieFetcher {
  /**
   * @type {FetchController}
   */
  fetchController;
  controllerConfig;
  runningFlag = false;

  async start(fetchConfig) {
    if (this.runningFlag) return;
    const enableDataSourceList = Object.fromEntries(
      fetchConfig.enableDataSourceList.map((it) => [`${it.type}:${it.dataId}`, it])
    );
    let defaultInterval = fetchConfig.globalInterval * 1000;
    const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
    let config;
    if (serverInfo) {
      config = JSON.parse(JSON.stringify(serverInfo.allConfig));
      defaultInterval = Math.max(defaultInterval, config.default_interval || 5000);
      for (const group of config.groups) {
        group.datasource = group.datasource.filter((source) => {
          const key = `${group.type}:${source[dataIdKeyInConfig[group.type]] || '-'}`;
          if (enableDataSourceList[key]) {
            delete enableDataSourceList[key];
            return true;
          } else {
            return false;
          }
        });
      }
    } else {
      config = {
        groups: [],
      };
    }
    // TODO 之后要允许对每个数据源自定义
    if (Object.keys(enableDataSourceList).length > 0) {
      const otherGroups = {};
      const commonIntervalConfig = {
        interval: defaultInterval,
      };
      if (fetchConfig.lowFrequencyTimeRange) {
        const range = fetchConfig.lowFrequencyTimeRange.map((it) => (it >= 10 ? `${it}:00` : `0${it}:00`));
        if (fetchConfig.lowFrequencyTimeRange[0] <= fetchConfig.lowFrequencyTimeRange[1]) {
          commonIntervalConfig.interval_by_time_range = [
            {
              time_range: range,
              interval: defaultInterval * fetchConfig.lowFrequencyMultiple,
            },
          ];
        } else {
          commonIntervalConfig.interval_by_time_range = [
            {
              time_range: [range[0], '24:00'],
              interval: defaultInterval * fetchConfig.lowFrequencyMultiple,
            },
            {
              time_range: ['00:00', range[1]],
              interval: defaultInterval * fetchConfig.lowFrequencyMultiple,
            },
          ];
        }
      }
      Object.values(enableDataSourceList).map(({ type, dataId }) => {
        if (!otherGroups[type]) otherGroups[type] = { type: type, datasource: [], ...commonIntervalConfig };
        const source = {};
        if (dataIdKeyInConfig[type]) {
          source[dataIdKeyInConfig[type]] = dataId;
        }
        otherGroups[type].datasource.push(source);
      });
      config.groups.push(...Object.values(otherGroups));
    }

    config.default_interval = defaultInterval;
    config.groups = config.groups.filter((group) => group.datasource.length > 0);
    FetchController.validateConfig(config);
    DebugUtil.debugLog(1, '本地蹲饼配置参考服务器配置：', serverInfo?.allConfig);
    DebugUtil.debugLog(0, '使用本地蹲饼配置：', config);
    this.fetchController = FetchController.create(
      config,
      (fetchData) => {
        if (fetchData.success) {
          void CookieHandler.handleLocal(fetchConfig.id, fetchData);
        } else {
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
    this.controllerConfig = config;
    this.fetchController.start();
  }

  async stop() {
    if (this.fetchController) await this.fetchController.stop();
    this.controllerConfig = undefined;
    this.runningFlag = false;
  }

  async checkAvailable() {
    if (!this.runningFlag || !this.controllerConfig) {
      return true;
    }
    try {
      FetchController.validateConfig(this.controllerConfig);
      return true;
    } catch (e) {
      return false;
    }
  }
}
