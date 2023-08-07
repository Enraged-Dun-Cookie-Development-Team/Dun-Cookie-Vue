import { AbstractCookieFetcher } from '../AbstractCookieFetcher';
import ServerUtil from '../../../common/util/ServerUtil';
import { CookieHandler } from '../../CookieHandler';

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
    const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
    if (!serverInfo) {
      throw new Error('无法获取服务器配置');
    }
    const canteenIdList = fetchConfig.enableDataSourceList.map((it) => serverInfo.idMap[`${it.type}:${it.dataId}`]);
    this.comboId = (
      await ServerUtil.requestApi('POST', 'canteen/user/getDatasourceComb', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datasource_push: canteenIdList }),
      })
    ).datasource_comb_id;
    this.config = fetchConfig;
    this.runningFlag = true;
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
        const serverInfo = await ServerUtil.getServerDataSourceInfo(true);
        await ServerUtil.requestCdnServerApi(
          'cdn/cookie/mainList/cookieList?datasource_comb_id=' + encodeURIComponent(serverInfo.allComboId)
        );
        this.__setAvailable();
        return true;
      } catch (e) {
        this.nextCheckAvailableTime = Date.now() + this.nextCheckAvailableTimeFactory * 10 * 1000;
        this.nextCheckAvailableTimeFactory *= 2;
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
      const { cookie_id } = await ServerUtil.requestCdnApi('datasource-comb/' + encodeURIComponent(this.comboId));
      if (cookie_id && this.lastLatestCookieId !== cookie_id) {
        const result = await ServerUtil.requestCdnServerApi(
          `cdn/cookie/mainList/cookieList?datasource_comb_id=${encodeURIComponent(
            this.comboId
          )}&cookie_id=${encodeURIComponent(cookie_id)}`
        );
        await CookieHandler.handleServer(result);
      }
      this.__setAvailable();
    } catch (e) {
      this.failCount++;
      console.log(e);
    }
    setTimeout(() => {
      void this.doCycle();
    }, this.config.getCurrentInterval() * 1000);
  }
}
