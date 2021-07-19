import PlatformHelper from '../platform/PlatformHelper';

class NotificationUtil {
  // 发送推送核心方法
  static SendNotice(title, message, imageUrl, id) {
    PlatformHelper.Notification.create(id, title, message, imageUrl);
  }
}

export default NotificationUtil;
