<template>
  <el-dialog
    v-if="updateInfo.list.length > 0"
    :title="'小刻食堂翻新了什么？'"
    :modal-append-to-body="false"
    :visible.sync="showUpdateInfo"
    class="update-info-dialog"
  >
    <div ref="observeContainer" class="update-info-area">
      <div>
        <div class="heading">{{ '新版本V' + updateInfo.list[0].version }}</div>
        <div class="current-description">{{ updateInfo.list[0].description }}</div>

        <div class="heading">{{ '历史版本' }}</div>
        <div v-for="(info, index) in updateInfo.list.slice(1)" :key="index">
          <div class="history-version">{{ 'V' + info.version }}</div>
          <div>{{ info.description }}</div>
        </div>
        <div ref="bottomChecker" class="bottom-check"></div>
      </div>
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
      if (!versionUpdate || CURRENT_VERSION !== versionUpdate) {
        this.loadData();
        this.showUpdateInfo = true;
        PlatformHelper.Storage.saveLocalStorage('version-update', CURRENT_VERSION);
      }
    },
    //懒加载请求数据
    async loadData() {
      this.loading = true;
      const data = await ServerUtil.getVersionHistory('plugin', this.nextPageId);
      if (data) {
        //将懒加载数据加进updateInfoList
        if (Array.isArray(data.list)) {
          this.updateInfo.list = [...this.updateInfo.list, ...data.list];
        } else {
          DebugUtil.debugLogError('json结构出错,list不是数组: ' + data.list);
        }
        this.nextPageId = data.next_id;
      }
      this.loading = false;
    },

    // 设置 IntersectionObserver 监听滚动到达底部加载下一页数据
    setupIntersectionObserver() {
      if (!this.$refs.observeContainer) {
        setTimeout(() => this.setupIntersectionObserver(), 500);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.loading && this.nextPageId != null) {
            this.loadData(); // 滚动到底部时加载更多数据
          }
        },
        { root: this.$refs.observeContainer }
      );
      // 观察底部元素
      observer.observe(this.$refs.bottomChecker);
    },
  },
};
</script>

<style lang="less" scoped>
.update-info-dialog {
  :deep(.el-dialog) {
    position: relative;
    top: 0;
    z-index: 10;
    display: flex;
    padding: 15px;
    width: 80%;
    border-bottom: 1px solid #ddd;
    flex-direction: column;
    flex: 1;
  }

  .update-info-area {
    overflow-y: scroll;
    padding: 0 15px;
    height: 50vh;
    font-size: 14px;
    white-space: pre-wrap;

    .heading {
      margin-bottom: 8px;
      font-size: 18px;
      font-weight: 500;
      color: #007bff;
    }

    .current-description {
      margin-bottom: 20px;
    }

    .history-version {
      margin: 10px 0;
      font-size: 14px;
      font-weight: 500;
    }

    .bottom-check {
      margin-top: -50px;
      width: 100%;
      height: 50px;
      pointer-events: none;
    }
  }
}
</style>
