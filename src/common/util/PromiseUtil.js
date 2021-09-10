export default class PromiseUtil {
    // any的兼容性较差，所以不能直接使用Promise.any
    // 这里利用all在其中一个reject的时候就会直接返回的特点，将reject和reslove反向使用来达到any的效果
    static any(...promiseList) {
        const WrapperPromiseList = [];
        for (const promise of promiseList) {
            WrapperPromiseList.push(new Promise((resolve, reject) => {
                promise.then(res => reject(res)).catch(res => resolve(res));
            }));
        }
        return Promise.all(WrapperPromiseList);
    }
}
