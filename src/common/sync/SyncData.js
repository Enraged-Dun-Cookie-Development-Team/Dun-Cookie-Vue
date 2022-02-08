import PlatformHelper from "../platform/PlatformHelper";
import {deepAssign, deepEquals} from "../util/CommonFunctions";
import DebugUtil from "../util/DebugUtil";

function keyUpdate(key) {
  return 'sync-update:' + key;
}

function keyGet(key) {
  return 'sync-get:' + key;
}

function keyPersist(key) {
  return 'sync-persist:' + key;
}

class DataSyncMode {
  static ONLY_BACKGROUND_WRITABLE = 1;
  static ALL_WRITABLE = 2;
}

class DataSynchronizer {
  key;
  target;
  shouldPersist;

  proxy;
  updateFlag = false;
  updateListeners = [];
  updateCount = 0;

  constructor(key, target, shouldPersist) {
    this.key = key;
    this.target = target;
    this.shouldPersist = shouldPersist;
    PlatformHelper.Storage.getLocalStorage(keyPersist(key)).then(data => {
      if (this.updateCount === 0) {
        this.__update(data);
      }
    });
  }

  __update(data) {
    const changed = {};
    deepAssign(this.target, data, changed);
    this.updateCount++;
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
      setTimeout(async () => {
        this.updateFlag = false;
        if (this.shouldPersist) {
          await PlatformHelper.Storage.saveLocalStorage(keyPersist(this.key), this.target);
        }
        PlatformHelper.Message.send(keyUpdate(this.key), this.target).then();
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
      DebugUtil.debugLog(7, `更新${_this.key}: ${String(prop)}: ${value}`);
      return Reflect.set(...arguments);
    };
    handler.deleteProperty = function (target, prop) {
      DebugUtil.debugLog(7, `删除属性${_this.key}: ${String(prop)}`);
      return Reflect.deleteProperty(...arguments);
    };
    handler.defineProperty = function (target, prop, descriptor) {
      DebugUtil.debugLog(7, `添加属性${_this.key}: ${String(prop)}`);
      return Reflect.defineProperty(...arguments);
    };
    return new Proxy(this.target, handler);
  }

  createReadonlyProxy() {
    const handler = this.__createReadonlyProxyHandler();
    return new Proxy(this.target, handler);
  }

  __createReadonlyProxyHandler() {
    const _this = this;
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    let handler = {
      set(target, prop, value, receiver) {
        DebugUtil.debugLog(7, `禁止更新${_this.key}: ${String(prop)}: ${value}`);
        return false;
      },
      get(target, prop, receiver) {
        let flag = _this.isSyncProperty(prop);
        if (flag) {
          let value = _this[prop];
          if (typeof value === "function") {
            value = value.bind(_this);
          }
          DebugUtil.debugLog(7, `获取内部属性${_this.key}: ${String(prop)}: ${value}`);
          return value;
        }
        const value = Reflect.get(...arguments);
        DebugUtil.debugLog(7, `获取${_this.key}: ${String(prop)}: ${value}`);
        return value;
      }
    };
    // NOTICE 由于vue2使用property的方式做监听，所以不能禁止，否则vue就监听不到了
    //        但在vue3或者非vue环境中可以考虑禁止property操作
    let denyPropertyUpdate = false;
    if (denyPropertyUpdate) {
      // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
      handler = Object.assign(handler, {
        deleteProperty(target, prop) {
          DebugUtil.debugLog(7, `禁止删除属性${_this.key}: ${String(prop)}`);
          return false;
        },
        defineProperty(target, prop, descriptor) {
          DebugUtil.debugLog(7, `禁止添加属性${_this.key}: ${String(prop)}`);
          return false;
        },
      });
    }
    return handler;
  }

  isSyncProperty(prop) {
    return prop === 'registerUpdateListener';
  }

}

class DataSynchronizerAllWritable extends DataSynchronizer {
  constructor(key, target, shouldPersist) {
    super(key, target, shouldPersist);
    if (PlatformHelper.isBackground) {
      PlatformHelper.Message.registerListener(keyGet(key), keyGet(key), () => this.target);
    } else {
      PlatformHelper.Message.send(keyGet(key)).then(data => this.__update(data));
    }
    PlatformHelper.Message.registerListener(keyUpdate(key), keyUpdate(key), data => this.__update(data));
    this.proxy = this.createWritableProxy();
  }
}

class DataSynchronizerOnlyBackgroundWritable extends DataSynchronizer {
  constructor(key, target, shouldPersist) {
    super(key, target, shouldPersist);
    if (PlatformHelper.isBackground) {
      PlatformHelper.Message.registerListener(keyGet(key), keyGet(key), () => this.target);
      this.proxy = this.createWritableProxy();
    } else {
      PlatformHelper.Message.send(keyGet(key)).then(data => this.__update(data));
      PlatformHelper.Message.registerListener(keyUpdate(key), keyUpdate(key), data => this.__update(data));
      this.proxy = this.createReadonlyProxy();
    }
  }
}

function createSyncData(target, key, mode, shouldPersist = false) {
  let synchronizer = new DataSynchronizer(key, target);
  switch (mode) {
    case DataSyncMode.ALL_WRITABLE:
      synchronizer = new DataSynchronizerAllWritable(key, target, shouldPersist);
      break;
    case DataSyncMode.ONLY_BACKGROUND_WRITABLE:
      synchronizer = new DataSynchronizerOnlyBackgroundWritable(key, target, shouldPersist);
      break;
    default:
      throw new Error('unsupported sync mode: ' + mode);
  }
  console.log(`已启用同步数据：${key}`);
  return synchronizer.proxy;
}

// noinspection JSUnusedLocalSymbols
class CanSync {
  registerUpdateListener(listener) {
    throw new Error('仅用于IDE的友好提示，不应当被调用');
  }
}

export {createSyncData, DataSyncMode, CanSync};
