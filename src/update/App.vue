<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" src="../assets/image/icon.png"></el-image>
        <div class="version">欢迎使用蹲饼 V{{ saveInfo.version }}</div>
      </el-row>
      <el-divider></el-divider>
      <div class="info">
        <div class="info-title">
          版本已经更新，让我们更新后继续守护自由的兔兔吧！
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
      <div style="text-align: center">
        <el-button @click="toLink(updateInfo.downCrx)" size="mini"
          >下载Crx</el-button
        >
        <el-button @click="toLink(updateInfo.downZip)" size="mini"
          >下载Zip</el-button
        >
        <el-button
          size="mini"
          @click="
            toLink(
              `https://chrome.google.com/webstore/detail/%E8%B9%B2%E9%A5%BC-%E6%98%8E%E6%97%A5%E6%96%B9%E8%88%9F%E8%B9%B2%E9%A5%BC%E5%99%A8-arknights-cook/gblmdllhbodefkmimbcjpflhjneagkkd?hl=zh-CN`
            )
          "
          >Chrome应用商店</el-button
        >
      </div>
      <el-divider></el-divider>
      <div v-html="saveInfo.feedbackInfo"></div>
    </el-card>
  </div>
</template>

<script>
import { common, Get } from "../assets/JS/common";
export default {
  name: "update",
  mounted() {
    this.init();
  },

  data() {
    return {
      saveInfo: common.saveInfo,
      activeNames: [1],
      feedbackInfo: "",
      updateInfo: {},
    };
  },
  computed: {},
  methods: {
    Get,
    init() {
      this.getSaveInfo();
      this.getUpdateInfo();
    },
    toLink(url) {
      chrome.tabs.create({
        url: url,
      });
    },
    // 检查一次更新
    getUpdateInfo() {
      this.Get(
        "http://cdn.liuziyang.vip/Dun-Cookies-Info.json?t=" +
          new Date().getTime()
      ).then((responseText) => {
        this.updateInfo = JSON.parse(responseText).upgrade;
      });
    },
    getSaveInfo() {
      this.getLocalStorage("saveInfo").then((data) => {
        if (data != null) {
          this.saveInfo = data;
        }
      });
    },
    getLocalStorage(name) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([name], (result) => {
          if (result) {
            resolve(result[name]);
            return;
          }
          resolve(null);
        });
      });
    },
    toSetting() {
      chrome.tabs.create({
        url: chrome.extension.getURL("options.html"),
      });
    },
    toGithub() {
      chrome.tabs.create({
        url:
          "https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue",
      });
    },
    // lookList() {
    //   chrome.browserAction.getPopup();
    // },
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