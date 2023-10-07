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
      <div style="margin-bottom: 10px; text-align: center">
        <el-button size="mini" type="success" @click="openUrl(updateInfo.down.chrome)"> Chrome应用商店 </el-button>
        <el-button size="mini" type="success" @click="openUrl(updateInfo.down.edge)"> Edge应用商店 </el-button>
        <el-button size="mini" type="success" @click="openUrl(updateInfo.down.firefox)"> Firefox应用商店 </el-button>
      </div>
      <div style="text-align: center">
        <el-button type="success" size="mini" @click="openUrl(updateInfo.down.crx)"> 下载Crx </el-button>
        <el-button type="success" size="mini" @click="openUrl(updateInfo.down.zip)"> 下载Zip </el-button>

        <el-button v-if="updateInfo.down" size="mini" @click="openUrl(updateInfo.down.spare[0])">
          {{ updateInfo.down.spare[1] }}
        </el-button>
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
      settings: Settings,
      logo: '',
      currentVersion: CURRENT_VERSION,
      updateInfo: {},
      isLatestVersion: false,
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
      });
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

  :deep(.el-collapse) {
    border-top: 0;
    border-bottom: 0;
  }

  :deep(.el-collapse-item__header) {
    border-bottom: 0;
  }
}
</style>
