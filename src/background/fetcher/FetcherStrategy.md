## 蹲饼器策略

---

可用的条件：

- default
  - 该条件只要蹲饼器还处于可用状态就成立，但优先级比其它所有条件都低
- hour_range:range1|range2|...
  - 时间范围，仅限小时，其中 range 的数量是任意的，以`|`分割，会逐个判断是否符合
  - range 是闭区间
  - range 的格式是 start,end，start 和 end 都是 0-23 之间的整数

如果没有任何策略有 default 条件，则视为第一个策略有 default 条件
