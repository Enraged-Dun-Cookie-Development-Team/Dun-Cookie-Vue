import { CustomLocalCookieFetcher } from './CustomLocalCookieFetcher';
import ServerUtil from '../../../common/util/ServerUtil';
import { FetchController } from '@enraged-dun-cookie-development-team/cookie-fetcher-core';
import DebugUtil from '../../../common/util/DebugUtil';
/* IFTRUE_feature__local_fetch */
import { registerDefaultDataSourceTypes } from '@enraged-dun-cookie-development-team/cookie-fetcher';

registerDefaultDataSourceTypes();
/* FITRUE_feature__local_fetch */

export class FallbackLocalCookieFetcher extends CustomLocalCookieFetcher {
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
    const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
    if (!serverInfo) {
      throw new Error('服务器信息不可用');
    }
    const config = JSON.parse(JSON.stringify(serverInfo.allConfig));
    // fallback的默认间隔强行改为60秒，以避免过多的请求
    let defaultInterval = Math.max(fetchConfig.globalInterval * 1000, 60 * 1000);
    defaultInterval = Math.max(defaultInterval, config.default_interval || 5000);
    for (const group of config.groups) {
      if (group.interval) {
        group.interval = Math.max(group.interval, defaultInterval);
      }
      if (fetchConfig.lowFrequencyTimeRange && fetchConfig.lowFrequencyMultiple > 1) {
        this.updateGroupIntervalByTimeRange(defaultInterval, fetchConfig, group);
      }
      group.datasource = group.datasource.filter((source) => {
        const key = `${group.type}:${source[this.dataIdKeyInConfig[group.type]] || '-'}`;
        if (enableDataSourceList[key]) {
          delete enableDataSourceList[key];
          return true;
        } else {
          return false;
        }
      });
    }
    if (Object.keys(enableDataSourceList).length > 0) {
      DebugUtil.debugLog(0, '未知数据源：', Object.keys(enableDataSourceList));
    }

    config.default_interval = defaultInterval;
    config.groups = config.groups.filter((group) => group.datasource.length > 0);
    DebugUtil.debugLog(1, '本地蹲饼配置参考服务器配置：', serverInfo?.allConfig);
    this.startWithFetcherControllerConfig(config, fetchConfig);
  }

  async stop() {
    if (this.fetchController) await this.fetchController.stop();
    this.controllerConfig = undefined;
    this.runningFlag = false;
  }

  async _checkAvailable() {
    const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
    if (!serverInfo) {
      return false;
    }
    return super._checkAvailable();
  }
}
