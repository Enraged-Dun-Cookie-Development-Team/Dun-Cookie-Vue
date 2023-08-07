import { FetchConfig } from './FetchConfig';

/**
 * 蹲饼器接口
 *
 * TODO 实现自定义数据源
 */
export class AbstractCookieFetcher {
  /**
   * 开始蹲饼
   *
   * @param fetchConfig {FetchConfig} 蹲饼配置
   * @return {Promise<void>}
   */
  async start(fetchConfig) {
    throw new Error(`蹲饼器${this.id}未实现方法start`);
  }

  /**
   * 停止蹲饼
   *
   * 不支持暂停，只允许停止后重新开始
   * @return {Promise<void>}
   */
  async stop() {
    throw new Error(`蹲饼器${this.id}未实现方法stop`);
  }

  /**
   * 检查当前蹲饼器是否可用
   * @return {Promise<boolean>}
   */
  async checkAvailable() {
    throw new Error(`蹲饼器${this.id}未实现方法checkAvailable`);
  }
}
