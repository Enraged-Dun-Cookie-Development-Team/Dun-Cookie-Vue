import PlatformHelper from '../platform/PlatformHelper';

// TODO 优化掉这个
class NotificationUtil {
  // 发送推送核心方法
  static SendNotice(title, message, imageUrl, id) {
    PlatformHelper.Notification.create(id.toString(), title, message, imageUrl);
  }
}

export default NotificationUtil;
