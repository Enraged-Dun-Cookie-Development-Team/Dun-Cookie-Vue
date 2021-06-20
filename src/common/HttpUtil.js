class HttpUtil {

  /**
   * 向指定的url发送get请求
   * @param url 想要请求的url
   * @return Promise
   */
  static GET(url) {
    try {
      return HttpUtil.__sendRequest(url, "GET");
    } catch (error) {
      console.log(error);
    }
  }

  // 获取数据底层方法
  static __sendRequest(url, method) {
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

export default HttpUtil
