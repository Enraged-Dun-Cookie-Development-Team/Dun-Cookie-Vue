import PlatformHelper from '../platform/PlatformHelper';
import { LOG_LEVEL, Logger } from './Logger';

class NotificationUtil {
  static SendNotice(title, message, imageUrl, id) {
    Logger.logVerbose(LOG_LEVEL.INFO, '%c 通知 ', 'color: #eee; background: #7B68EE', `尝试发送通知：${id}`, arguments);
    PlatformHelper.Notification.create(id.toString(), title, message, imageUrl).then(
      (res) => {
        Logger.logVerbose(
          LOG_LEVEL.INFO,
          '%c 通知 ',
          'color: #eee; background: #7B68EE',
          `成功发送通知：${id}，系统ID：${res || ''}`
        );
      },
      (err) => {
        Logger.logVerbose(LOG_LEVEL.INFO, '%c 通知 ', 'color: #eee; background: #7B68EE', `发送通知失败：${id}`, err);
      }
    );
  }
}

export default NotificationUtil;

globalThis.NotificationUtil = NotificationUtil;
