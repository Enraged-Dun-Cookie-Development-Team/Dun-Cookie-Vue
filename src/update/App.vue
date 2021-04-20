<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" src="../assets/image/icon.png"></el-image>
        <div class="version">欢迎使用蹲饼 V{{ version }}</div>
      </el-row>
      <el-divider></el-divider>
      <div class="info">
        <div class="info-title">版本已经更新，让我们继续守护自由的兔兔吧！</div>
      </div>
      <el-divider></el-divider>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item
          title="V2.0"
          name="2.0"
        >
         
        </el-collapse-item>
      </el-collapse>
      <el-divider></el-divider>
       <div v-html="feedbackInfo">
       
      </div>
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
      feedbackInfo:'',
      activeNames: [1],
    };
  },
  computed: {},
  methods: {
    init() {
      this.version = this.getBackgroundPage.Kaze.version;
      this.feedbackInfo = this.getBackgroundPage.Kaze.feedbackInfo;
    }
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
    color:#23ade5;
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