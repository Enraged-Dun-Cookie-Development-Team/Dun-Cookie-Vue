class StorageUtil {
  // TODO 这个类中的chrome调用本应移动到BrowserUtil中，但是由于调用方式略显奇怪，等到storage与message相关内容重构完后再移动，需阅读每一项该方法调用确保不会出问题

  static getLocalStorage(name) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([name], (result) => {
        if (Object.keys(result).length > 0) {
          resolve(result[name]);
          return;
        }
        resolve(null);
      });
    });
  }

  static saveLocalStorage(name, data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [name]: data }, () => {
        resolve(true);
      });
    });
  }

}

export default StorageUtil;
