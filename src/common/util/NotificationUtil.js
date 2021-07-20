import PlatformHelper from '../platform/PlatformHelper';

class NotificationUtil {
  static SendNotice(title, message, imageUrl, id) {
    PlatformHelper.Notification.create(id.toString(), title, message, imageUrl);
  }
}

export default NotificationUtil;
