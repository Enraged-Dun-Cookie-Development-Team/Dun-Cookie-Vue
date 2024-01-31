import { AbstractCookieFetcher } from '../AbstractCookieFetcher';
import ServerUtil from '../../../common/util/ServerUtil';
import { CookieHandler } from '../../CookieHandler';
import DebugUtil from '../../../common/util/DebugUtil';

export class CeobeCanteenCookieFetcher extends AbstractCookieFetcher {
  /**
   * @type {string}
   */
  comboId;
  runningFlag = false;
  /**
   * @type {FetchConfig}
   */
  config;

  failCount = 0;
  nextCheckAvailableTime = -1;
  nextCheckAvailableTimeFactory = 1;

  lastLatestCookieId;

  async start(fetchConfig) {
    if (this.runningFlag) return;
    this.config = fetchConfig;
    try {
      this.comboId = await ServerUtil.getComboId(fetchConfig.enableDataSourceList);
    } catch (e) {
      this.failCount++;
      throw e;
    }
    this.runningFlag = true;
    CookieHandler.resetLastServerList();
    void this.doCycle();
  }

  async stop() {
    this.runningFlag = false;
  }

  async checkAvailable() {
    if (this.failCount < 3) {
      return true;
    }
    if (Date.now() >= this.nextCheckAvailableTime) {
      try {
        if (!this.comboId) {
          this.comboId = await ServerUtil.getComboId(this.config.enableDataSourceList);
        }
        const { cookie_id, update_cookie_id } = JSON.parse(
          await ServerUtil.requestCdn('datasource-comb/' + encodeURIComponent(this.comboId), { cache: 'no-cache' })
        );
        if (cookie_id) {
          await ServerUtil.getCookieList(this.comboId, cookie_id, update_cookie_id);
        }
        this.__setAvailable();
        return true;
      } catch (e) {
        this.nextCheckAvailableTime = Math.floor(Date.now() + this.nextCheckAvailableTimeFactory * 10 * 1000);
        // 限制最大重试间隔为10分钟(60 * 10秒)
        this.nextCheckAvailableTimeFactory = Math.min(60, this.nextCheckAvailableTimeFactory * 1.5);
        DebugUtil.debugLog(0, '无法访问服务器，下次重试：' + this.nextCheckAvailableTime);
        return false;
      }
    } else {
      return false;
    }
  }

  __setAvailable() {
    this.failCount = 0;
    this.nextCheckAvailableTime = -1;
    this.nextCheckAvailableTimeFactory = 1;
  }

  async doCycle() {
    if (!this.runningFlag) return;
    try {
      const { cookie_id, update_cookie_id } = JSON.parse(
        await ServerUtil.requestCdn('datasource-comb/' + encodeURIComponent(this.comboId), { cache: 'no-cache' })
      );
      await PlatformHelper.Storage.saveLocalStorage('server_update_cookie_id', update_cookie_id);
      if (cookie_id && this.lastLatestCookieId !== cookie_id) {
        const result = await ServerUtil.getCookieList(this.comboId, cookie_id, update_cookie_id);
        await PlatformHelper.Storage.saveLocalStorage('server_secondary_page_cookie_id', result.next_page_id);
        await CookieHandler.handleServer(this.config.id, result);
        this.lastLatestCookieId = cookie_id;
      } else if (cookie_id === null) {
        CookieHandler.handleServerNull(this.config.id);
      } else {
        CookieHandler.handleServerNotChange();
      }
      this.__setAvailable();
    } catch (e) {
      this.failCount++;
      DebugUtil.debugLog(0, '蹲饼时出现异常(server)：' + e.message);
      console.log(e);
    }
    setTimeout(() => {
      this.doCycle();
    }, this.config.getCurrentInterval() * 1000);
  }
}
