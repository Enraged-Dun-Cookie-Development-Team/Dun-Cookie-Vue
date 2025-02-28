<template>
  <el-dialog
    :title="'小刻食堂 V' + updateInfo.list[0].version + ' 翻新了什么？'"
    :modal-append-to-body="false"
    :visible.sync="showUpdateInfo"
    width="80%"
    class="update-info-dialog"
  >
    <div class="update-info-area">
      {{ updateInfo.list[0].description }}

      <h3>{{ '历史版本翻新:' }}</h3>
      <div v-for="(info, index) in updateInfo.list.slice(1)" :key="index">
        <h4>{{ 'V' + info.version }}</h4>
        <p>{{ info.description }}</p>
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
      updateInfo: {},
      showUpdateInfo: false,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      let versionUpdate = await PlatformHelper.Storage.getLocalStorage('version-update');
      // if (!versionUpdate || CURRENT_VERSION !== versionUpdate) {
      let data = await ServerUtil.getVersionHistory(false, CURRENT_VERSION);
      data.version = CURRENT_VERSION;
      this.updateInfo = data;
      this.showUpdateInfo = true;
      PlatformHelper.Storage.saveLocalStorage('version-update', CURRENT_VERSION);
      // }
    },
  },
};
</script>

<style lang="less" scoped>
.update-info-area {
  overflow-y: auto;
  padding: 15px;
  white-space: pre-wrap;
  flex: 1;
}
.update-info-dialog ::v-deep .el-dialog {
  display: flex;
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
</style>
