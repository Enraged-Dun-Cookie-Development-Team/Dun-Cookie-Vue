class BrowserUtil {
  static sendMessage(message) {
    return chrome.runtime.sendMessage(message);
  }

  static addMessageListener(listener) {
    return chrome.runtime.onMessage.addListener(listener);
  }
}

export default BrowserUtil;
