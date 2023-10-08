import { createSyncData, DataSyncMode } from './SyncData';

class CardList {
  /**
   * key是配置名，value是内容
   * @type {Record<string, CookieItem[]>}
   */
  firstPageCookieList = {};

  getFirstPageList() {
    return Object.values(this.firstPageCookieList)
      .flatMap((it) => it)
      .sort((a, b) => b.timeForSort - a.timeForSort);
  }
}

/**
 * @type {CardList & CanSync}
 */
const instance = createSyncData(new CardList(), 'cardList', DataSyncMode.ONLY_BACKGROUND_WRITABLE);
export default instance;
