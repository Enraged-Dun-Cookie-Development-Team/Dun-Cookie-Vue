import PlatformHelper from '../platform/PlatformHelper';

// TODO 优化掉这个
class NotificationUtil {

  static SendNotice(title, message, imageUrl, id) {
    PlatformHelper.Notification.create(id.toString(), title, message, imageUrl);
  }
}

export default NotificationUtil;
