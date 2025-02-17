<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <div style="display: flex; align-items: center">
          <el-image class="img" :src="logo" />
          <span class="version">欢迎使用小刻食堂 V{{ currentVersion }}</span>
        </div>
      </el-row>
      <el-divider />
      <div class="info">
        <template v-if="isLatestVersion">
          <el-result
            icon="success"
            title="已经是最新版啦！"
            sub-title="让我们和小刻一起继续等待自由的兔兔发饼吧！"
          ></el-result>
        </template>
        <template v-else>
          <el-result
            icon="warning"
            title="有新版本可以更新啦！"
            sub-title="让我们更新后和小刻一起继续等待自由的兔兔发饼吧！"
          ></el-result>
        </template>
      </div>
      <el-divider />
      <el-card class="box-card description">
        <div slot="header" class="clearfix">
          <span>{{ updateInfo.title }}</span>
        </div>
        <div v-html="updateInfo.description"></div>
      </el-card>
      <el-divider />

      <!-- 遍历按钮 -->
      <div class="button-container">
        <!-- 下载按钮 -->
        <div v-for="(item, index) in updateInfo.download_source" :key="index" class="button-wrapper">
          <el-button size="mini" type="success" @click="showDetails(item)">
            {{ getButtonText(item) }}
          </el-button>
        </div>
        <!-- 弹窗 -->
        <el-dialog title="下载地址" :visible.sync="dialogVisible" width="30%" center>
          <br />

          <!-- 主下载地址 -->
          <div v-if="selectedItem" center>
            <div class="button-wrapper">
              <el-button type="primary" @click="openUrl(selectedItem.primary_url.url)">主下载地址</el-button>
            </div>

            <!-- 遍历备用地址 -->

            <div v-if="selectedItem.spare_urls">
              <div v-for="(spare, spareIndex) in selectedItem.spare_urls" :key="spareIndex" class="button-wrapper">
                <el-button type="primary" @click="openUrl(selectedItem.spare_urls[spareIndex].url)"
                  >备用下载地址{{ spareIndex + 1 }}</el-button
                >
              </div>
            </div>
          </div>

          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">关闭</el-button>
          </span>
        </el-dialog>
      </div>

      <el-divider />
      <Feedback />
    </el-card>
  </div>
</template>

<script>
import Feedback from '../components/Feedback';
import { CURRENT_VERSION } from '../common/Constants';
import PlatformHelper from '../common/platform/PlatformHelper';
import ServerUtil from '../common/util/ServerUtil';
import Settings from '../common/Settings';

export default {
  name: 'Update',
  components: { Feedback },

  data() {
    return {
      dialogVisible: false, // 控制弹窗显示
      selectedUrl: '', // 存储选中的 primary_url
      settings: Settings,
      logo: '',
      currentVersion: CURRENT_VERSION,
      updateInfo: {},
      isLatestVersion: false,
      isDialogVisible: false, // 控制弹窗的显示与隐藏
      spare_urls: [],
      selectedItem: null,
    };
  },
  computed: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getUpdateInfo();
      this.settings.doAfterInit((settings) => {
        this.logo = '/assets/image/' + settings.logo;
      });
    },
    openUrl: PlatformHelper.Tabs.create,
    // 检查一次更新
    getUpdateInfo() {
      ServerUtil.getVersionInfo(false).then((data) => {
        this.isLatestVersion = !Settings.JudgmentVersion(data.version, CURRENT_VERSION);
        this.updateInfo = data;
        this.spare_urls = data.spare_urls;
      });
    },
    openDialog() {
      this.isDialogVisible = true;
    },
    handleConfirm() {
      // 弹窗确认操作逻辑
      this.isDialogVisible = false;
      console.log('确认按钮被点击');
    },
    showDetails(item) {
      this.selectedItem = item;
      this.selectedUrl = item.primary_url; // 存储当前选中的 primary_url
      this.dialogVisible = true; // 打开弹窗
    },
    getButtonText(item) {
      if (['Chrome', 'Edge', 'FireFox'].includes(item.name)) {
        return item.name + '应用商店';
      } else if (item.name === 'CRX') {
        return 'CRX下载';
      } else {
        return item.name;
      }
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  margin: auto;
  max-width: 600px;

  .img {
    width: 50px;
  }

  .blue {
    font-size: 1.2rem;
    color: #23ade5;
  }

  .version {
    font-size: 1.5rem;
  }

  .info {
    font-size: 1.3rem;
    text-align: center;
  }

  .description {
    white-space: pre-wrap;
  }

  .btn-area {
    width: 100%;
    text-align: right;
  }

  .checkbox-area {
    display: flex;
    align-items: center;

    .iconimg {
      margin-right: 5px;
      width: 16px;
    }
  }

  .button-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 每行最多 3 列 */
    justify-content: center;
    margin-bottom: 20px;
  }

  .button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
  }

  .button-wrapper .el-button {
    width: 100%;
    max-width: 180px;
  }

  :deep(.el-collapse) {
    border-top: 0;
    border-bottom: 0;
  }

  :deep(.el-collapse-item__header) {
    border-bottom: 0;
  }
}
</style>
