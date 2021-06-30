/**
 * 这里放不方便分类的公共方法
 */

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

export {deepAssign};
