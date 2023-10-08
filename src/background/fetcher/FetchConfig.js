/**
 * 蹲饼配置
 */
export class FetchConfig {
  /**
   * 蹲饼配置的ID
   * @type {string}
   */
  id;

  /**
   * 是否启用该蹲饼配置
   * @type {boolean}
   */
  enable;

  /**
   * 启用的数据源列表
   * @type {{type: string, dataId: string}[]}
   */
  enableDataSourceList;

  /**
   * 公共间隔
   *
   * 会影响全局蹲饼间隔、检查蹲饼器是否可用的间隔
   * @type {number}
   */
  globalInterval;

  /**
   * 低频时间范围
   *
   * 第一个元素是起始时间，第二个元素是结束时间，范围都是0~24，左闭右开区间，如果第一个元素大于第二个元素，则表示跨天
   * @type {[number, number] | undefined}
   */
  lowFrequencyTimeRange;

  /**
   * 低频间隔倍数
   * @type {number}
   */
  lowFrequencyMultiple;

  /**
   * 蹲饼器策略
   *
   * 当多个策略同时满足的时候按顺序选择靠前的策略生效
   * @type {FetcherStrategy[]}
   */
  fetcherStrategyList;

  constructor(
    id,
    enable,
    enableDataSourceList,
    globalInterval,
    lowFrequencyTimeRange,
    lowFrequencyMultiple,
    fetcherStrategyList
  ) {
    this.id = id;
    this.enable = enable;
    this.enableDataSourceList = enableDataSourceList;
    this.globalInterval = globalInterval;
    this.lowFrequencyTimeRange = lowFrequencyTimeRange;
    this.lowFrequencyMultiple = lowFrequencyMultiple;
    this.fetcherStrategyList = fetcherStrategyList;
  }

  getCurrentInterval() {
    let interval = this.globalInterval;
    if (this.lowFrequencyTimeRange && this.lowFrequencyTimeRange.length === 2) {
      const nowHour = new Date().getHours();
      const start = this.lowFrequencyTimeRange[0];
      const end = this.lowFrequencyTimeRange[1];
      if (start <= end) {
        if (nowHour >= start && nowHour < end) {
          interval *= this.lowFrequencyMultiple;
        }
      } else {
        if (nowHour >= start || nowHour < end) {
          interval *= this.lowFrequencyMultiple;
        }
      }
    }
    return interval;
  }
}

/**
 * 蹲饼器策略
 */
export class FetcherStrategy {
  /**
   * 切换条件
   * @type {string}
   */
  condition;
  /**
   * 使用的蹲饼器id
   * @type {string}
   */
  fetcher;

  constructor(condition, fetcher) {
    this.condition = condition;
    this.fetcher = fetcher;
  }
}
