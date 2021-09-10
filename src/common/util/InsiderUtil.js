import SHA512 from 'crypto-js/sha512';
import Settings from '../Settings';

export default class InsiderUtil {
  static resetInsiderLevel(codeMap) {
    const [newLevel, _] = InsiderUtil.calcInsiderLevel(Settings.insider.code, codeMap);
    Settings.insider.level = newLevel;
    Settings.saveSettings();
  }

  static calcInsiderLevel(code, codeMap) {
    let newLevel = 0;
    let validCode = false;
    if (code && codeMap) {
      const levelStr = codeMap[SHA512(code)];
      if (levelStr && /^\d+$/.test(String(levelStr))) {
        newLevel = parseInt(levelStr);
        validCode = true;
      }
    }
    console.log(newLevel);
    return [newLevel, validCode];
  }
}