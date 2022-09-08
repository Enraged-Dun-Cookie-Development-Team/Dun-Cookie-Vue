<template>
  <el-dialog
    :title="'小刻食堂 V' + updateInfo.version + ' 翻新了什么？'" :modal-append-to-body="false"
    :visible.sync="showUpdateInfo" width="80%"
  >
    <div class="update-info-area" v-html="updateInfo.description"></div>
  </el-dialog>
</template>

<script>
import PlatformHelper from "../common/platform/PlatformHelper";
import ServerUtil from "../common/util/ServerUtil";
import { CURRENT_VERSION } from "../common/Constants";


export default {
    name: "UpdateInfoNotice",
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
            if (!versionUpdate || CURRENT_VERSION != versionUpdate) {
                let data = await ServerUtil.getVersionInfo(true, false);
                this.updateInfo = data;
                this.showUpdateInfo = true;
                PlatformHelper.Storage.saveLocalStorage('version-update', data.version);
            }
        }
    }
};
</script>

<style lang="less" scoped>
.update-info-area {
  white-space: pre-wrap
}
</style>