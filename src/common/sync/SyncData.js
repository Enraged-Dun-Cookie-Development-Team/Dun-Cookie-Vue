import PlatformHelper from '../platform/PlatformHelper';
import { deepAssign, deepEquals } from '../util/CommonFunctions';
import DebugUtil from '../util/DebugUtil';

// 该类仅用于IDE友好提示
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class CanSync {
  doAfterUpdate(listener) {
    throw new Error('仅用于IDE的友好提示，不应当被调用');
  }

  doAfterInit(listener) {
    throw new Error('仅用于IDE的友好提示，不应当被调用');
  }

  doAfterFirstUpdate(listener) {
    throw new Error('仅用于IDE的友好提示，不应当被调用');
  }
}

function keyUpdate(key) {
  return 'sync-update:' + key;
}

function keyGet(key) {
  return 'sync-get:' + key;
}

function keyPersist(key) {
  return 'sync-persist:' + key;
}

/**
 * 数据同步模式
 */
class DataSyncMode {
  /**
   * 仅后台可写，前台是只读模式
   */
  static ONLY_BACKGROUND_WRITABLE = 1;
  /**
   * 前后台都自由读/写
   */
  static ALL_WRITABLE = 2;
}

const CanSyncMethods = (() => {
  const obj = new CanSync();
  const list = [];
  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach((methodName) => {
    if (methodName !== 'constructor') {
      list.push(methodName);
    }
  });
  return list;
})();

class DataSynchronizer {
  key;
  target;
  shouldPersist;

  proxy;
  updateFlag = false;
  updateCount = 0;
  updateListeners = [];
  firstUpdateCall = false;
  firstUpdateListeners = [];
  inited = false;
  initListeners = [];

  updateHandler;

  constructor(key, target, shouldPersist, updateHandler, dataInitFn) {
    this.key = key;
    this.target = target;
    this.shouldPersist = shouldPersist;
    if (typeof updateHandler === 'function') {
      this.updateHandler = updateHandler;
    } else {
      this.updateHandler = deepAssign;
    }
    const fn = async () => {
      // 如果有初始化函数，则无条件将初始化函数作为初始数据
      if (typeof dataInitFn === 'function') {
        const initData = await dataInitFn();
        this.__handleReloadOrReceiveUpdate(initData, true);
      }
      // 当且仅当未进行过更新且storage中有数据时才会将storage中的数据设为当前数据
      // 如果已经接收过数据更新则忽略storage中的数据
      const data = await PlatformHelper.Storage.getLocalStorage(keyPersist(key));
      if (this.updateCount === 0 && data) {
        DebugUtil.debugLog(6, `从Storage中读取${this.key}: `, data);
        this.__handleReloadOrReceiveUpdate(data, true);
      }
      this.__setInited();
    };
    void fn();
  }

  __setInited() {
    if (this.inited) {
      return;
    }
    this.inited = true;
    for (const listener of this.initListeners) {
      listener(this.proxy);
    }
  }

  __handleFirstUpdateListener(changed) {
    if (this.firstUpdateCall) {
      return;
    }
    this.firstUpdateCall = true;
    const changed_str = JSON.stringify(changed);
    for (const listener of this.firstUpdateListeners) {
      listener(this.proxy, JSON.parse(changed_str));
    }
  }

  __handleUpdateListener(changed) {
    const changed_str = JSON.stringify(changed);
    for (const listener of this.updateListeners) {
      listener(this.proxy, JSON.parse(changed_str));
    }
  }

