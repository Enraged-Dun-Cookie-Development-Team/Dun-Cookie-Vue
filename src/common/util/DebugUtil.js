/**
 * @file 调试工具
 * 本文件用于人工调试操作，只要加载的时候不报错就行，不考虑方法内部的兼容性问题
 */

import PlatformHelper from '../platform/PlatformHelper';

// noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
export class DebugUtil {
  /**
   * 清除storage(保留Settings)
   * <p>
   * 值得注意的是虽然这里主动保留了Settings，但由于Settings的同步机制，事实上想要放弃当前Settings恢复默认设置反而更麻烦
   *
   * @return {Promise<void>}
   */
  static async clearStorage() {
    const settings = await PlatformHelper.Storage.getLocalStorage('settings');
    await PlatformHelper.Storage.clearLocalStorage();
    await PlatformHelper.Storage.saveLocalStorage('settings', settings);
  }
}
