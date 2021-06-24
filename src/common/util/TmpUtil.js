import {defaultDataSources} from '../datasource/DefaultDataSources';

/**
 * 临时工具类
 * TODO 暂时不知道放哪的工具方法先放这边，需要逐步重构掉
 */

function sourceToName(source) {
  try {
    return defaultDataSources[source].dataName;
  } catch (e) {
  }
  return "";
}

function sourceNameToIcon(sourceName) {
  try {
    for (let source of defaultDataSources) {
      if (source.dataName === sourceName) {
        return source.icon;
      }
    }
  } catch (e) {
  }
  return "fail";
}

/**
 * 递归合并对象
 * <p>
 * <strong>注意：子元素是数组的会直接复制而不会递归合并</strong>
 */
function deepAssign(target, obj) {
  if (!target) target = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断obj子元素是否为对象，如果是则递归复制，否则简单复制
        const val = obj[key];
        if (val && typeof val === "object" && !Array.isArray(val)) {
          target[key] = deepAssign(target[key], obj[key]);
        } else {
          target[key] = val;
        }
      }
    }
  }
  return target;
}

export {sourceToName, sourceNameToIcon, deepAssign};