  __handleReloadOrReceiveUpdate(data, isReload = false) {
    const changed = {};
    this.updateHandler(this.target, data, changed);
    if (isReload) {
      DebugUtil.debugLog(6, `从storage中读取${this.key}: `, data, 'changed: ', changed);
    } else {
      this.updateCount++;
      DebugUtil.debugLog(6, `接收更新${this.key}: `, data, 'changed: ', changed);
      this.__handleFirstUpdateListener(changed);
      this.__handleUpdateListener(changed);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  doAfterInit(listener) {
    if (this.inited) {
      listener(this.proxy);
    } else {
      this.initListeners.push(listener);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  doAfterFirstUpdate(listener) {
    if (this.updateCount > 0) {
      listener(this.proxy);
    } else {
      this.firstUpdateListeners.push(listener);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  doAfterUpdate(listener) {
    this.updateListeners.push(listener);
  }

  /**
   * 因为一次可以更新多个值，为减少开销，所以在下1毫秒(由于浏览器实现不同一般超过1毫秒，但是一般都在个位数毫秒级)统一发送更新
   */
  sendUpdateAtNextTick() {
    if (!this.updateFlag) {
      setTimeout(async () => {
        this.updateFlag = false;
        if (this.shouldPersist) {
          await PlatformHelper.Storage.saveLocalStorage(keyPersist(this.key), this.target);
        }
        DebugUtil.debugLog(6, `发送更新${this.key}: `, this.target);
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
        DebugUtil.debugLog(7, `更新${_this.key}: ${String(prop)}: `, value);
      }
      return Reflect.set(...arguments);
    };
    handler.deleteProperty = function (target, prop) {
      if (target.hasOwnProperty(prop)) {
        _this.sendUpdateAtNextTick();
        DebugUtil.debugLog(7, `删除属性${_this.key}: ${String(prop)}`);
      }
      return Reflect.deleteProperty(...arguments);
    };
    handler.defineProperty = function (target, prop, descriptor) {
      if (target.hasOwnProperty(prop)) {
        if (Object.keys(descriptor).length === 1 && descriptor.hasOwnProperty('value')) {
          // ignore 这种情况一般也会触发set的handler，故忽略
        } else {
          DebugUtil.debugLog(7, `修改属性${_this.key}: ${String(prop)}`, descriptor);
        }
      } else {
        DebugUtil.debugLog(7, `添加属性${_this.key}: ${String(prop)}`, descriptor);
      }
      if (descriptor && descriptor.hasOwnProperty('value') && !deepEquals(target[prop], descriptor.value)) {
        _this.sendUpdateAtNextTick();
      }
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
        DebugUtil.debugLog(7, `禁止更新${_this.key}: ${String(prop)}: `, value);
        return false;
      },
      get(target, prop, receiver) {
        let flag = _this.isSyncProperty(prop);
        if (flag) {
          let value = _this[prop];
          if (typeof value === 'function') {
            value = value.bind(_this);
          }
          DebugUtil.debugLog(7, `获取内部属性${_this.key}: ${String(prop)}: `, value);
          return value;
        }
        const value = Reflect.get(...arguments);
        DebugUtil.debugLog(9, `获取${_this.key}: ${String(prop)}: `, value);
        return value;
      },
    };
    // NOTICE 由于vue2使用property的方式做监听，所以不能禁止，否则vue就监听不到了
    //        但在vue3或者非vue环境中可以考虑禁止property操作
    let denyPropertyUpdate = false;
    if (denyPropertyUpdate) {
      handler.deleteProperty = function (target, prop) {
        DebugUtil.debugLog(7, `禁止删除属性${_this.key}: ${String(prop)}`);
        return false;
      };
      handler.defineProperty = function (target, prop, descriptor) {
        DebugUtil.debugLog(7, `禁止添加属性${_this.key}: ${String(prop)}`, descriptor);
        return false;
      };
    }
    return handler;
  }

  isSyncProperty(prop) {
    return CanSyncMethods.indexOf(prop) !== -1;
  }
}

class DataSynchronizerAllWritable extends DataSynchronizer {
  constructor(key, target, shouldPersist, updateHandler, dataInitFn) {
    super(key, target, shouldPersist, updateHandler, dataInitFn);
    if (PlatformHelper.isBackground) {
      PlatformHelper.Message.registerListener(keyGet(key), keyGet(key), () => this.target);
    } else {
      PlatformHelper.Message.send(keyGet(key)).then((data) => this.__handleReloadOrReceiveUpdate(data));
    }
    PlatformHelper.Message.registerListener(keyUpdate(key), keyUpdate(key), (data) =>
      this.__handleReloadOrReceiveUpdate(data)
    );
    this.proxy = this.createWritableProxy();
  }
}

class DataSynchronizerOnlyBackgroundWritable extends DataSynchronizer {
  constructor(key, target, shouldPersist, updateHandler, dataInitFn) {
    super(key, target, shouldPersist, updateHandler, dataInitFn);
    if (PlatformHelper.isBackground) {
      PlatformHelper.Message.registerListener(keyGet(key), keyGet(key), () => this.target);
      this.proxy = this.createWritableProxy();
    } else {
      PlatformHelper.Message.send(keyGet(key)).then((data) => this.__handleReloadOrReceiveUpdate(data));
      PlatformHelper.Message.registerListener(keyUpdate(key), keyUpdate(key), (data) =>
        this.__handleReloadOrReceiveUpdate(data)
      );
      this.proxy = this.createReadonlyProxy();
    }
  }
}

// 用于储存已注册的key，避免重复注册相同的key
const keyMap = {};

/**
 * 创建同步数据
 * @param target 目标源对象
 * @param key 同步key，不能重复
 * @param mode 同步模式
 * @param shouldPersist 是否需要数据持久化
 * @param updateHandler 更新处理器
 * @param dataInitFn 数据初始化函数，允许异步，要求返回一个初始数据
 * @return {* & CanSync}
 */
function createSyncData(target, key, mode, shouldPersist = false, updateHandler = undefined, dataInitFn = undefined) {
  if (keyMap[key]) {
    throw new Error('duplicate sync key: ' + key);
  }
  let synchronizer;
  switch (mode) {
    case DataSyncMode.ALL_WRITABLE:
      synchronizer = new DataSynchronizerAllWritable(key, target, shouldPersist, updateHandler, dataInitFn);
      break;
    case DataSyncMode.ONLY_BACKGROUND_WRITABLE:
      synchronizer = new DataSynchronizerOnlyBackgroundWritable(key, target, shouldPersist, updateHandler, dataInitFn);
      break;
    default:
      throw new Error('unsupported sync mode: ' + mode);
  }
  keyMap[key] = true;
  global.SyncData[key] = synchronizer.proxy;
  console.log(`已启用同步数据：${key}`, synchronizer.proxy);
  return synchronizer.proxy;
}

global.SyncData = {};
export { createSyncData, DataSyncMode, CanSync };
