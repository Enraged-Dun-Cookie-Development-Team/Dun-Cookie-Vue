export default class PromiseUtil {
  /**
   * 相当于 Promise.any
   *
   * any的兼容性较差，所以不能直接使用Promise.any
   * 这里利用all在其中一个reject的时候就会直接返回的特点，将reject和resolve反向使用来达到any的效果
   * @param promiseList 所有promise列表
   * @param filter 可以传入此参数来保证只返回符合条件的promise结果
   * @param needRawError 当全部promise都失败时是否需要原始的异常数据，如果是false则返回固定的"全部失败"提示作为reject的reason，默认false
   * @return {Promise<unknown>}
   */
  static any(promiseList, filter = undefined, needRawError = false) {
    const WrapperPromiseList = [];
    for (const promise of promiseList) {
      WrapperPromiseList.push(
        new Promise((resolve, reject) => {
          promise
            .then((res) => {
              if (typeof filter !== 'function' || filter(res)) {
                reject(res);
              } else {
                resolve(res);
              }
            })
            .catch((res) => resolve(res));
        })
      );
    }

    return new Promise((resolve, reject) => {
      Promise.all(WrapperPromiseList)
        .then((results) => reject(needRawError ? results : 'PromiseUtil.any: 所有promise都执行失败！'))
        .catch((err) => resolve(err));
    });
  }
}
