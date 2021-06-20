class HttpUtil {

  /**
   * 向指定的url发送get请求
   * @param urls url列表，必须是数组
   * @return Promise
   */
  GET(urls) {
    try {
      return new Promise((resolve) => {
        Promise.all(urls.map(item => this.__sendRequest(item, "GET"))).then((values) => {
          resolve(values);
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  // 获取数据底层方法
  __sendRequest(url, method) {
    return new Promise((resolve) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText !== "") {
          resolve(xhr.responseText);
        }
      }
      xhr.send();
    });
  }
}

const instance = new HttpUtil();
export default instance
