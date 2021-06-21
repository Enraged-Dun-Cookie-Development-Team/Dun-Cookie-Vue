class StorageUtil {
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
