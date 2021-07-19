<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" src="../assets/image/icon.png"></el-image>
        <div class="version">欢迎使用小刻食堂 V{{ currentVersion }}</div>
      </el-row>
      <el-divider></el-divider>
      <div class="info">
        <div class="info-title">
          版本已经更新，让我们更新后和小刻一起继续等待自由的兔兔发饼吧！
        </div>
        <div class="info-title">
          Chrome应用商店下载的博士请等候审核通过后更新
        </div>
      </div>
      <el-divider></el-divider>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ updateInfo.title }}</span>
        </div>
        <div v-html="updateInfo.description"></div>
      </el-card>
      <el-divider></el-divider>
      <div style="text-align: center; margin-bottom: 10px">
        <el-button
          size="mini"
           type="success"
          @click="openUrl(updateInfo.downChrome)"
          >Chrome应用商店</el-button
        >
        <el-button
            size="mini"
            type="success"
            @click="openUrl(updateInfo.downEdge)"
        >Edge应用商店</el-button
        >
        <el-button
            size="mini"
            type="success"
            @click="openUrl(updateInfo.downFirefox)"
        >Firefox应用商店</el-button
        >
      </div>
      <div style="text-align: center">
      <el-button type="success" @click="openUrl(updateInfo.downCrx)" size="mini"
          >下载Crx</el-button
        >
        <el-button type="success" @click="openUrl(updateInfo.downZip)" size="mini"
          >下载Zip</el-button
        >
        
        <el-button v-if="updateInfo.downSpareText" @click="openUrl(updateInfo.downSpare)" size="mini"
          >{{updateInfo.downSpareText}}</el-button
        >
      </div>
      <el-divider></el-divider>
      <Feedback></Feedback>
    </el-card>
  </div>
</template>

<script>
import HttpUtil from '../common/util/HttpUtil';
import Feedback from '../components/Feedback';
import {CURRENT_VERSION} from '../common/Constants';
import PlatformHelper from '../common/platform/PlatformHelper';

export default {
  name: "update",
  components: {Feedback},
  mounted() {
    this.init();
  },

  data() {
    return {
      currentVersion: CURRENT_VERSION,
      updateInfo: {},
    };
  },
  computed: {},
  methods: {
    init() {
      this.getUpdateInfo();
    },
    openUrl: PlatformHelper.Tabs.create,
    // 检查一次更新
    getUpdateInfo() {
      HttpUtil.GET(
        "http://cdn.liuziyang.vip/Dun-Cookies-Info.json?t=" +
          new Date().getTime()
      ).then((responseText) => {
        this.updateInfo = JSON.parse(responseText).upgrade;
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
