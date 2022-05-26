<template>
  <el-dialog :title="'小刻食堂 V' + updateInfo.v + ' 翻新了什么？'" :modal-append-to-body="false" :visible.sync="showUpdateInfo"
    width="80%">
    <div class="update-info-area" v-html="updateInfo.description"></div>
  </el-dialog>
</template>

<script>
import PlatformHelper from "../common/platform/PlatformHelper";
import { CURRENT_VERSION } from "../common/Constants";

export default {
  name: "UpdateInfoNotice",
  props: ["updateInfo"],
  data() {
    return {
      showUpdateInfo: false,
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      setTimeout(async () => {
        if (CURRENT_VERSION === this.updateInfo.v) {
          let versionNotice = await PlatformHelper.Storage.getLocalStorage('version-notice');
          if (!versionNotice) {
            this.showUpdateInfo = true;
            versionNotice = true;
            PlatformHelper.Storage.saveLocalStorage('version-notice', versionNotice);
          }
        }
      }, 1000);
    }
  }
}
</script>