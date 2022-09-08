import { PLATFORM_UNKNOWN } from '../../Constants';
import ChromePlatform from "./ChromePlatform";

/**
 * 鉴于之前用Chrome在各平台一直没啥问题，因此未知平台直接继承ChromePlatform
 */
export default class UnknownPlatform extends ChromePlatform {

    constructor() {
        super();
    }

    get PlatformType() {
        return PLATFORM_UNKNOWN;
    }

}
