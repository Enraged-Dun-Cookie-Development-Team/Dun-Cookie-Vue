import { CookieFetchManager, registerFetcher } from './fetcher/CookieFetcherManager';
import { CeobeCanteenCookieFetcher } from './fetcher/impl/CeobeCanteenCookieFetcher';
import { FallbackLocalCookieFetcher } from './fetcher/impl/FallbackLocalCookieFetcher';
import { CustomLocalCookieFetcher } from './fetcher/impl/CustomLocalCookieFetcher';
import { FetchConfig, FetcherStrategy } from './fetcher/FetchConfig';
import Settings from '../common/Settings';

const cookieFetcherManager = new CookieFetchManager();

registerFetcher('server', CeobeCanteenCookieFetcher);
/* IFTRUE_feature__local_fetch */
registerFetcher('local-fallback', FallbackLocalCookieFetcher);
/* FITRUE_feature__local_fetch */
/* IFTRUE_feature__custom_datasource */
registerFetcher('local-custom', CustomLocalCookieFetcher);
/* FITRUE_feature__custom_datasource */

/**
 * TODO 之后这个要改成能够自定义的
 *
 * @return {FetchConfig}
 */
function buildMainCookieFetchConfig(enable = true) {
  return new FetchConfig(
    MAIN_FETCH_CONFIG_KEY,
    enable,
    Settings.enableDataSources,
    Settings.dun.intervalTime,
    Settings.dun.autoLowFrequency
      ? Settings.dun.lowFrequencyTime.map((it) => {
          let realHour;
          if (it < 12) realHour = it + 12;
          else realHour = it - 12;
          return realHour;
        })
      : undefined,
    Settings.dun.autoLowFrequency ? Settings.dun.timeOfLowFrequency : 1,
    [
      new FetcherStrategy('default', 'server'),
      /* IFTRUE_feature__local_fetch */
      new FetcherStrategy('default', 'local-fallback'),
      /* FITRUE_feature__local_fetch */
    ]
  );
}

/* IFTRUE_feature__custom_datasource */
/**
 * @return {FetchConfig}
 */
function buildCustomCookieFetchConfig(enable = true) {
  return new FetchConfig(
    CUSTOM_FETCH_CONFIG_KEY,
    enable,
    Settings.extraFeature.enableCustomDataSources,
    Settings.dun.intervalTime,
    Settings.dun.autoLowFrequency
      ? Settings.dun.lowFrequencyTime.map((it) => {
          let realHour;
          if (it < 12) realHour = it + 12;
          else realHour = it - 12;
          return realHour;
        })
      : undefined,
    Settings.dun.autoLowFrequency ? Settings.dun.timeOfLowFrequency : 1,
    [new FetcherStrategy('default', 'local-custom')]
  );
}
/* FITRUE_feature__custom_datasource */

const MAIN_FETCH_CONFIG_KEY = 'main';
const CUSTOM_FETCH_CONFIG_KEY = 'custom';

export function updateFetch() {
  // 主配置在配置页面保证了不可能为空，自定义配置可能为空
  cookieFetcherManager.updateFetchConfig(MAIN_FETCH_CONFIG_KEY, buildMainCookieFetchConfig(true));
  /* IFTRUE_feature__custom_datasource */
  if (Settings.extraFeature.enableCustomDataSources?.length > 0) {
    cookieFetcherManager.updateFetchConfig(CUSTOM_FETCH_CONFIG_KEY, buildCustomCookieFetchConfig(true));
  } else {
    cookieFetcherManager.removeFetchConfig(CUSTOM_FETCH_CONFIG_KEY);
  }
  /* FITRUE_feature__custom_datasource */
}

export function stopFetch() {
  cookieFetcherManager.removeFetchConfig(MAIN_FETCH_CONFIG_KEY);
  cookieFetcherManager.removeFetchConfig(CUSTOM_FETCH_CONFIG_KEY);
}
