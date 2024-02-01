import { FetchConfig } from './FetchConfig';
import DebugUtil from '../../common/util/DebugUtil';

/**
 * 蹲饼器接口
 */
export class AbstractCookieFetcher {
  failCount = 0;
  nextCheckAvailableTime = -1;
  // 从10秒间隔开始
  nextCheckAvailableTimeInterval = 10;
  // 限制最大重试间隔为10分钟
  maxNextCheckAvailableTime = 600;
  nextCheckAvailableTimeFactory = 1.5;

  /**
   * 开始蹲饼
   *
   * @param fetchConfig {FetchConfig} 蹲饼配置
   * @return {Promise<void>}
   */
  async start(fetchConfig) {
    throw new Error(`蹲饼器${this.constructor.name}未实现方法start`);
  }

  /**
   * 停止蹲饼
   *
   * 不支持暂停，只允许停止后重新开始
   * @return {Promise<void>}
   */
  async stop() {
    throw new Error(`蹲饼器${this.constructor.name}未实现方法stop`);
  }

  /**
   * 检查当前蹲饼器是否可用
   * @return {Promise<boolean>}
   */
  async checkAvailable() {
    if (this.failCount < 3) {
      return true;
    }
    if (Date.now() >= this.nextCheckAvailableTime) {
      try {
        if (await this._checkAvailable()) {
          this.__setAvailable();
          return true;
        }
      } catch (e) {
        // ignored
      }
      this.nextCheckAvailableTime = Math.floor(Date.now() + this.nextCheckAvailableTimeInterval * 1000);
      this.nextCheckAvailableTimeInterval = Math.min(
        this.maxNextCheckAvailableTime,
        this.nextCheckAvailableTimeInterval * this.nextCheckAvailableTimeFactory
      );
      DebugUtil.debugLog(0, `[${this.constructor.name}]暂时不可用，下次重试：` + this.nextCheckAvailableTime);
    }
    return false;
  }

  /**
   * 实际检查当前蹲饼器是否可用
   * @return {Promise<boolean>}
   */
  async _checkAvailable() {
    throw new Error(`蹲饼器${this.constructor.name}未实现方法_checkAvailable`);
  }

  __setAvailable() {
    this.failCount = 0;
    this.nextCheckAvailableTime = -1;
    this.nextCheckAvailableTimeFactory = 10;
  }
}
