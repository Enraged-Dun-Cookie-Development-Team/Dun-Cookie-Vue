import { PLATFORM_CHROME } from '../../Constants';
import ChromeFirefoxCommonPlatform from './ChromeFirefoxCommonPlatform';

// noinspection JSUnresolvedVariable
export default class ChromePlatform extends ChromeFirefoxCommonPlatform {
  constructor() {
    super();
  }

  get PlatformType() {
    return PLATFORM_CHROME;
  }

  download(url, filename, saveAs) {
    const options = {
      url: url,
    };
    if (filename && typeof filename === 'string') {
      options.filename = filename;
    }
    if (typeof saveAs === 'boolean') {
      options.saveAs = saveAs;
    }
    return chrome.downloads.download(options);
  }
}
