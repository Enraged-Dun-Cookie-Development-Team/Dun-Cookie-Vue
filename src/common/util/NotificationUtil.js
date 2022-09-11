import PlatformHelper from '../platform/PlatformHelper';

class NotificationUtil {
  static SendNotice(title, message, imageUrl, id) {
    DebugUtil.debugConsoleOutput(
      0,
      'debug',
      '%c 通知 ',
      'color: #eee; background: #7B68EE',
      `尝试发送通知：${id}`,
      arguments
    );
    PlatformHelper.Notification.create(id.toString(), title, message, imageUrl).then(
      (res) => {
        DebugUtil.debugConsoleOutput(
          0,
          'debug',
          '%c 通知 ',
          'color: #eee; background: #7B68EE',
          `成功发送通知：${id}`,
          res || ''
        );
      },
      (err) => {
        DebugUtil.debugConsoleOutput(
          0,
          'debug',
          '%c 通知 ',
          'color: #eee; background: #7B68EE',
          `发送通知失败：${id}`,
          err
        );
      }
    );
  }
}

export default NotificationUtil;
