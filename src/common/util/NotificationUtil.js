import BrowserUtil from '../platform/BrowserUtil';

class NotificationUtil {
  // 发送推送核心方法
  static SendNotice(title, message, imageUrl, id) {
    if (imageUrl) {
      BrowserUtil.createNotifications(id.toString(), {
        iconUrl: '../assets/image/icon.png',
        message: message,
        title: title,
        imageUrl: imageUrl,
        type: "image"
      });
    } else {
      BrowserUtil.createNotifications(id.toString(), {
        iconUrl: '../assets/image/icon.png',
        message: message,
        title: title,
        type: "basic"
      });
    }
  }
}

export default NotificationUtil;
