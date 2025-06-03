import { PLATFORM_CHROME, PLATFORM_EDGE, PLATFORM_FIREFOX, PLATFORM_UNKNOWN } from '../Constants';
import { Logger } from '../util/Logger';

/**
 * @type string
 */
let currentPlatform;
let head = navigator.userAgent;
if (head.indexOf('Edg') > 1) {
  Logger.log('当前平台：Edge');
  // Edge的userAgent即有Chrome又有Edg，因此先判断Edg
  currentPlatform = PLATFORM_EDGE;
} else if (head.indexOf('Chrome') > 1) {
  Logger.log('当前平台：Chrome');
  currentPlatform = PLATFORM_CHROME;
} else if (head.indexOf('Firefox') > 1) {
  Logger.log('当前平台：Firefox');
  currentPlatform = PLATFORM_FIREFOX;
}

if (currentPlatform === undefined) {
  Logger.log('当前平台：Unknown');
  currentPlatform = PLATFORM_UNKNOWN;
}

export const PlatformType = currentPlatform;
