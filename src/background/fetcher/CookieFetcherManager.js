import DebugUtil from '../../common/util/DebugUtil';
import CardList from '../../common/sync/CardList';

/**
 * @type {Record<string, {id: string, ctor: () => AbstractCookieFetcher}>}
 */
const fetcherMap = {};

/**
 * @param id {string}
 * @param ctor {() => AbstractCookieFetcher}
 */
export function registerFetcher(id, ctor) {
  fetcherMap[id] = {
    id: id,
    ctor: ctor,
  };
}

class FetcherController {
  /**
   * @type {FetchConfig}
   */
  fetchConfig;
  /**
   * @type {AbstractCookieFetcher[]}
   */
  fetchers;
  /**
   * @type {number}
   */
  currentFetcherIdx;

  /**
   * @param fetchConfig {FetchConfig}
   */
  constructor(fetchConfig) {
    this.fetchConfig = fetchConfig;
    // eslint-disable-next-line new-cap
    this.fetchers = fetchConfig.fetcherStrategyList.map((strategy) => new fetcherMap[strategy.fetcher].ctor());
  }

  /**
   * 根据条件自动启用/禁用蹲饼器
   * @return {Promise<void>}
   */
  async updateFetcher() {
    const now = new Date();
    const defaultStrategyIdxList = [];
    let newFetcherIdx = -1;
    for (let i = 0; i < this.fetchConfig.fetcherStrategyList.length; i++) {
      if (newFetcherIdx >= 0) break;
      const strategy = this.fetchConfig.fetcherStrategyList[i];
      const [conditionType, remain] = strategy.condition.split(':');
      const conditionParams = remain ? remain.split('|') : [];
      switch (conditionType) {
        case 'default':
          defaultStrategyIdxList.push(i);
          break;
        case 'hour_range':
          for (const param of conditionParams) {
            const [start, end] = param.split(',').map((it) => parseInt(it));
            if (start <= end) {
              if (now.getHours() >= start && now.getHours() < end) {
                newFetcherIdx = i;
                break;
              }
            } else {
              if (now.getHours() >= start || now.getHours() < end) {
                newFetcherIdx = i;
                break;
              }
            }
          }
          break;
      }
    }
    if (newFetcherIdx < 0) {
      for (const fetcherIdx of defaultStrategyIdxList) {
        if (await this.fetchers[fetcherIdx].checkAvailable()) {
          newFetcherIdx = fetcherIdx;
          break;
        }
      }
    }

    const oldFetcherIdx = this.currentFetcherIdx;
    if (oldFetcherIdx !== newFetcherIdx) {
      try {
        if (this.currentFetcherIdx >= 0) {
          await this.stop();
        }
        if (newFetcherIdx >= 0) {
          this.currentFetcherIdx = newFetcherIdx;
          DebugUtil.debugLog(
            0,
            `[${this.fetchConfig.id}]蹲饼器切换为：`,
            this.fetchConfig.fetcherStrategyList[this.currentFetcherIdx].fetcher
          );
          if (this.fetchConfig.enable) {
            await this.start();
          }
        } else {
          DebugUtil.debugLog(0, `[${this.fetchConfig.id}]蹲饼器切换失败！所有蹲饼器都暂时不可用！`);
        }
      } catch (e) {
        this.currentFetcherIdx = oldFetcherIdx;
        console.log(e);
        DebugUtil.debugLog(0, `[${this.fetchConfig.id}]蹲饼器切换失败！`);
      }
    }
  }

  async start() {
    if (this.fetchConfig.enableDataSourceList.length > 0) {
      DebugUtil.debugLog(
        0,
        `[${this.fetchConfig.id}]蹲饼器启动：`,
        this.fetchConfig.fetcherStrategyList[this.currentFetcherIdx].fetcher
      );
      await this.fetchers[this.currentFetcherIdx].start(this.fetchConfig);
    } else {
      DebugUtil.debugLog(0, `[${this.fetchConfig.id}]未启用任何数据源，不启动蹲饼器`);
    }
  }

  async stop() {
    DebugUtil.debugLog(
      0,
      `[${this.fetchConfig.id}]蹲饼器停止：`,
      this.fetchConfig.fetcherStrategyList[this.currentFetcherIdx].fetcher
    );
    await this.fetchers[this.currentFetcherIdx].stop();
    delete CardList.firstPageCookieList[this.fetchConfig.id];
    CardList.sendUpdateAtNextTick();
  }
}

/**
 * 蹲饼管理器
 *
 * 根据蹲饼配置管理蹲饼器
 */
export class CookieFetchManager {
  /**
   * @type {Record<string, FetchConfig>}
   */
  fetchConfigMap = {};
  /**
   * @type {Record<string, FetcherController>}
   */
  fetchControllerMap = {};

  constructor() {
    const cycle = async () => {
      for (const controller of Object.values(this.fetchControllerMap)) {
        await controller.updateFetcher();
      }
      setTimeout(() => {
        cycle();
      }, 5 * 1000);
    };
    void cycle();
  }

  /**
   * 获取当前所有蹲饼配置
   *
   * @return {Record<string, FetchConfig>}
   */
  getAllFetchConfig() {
    return this.fetchConfigMap;
  }

  /**
   * 获取当前所有启用的蹲饼配置
   *
   * @return {Record<string, FetchConfig>}
   */
  getAllEnableFetchConfig() {
    return Object.fromEntries(Object.entries(this.fetchConfigMap).filter(([_, cfg]) => cfg.enable));
  }

  /**
   * 更新蹲饼配置
   *
   * 由于修改蹲饼配置会触发蹲饼器的重启，所以该方法是异步的
   *
   * @param id {string} 蹲饼配置id
   * @param config {FetchConfig} 蹲饼配置内容
   *
   * @return {FetchConfig | undefined} 返回旧的蹲饼配置内容，如果当前不存在指定id的蹲饼配置则返回undefined
   */
  async updateFetchConfig(id, config) {
    const oldConfig = this.fetchConfigMap[id];
    this.fetchConfigMap[id] = config;

    const oldController = this.fetchControllerMap[id];
    if (oldController) {
      await oldController.stop();
    }
    const newController = new FetcherController(config);
    this.fetchControllerMap[id] = newController;
    await newController.updateFetcher();
    return oldConfig;
  }

  /**
   * 设置蹲饼配置状态
   *
   * 由于启用/禁用蹲饼配置会触发蹲饼器的启动/停止，所以该方法是异步的
   *
   * @param id {string} 蹲饼配置id
   * @param enable {boolean} 是否启用蹲饼配置
   *
   * @return {boolean} 成功更新状态返回true，如果蹲饼配置不存在会返回false
   */
  async updateFetchConfigStatus(id, enable) {
    const config = this.fetchConfigMap[id];
    if (!config || config.enable === enable) {
      return false;
    }
    config.enable = enable;
    const controller = this.fetchControllerMap[id];
    if (controller) {
      if (enable) {
        await controller.start();
      } else {
        await controller.stop();
      }
    }
    return true;
  }

  /**
   * 移除蹲饼配置
   *
   * 由于移除蹲饼配置会触发蹲饼器的停止，所以该方法是异步的
   *
   * @param id {string} 蹲饼配置id
   *
   * @return {FetchConfig | undefined} 返回被移除的蹲饼配置内容，如果不存在指定id的蹲饼配置则返回undefined
   */
  async removeFetchConfig(id) {
    const old = this.fetchConfigMap[id];
    delete this.fetchConfigMap[id];
    const controller = this.fetchControllerMap[id];
    if (controller) {
      await controller.stop();
    }
    return old;
  }
}
