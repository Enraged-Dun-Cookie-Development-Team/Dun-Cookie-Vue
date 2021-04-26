<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" src="../assets/image/icon.png"></el-image>
        <div class="version">欢迎使用蹲饼 V{{ version }}</div>
      </el-row>
      <el-divider></el-divider>
      <div class="info">
        <div class="info-title">我们现在已经开始在为你蹲饼了！</div>
        <div class="info-title">让我们一起守护自由的兔兔吧！</div>
      </div>
      <el-divider></el-divider>
      <div>如果有意见或建议或想法请在群内反馈</div>
      <el-divider></el-divider>
      <div>你可以点击图标查看蹲饼列表</div>
      <el-divider></el-divider>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item
          title="可以点击这里查看把蹲饼置顶在浏览器上的方法~"
          name="1"
        >
          <div class="blue">点击展开全部插件列表</div>
          <img src="../assets/welcome/1.jpg" />
          <br />
          <div class="blue">将置顶按钮激活</div>
          <img src="../assets/welcome/2.jpg" />
          <img src="../assets/welcome/3.jpg" />
          <br />
          <div class="blue">开始看饼</div>
          <img src="../assets/welcome/4.jpg" />
        </el-collapse-item>
      </el-collapse>
      <el-divider></el-divider>
      <div>
        现在可以点击
        <el-button @click="toSetting" size="mini">设置</el-button>
        进入设置来调整蹲饼器
      </div>
      <el-divider></el-divider>
      <div>
        现在可以点击<el-button @click="toGithub" size="mini">Github</el-button
        >查看项目源码。<span style="color: #23ade5">欢迎点star哦</span>
      </div>
      <el-divider></el-divider>
      <div v-html="feedbackInfo"></div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "app",
  mounted() {
    this.init();
  },

  data() {
    return {
      getBackgroundPage: chrome.extension.getBackgroundPage(),
      version: "蹲饼",
      feedbackInfo: "",
      dunIndex: 0,
      dunTime: new Date(),
      dunFristTime: new Date(),
      nextdunTime: "计算中",
      activeNames: [1],
      setting: {
        time: 15,
        source: [0, 1, 2, 3, 4],
        fontsize: 0,
        imgshow: true,
        isTop: true,
      },
    };
  },
  computed: {},
  methods: {
    init() {
      this.dunIndex = this.getBackgroundPage.Kaze.dunIndex;
      this.version = this.getBackgroundPage.Kaze.version;
      this.dunTime = this.getBackgroundPage.Kaze.dunTime;
      this.dunFristTime = this.getBackgroundPage.Kaze.dunFristTime;
      this.feedbackInfo = this.getBackgroundPage.Kaze.feedbackInfo;
      chrome.storage.local.get(["setting"], (result) => {
        this.setting = result.setting;
      });
      setInterval(() => {
        this.dunTime = this.getBackgroundPage.Kaze.dunTime;
        this.dunIndex = this.getBackgroundPage.Kaze.dunIndex;
        this.nextdunTime = new Date(
          (Date.parse(this.dunTime) / 1000 + this.setting.time) * 1000
        );
      }, this.setting.time);
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