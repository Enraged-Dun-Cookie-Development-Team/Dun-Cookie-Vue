// 复制自：https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers?hl=zh-cn#keep-sw-alive
// TODO 该文件暂未用到，Chrome官方不喜欢这样的，之后看看正常蹲饼能不能一直活，能的话就不要这个了，不能的话就还是用这个保活
/**
 * Tracks when a service worker was last alive and extends the service worker
 * lifetime by writing the current time to extension storage every 20 seconds.
 * You should still prepare for unexpected termination - for example, if the
 * extension process crashes or your extension is manually stopped at
 * chrome://serviceworker-internals.
 */
let heartbeatInterval;

async function runHeartbeat() {
  await PlatformHelper.Storage.saveLocalStorage('last-heartbeat', new Date().getTime());
}

/**
 * Starts the heartbeat interval which keeps the service worker alive. Call
 * this sparingly when you are doing work which requires persistence, and call
 * stopHeartbeat once that work is complete.
 */
export async function startHeartbeat() {
  // Run the heartbeat once at service worker startup.
  runHeartbeat().then(() => {
    // Then again every 20 seconds.
    heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
  });
}

export async function stopHeartbeat() {
  clearInterval(heartbeatInterval);
}

/**
 * Returns the last heartbeat stored in extension storage, or undefined if
 * the heartbeat has never run before.
 */
export async function getLastHeartbeat() {
  return await PlatformHelper.Storage.getLocalStorage('last-heartbeat');
}
