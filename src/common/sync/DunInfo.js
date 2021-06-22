// 蹲饼数据，插件停止后该数据会丢失(好像不需要持久化)
// 如果支持类型的话，更好的方式是这边export类而非实例
class DunInfo {
// TODO 内置支持sendMessage发送更新和onMessage接收更新和save/get读写储存

  // 蹲饼次数
  counter = 0;
  // 最后一次蹲饼时间
  lastDunTime = -1;
}

const instance = new DunInfo();
export default instance;
