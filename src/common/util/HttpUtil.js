class HttpUtil {

  /**
   * 向指定的url发送get请求并解析为JSON
   * @param url 想要请求的url
   * @return Promise
   */
  static GET_Json(url) {
    try {
      return HttpUtil.GET(url).then(response => JSON.parse(response));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 向指定的url发送get请求
   * @param url 想要请求的url
   * @return Promise
   */
  static GET(url) {
    return HttpUtil.__sendRequest(url, "GET").catch(error => console.error(error));
  }

  // 获取数据底层方法
  static __sendRequest(url, method) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(xhr.responseText);
          }
        }
      }
      xhr.onerror = () => {
        reject('request error');
      }
      xhr.send();
    });
  }
}

export default HttpUtil
