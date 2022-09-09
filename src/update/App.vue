<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" :src="logo" />
        <div class="version">欢迎使用小刻食堂 V{{ currentVersion }}</div>
      </el-row>
      <el-divider />
      <div class="info">
        <div class="info-title">版本已经更新</div>
        <div class="info-title">让我们更新后和小刻一起继续等待自由的兔兔发饼吧！</div>
      </div>
      <el-divider />
      <el-card class="box-card description">
        <div slot="header" class="clearfix">
          <span>{{ updateInfo.title }}</span>
        </div>
        <div v-html="updateInfo.description"></div>
      </el-card>
      <el-divider />
      <div style=" margin-bottom: 10px;text-align: center">
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
      ServerUtil.getVersionInfo(false, false).then((responseText) => {
        this.updateInfo = responseText;
      });
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  max-width: 600px;
  margin: auto;
  .img {
    width: 50px;
  }
  .blue {
    color: #23ade5;
    font-size: 1.2rem;
  }
  .version {
    font-size: 1.5rem;
  }
  .info {
    text-align: center;
    .info-title {
      font-size: 1.3rem;
    }
    .info-time {
      font-size: 0.8rem;
      color: #aaa;
      margin: 10px 0;
    }
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
  /deep/ .el-collapse {
    border-top: 0;
    border-bottom: 0;
  }
  /deep/ .el-collapse-item__header {
    border-bottom: 0;
  }
}
</style>
