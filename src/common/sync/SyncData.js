import PlatformHelper from "../platform/PlatformHelper";
import {deepAssign, deepEquals} from "../util/CommonFunctions";

function keyUpdate(key) {
  return 'sync-update:' + key;
}

function keyGet(key) {
  return 'sync-get:' + key;
}

class DataSyncMode {
  static ONLY_BACKGROUND_WRITABLE = 1;
  static ALL_WRITABLE = 2;
}

class DataSynchronizer {
  key;
  target;

  proxy;
  updateFlag = false;
  updateListeners = [];

  constructor(key, target) {
    this.key = key;
    this.target = target;
    if (PlatformHelper.isBackground) {
      PlatformHelper.Message.registerListener(keyGet(key), keyGet(key), () => this.target);
    } else {
      PlatformHelper.Message.send(keyGet(key)).then(data => this.__update(data));
    }
    PlatformHelper.Message.registerListener(keyUpdate(key), keyUpdate(key), data => this.__update(data));
  }

  __update(data) {
    const changed = {};
    deepAssign(this.target, data, changed);
    // console.log(`同步更新${this.key}：`);
    // console.log(changed);
    for (const listener of this.updateListeners) {
      listener(this.proxy, changed);
    }
  }

  registerUpdateListener(listener) {
    this.updateListeners.push(listener);
  }

  sendUpdateAtNextTick() {
    if (!this.updateFlag) {
      setTimeout(() => {
        PlatformHelper.Message.send(keyUpdate(this.key), this.target).then();
        this.updateFlag = false;
      });
      this.updateFlag = true;
    }
  }

  createWritableProxy() {
    const _this = this;
    const handler = this.__createReadonlyProxyHandler();
    handler.set = function (target, prop, value, receiver) {
      if (!deepEquals(target[prop], value)) {
        _this.sendUpdateAtNextTick();
      }
      // console.log(`更新${_this.key}: ${String(prop)}: ${value}`);
      return Reflect.set(...arguments);
    };
    handler.deleteProperty = function (target, prop) {
      // console.log(`删除属性${_this.key}: ${String(prop)}`);
      return Reflect.deleteProperty(...arguments);
    };
    handler.defineProperty = function (target, prop, descriptor) {
      // console.log(`添加属性${_this.key}: ${String(prop)}`);
      return Reflect.defineProperty(...arguments);
    };
    this.proxy = new Proxy(this.target, handler);
    return this.proxy;
  }

  createReadonlyProxy() {
    const handler = this.__createReadonlyProxyHandler();
    this.proxy = new Proxy(this.target, handler);
    return this.proxy;
  }

  __createReadonlyProxyHandler() {
    const _this = this;
    return {
      deleteProperty(target, prop) {
        // console.log(`禁止删除属性${_this.key}: ${String(prop)}`);
        return false;
      },
      defineProperty(target, prop, descriptor) {
        // console.log(`禁止添加属性${_this.key}: ${String(prop)}`);
        return false;
      },
      set(target, prop, value, receiver) {
        // console.log(`禁止更新${_this.key}: ${String(prop)}: ${value}`);
        return false;
      },
      get(target, prop, receiver) {
        let flag = _this.isSyncProperty(prop);
        if (flag) {
          let value = _this[prop];
          if (typeof value === "function") {
            value = value.bind(_this);
          }
          // console.log(`获取内部属性${_this.key}: ${String(prop)}: ${value}`);
          return value;
        }
        const value = Reflect.get(...arguments);
        // console.log(`获取${_this.key}: ${String(prop)}: ${value}`);
        return value;
      }
    };
  }

  isSyncProperty(prop) {
    return prop === 'registerUpdateListener';
  }

}

function createSyncData(target, key, mode) {
  const synchronizer = new DataSynchronizer(key, target);
  console.log(`已启用同步数据：${key}`);
  switch (mode) {
    case DataSyncMode.ALL_WRITABLE:
      return synchronizer.createWritableProxy();
    case DataSyncMode.ONLY_BACKGROUND_WRITABLE:
      if (PlatformHelper.isBackground) {
        return synchronizer.createWritableProxy();
      } else {
        return synchronizer.createReadonlyProxy();
      }
    default:
      throw new Error('unsupported sync mode: ' + mode);
  }
}

class CanSync {
  registerUpdateListener(listener) {
    throw new Error('仅用于IDE的友好提示，不应当被调用');
  }
}

export {createSyncData, DataSyncMode, CanSync};
