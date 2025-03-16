<template>
  <el-dialog
    v-if="updateInfo.list.length > 0"
    :title="'小刻食堂 V' + updateInfo.list[0].version + ' 翻新了什么？'"
    :modal-append-to-body="false"
    :visible.sync="showUpdateInfo"
    class="update-info-dialog"
  >
    <div ref="observeContainer" class="update-info-area">
      <div class="heading">{{ '新版本V' + updateInfo.list[0].version }}</div>
      <div class="currDescription">{{ updateInfo.list[0].description }}</div>

      <div class="heading">{{ '历史版本' }}</div>
      <div v-for="(info, index) in updateInfo.list.slice(1)" :key="index">
        <div class="historyVersionH">{{ 'V' + info.version }}</div>
        <div class="hisDescription">{{ info.description }}</div>
      </div>
      <div ref="bottomChecker" class="bottomChecker"></div>
    </div>
  </el-dialog>
</template>

<script>
import PlatformHelper from '../common/platform/PlatformHelper';
import ServerUtil from '../common/util/ServerUtil';
import { CURRENT_VERSION } from '../common/Constants';

export default {
  name: 'UpdateInfoNotice',
  data() {
    return {
      updateInfo: { list: [] },
      showUpdateInfo: false,
      loading: false,
      lastpage: false,
      nextPageId: undefined,
    };
  },
  mounted() {
    this.init().then(() => {
      if (this.showUpdateInfo) {
        this.$nextTick(() => {
          this.setupIntersectionObserver();
        });
      }
    });
  },
  methods: {
    async init() {
      let versionUpdate = await PlatformHelper.Storage.getLocalStorage('version-update');
      // if (!versionUpdate || CURRENT_VERSION !== versionUpdate) {
      let data = await ServerUtil.getVersionHistory(false, CURRENT_VERSION);
      data.version = CURRENT_VERSION;
      this.updateInfo = data;
      this.nextPageId = data.next_id;
      this.showUpdateInfo = true;
      PlatformHelper.Storage.saveLocalStorage('version-update', CURRENT_VERSION);
      // }
    },
    //懒加载请求数据
    loadData() {
      ServerUtil.getVersionHistory(false, CURRENT_VERSION, this.nextPageId).then((res) => {
        //将懒加载数据加进updateInfoList
        if (Array.isArray(res.list)) {
          this.updateInfo.list = [...this.updateInfo.list, ...res.list];
        } else {
          console.error('data.list 不是数组', res.list);
        }
        //检测是否最后一页
        this.nextPageId = res.next_id;
      });
    },

    // 设置 IntersectionObserver 监听滚动到达底部加载下一页数据
    setupIntersectionObserver() {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.loading && this.nextPageId != null) {
            console.log('触发懒加载');
            this.loadData(); // 滚动到底部时加载更多数据
          }
        },
        { root: this.$refs.observeContainer, threshold: 0 }
      );

      // 观察底部元素
      const bottomChecker = this.$refs.bottomChecker;
      if (bottomChecker) {
        observer.observe(bottomChecker);
      } else {
        console.error('未找到底部元素');
      }
    },
  },
};
</script>

<style lang="less" scoped>
.update-info-area {
  overflow-y: auto;
  padding: 15px;
  font-size: 14px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  white-space: pre-wrap;
  flex: 1;
}
.update-info-dialog ::v-deep .el-dialog {
  display: flex;
  margin: 10vh auto auto;
  width: '80%';
  flex-direction: column;
}

.update-info-dialog ::v-deep .el-dialog__header {
  position: relative;
  top: 0;
  z-index: 10;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background: white;
  flex: 0 0 auto;
}

.update-info-dialog ::v-deep .el-dialog__body {
  overflow-y: auto;
  padding: 15px;
  max-height: calc(80vh - 60px); /* 计算除去 header 和 footer 的高度 */
  flex: 1;
}
.bottomCheck {
  margin-top: -50px;
  width: 100%;
  height: 50px;
  pointer-events: none;
}

.heading {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #007bff;
}

.historyVersionH {
  margin: 10px 0;
  font-size: 14px;
  font-weight: 500;
}
.currDescription {
  margin-bottom: 20px;
}
</style>
