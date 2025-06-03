// 这两个变量用于避免调试输出太多导致控制台卡死，可参考本文件中的debugConsoleOutput方法
let debugLogClearThreshold = 5000;
let debugLogCounter = 0;

/**
 * 预定义日志等级，避免magic number
 */
export const LOG_LEVEL = {
  ERROR: -5,
  WARN: -3,
  NOTICE: -1,
  INFO: 0,
  DEBUG_LOW: 2,
  DEBUG: 4,
  TRACE_LOW: 6,
  TRACE_MEDIUM: 7,
  TRACE_HIGH: 8,
  TRACE_ALL: 9,
};

/**
 * 当前日志等级
 */
export let CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

export class Logger {
  // region 控制台输出，方法后缀对应DevTools的日志级别，其中无后缀和Trace对应的都是Info级别，Error和Trace都会打印调用栈

  static log(...data) {
    Logger.consoleOutput(LOG_LEVEL.INFO, 'log', ...data);
  }

  static logLevel(level, ...data) {
    Logger.consoleOutput(level, 'log', ...data);
  }

  static logVerbose(level, ...data) {
    Logger.consoleOutput(level, 'debug', ...data);
  }

  static logWarn(...data) {
    Logger.consoleOutput(LOG_LEVEL.WARN, 'warn', ...data);
  }

  static logError(...data) {
    Logger.consoleOutput(LOG_LEVEL.ERROR, 'error', ...data);
  }

  static logTrace(level, ...data) {
    Logger.consoleOutput(level, 'trace', ...data);
  }

  // endregion

  /**
   * 美观输出到控制台
   *
   * @param level {number}
   * @param type {string}
   * @param info {string | any}
   * @param data {any}
   */
  static consoleOutput(level, type, info, ...data) {
    if (CURRENT_LOG_LEVEL >= level || level === 0) {
      // 为避免启用调试模式时控制台输出信息太多导致卡死，输出的调试信息超过限制时清除之前输出的调试信息
      if (debugLogCounter >= debugLogClearThreshold) {
        console.clear();
      }
      // 如果不是特殊info就把这个参数插入到data去，避免日志变成灰色
      if (!(typeof info === 'string' && info.startsWith('%c'))) {
        data = [info, ...data];
        info = '';
      }
      console[type](`%c[${new Date().toLocaleString()}] ${info}`, 'color: gray', ...data);
      debugLogCounter++;
    }
  }

  static setLogClearThreshold(newThreshold) {
    if (newThreshold > 10) {
      debugLogClearThreshold = newThreshold;
    }
  }

  static setLogLevel(newLevel) {
    CURRENT_LOG_LEVEL = newLevel;
  }
}

global.Logger = Logger;
