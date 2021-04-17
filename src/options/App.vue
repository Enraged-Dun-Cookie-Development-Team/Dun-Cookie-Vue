<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" src="../assets/image/icon.png"></el-image>
        <div class="version">V{{ version }}</div>
      </el-row>
      <el-divider></el-divider>
      <div class="info">
        <div class="info-title">
          已为你蹲饼<span style="color: #23ade5">{{ dunIndex }}</span>次
        </div>
        <div class="info-time">最近一次时间</div>
      </div>
      <el-divider></el-divider>
      <el-form ref="form" :model="setting" label-width="100px">
        <el-form-item label="蹲饼频率(秒)">
          <el-input-number
            controls-position="right"
            size="small"
            v-model="setting.time"
            :min="3"
            :max="3600"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-radio-group v-model="setting.fontsize">
            <el-radio :label="-1">小</el-radio>
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">大</el-radio>
            <el-radio :label="2">特别大</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="饼来源">
          <el-checkbox-group v-model="setting.source">
            <el-checkbox :label="0">B站</el-checkbox>
            <el-checkbox :label="1">微博</el-checkbox>
            <el-checkbox :label="2">通讯组</el-checkbox>
            <el-checkbox :label="3">朝陇山</el-checkbox>
            <el-checkbox :label="4">一拾山</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="展示图片">
          <el-switch v-model="setting.imgshow"></el-switch>
        </el-form-item>
        <div class="btn-area">
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </el-form>
      <el-divider></el-divider>
      <div>
        <span>
          如果有意见或建议或者是反馈问题，可以<a
            href="https://jq.qq.com/?_wv=1027&k=Vod1uO13"
            >添加群【蹲饼测试群】</a
          >或<a href="Mailto:kaze.liu@qq.com.com">给我发邮件</a>反馈<br />
          也可以去github上查看<a
            href="https://github.com/Enraged-Dun-Cookie-Development-Team/vue-dun-cookies/releases"
            >vue-dun-cookies</a
          >最新安装包<br />
          也可以去Chrome应用商店查看更新，但是因为审核机制，更新速度会慢于QQ群和github
          <br />
          <br />
          <div style="color: #aaa">
            获取更新机制因为没钱买服务器，现在正在想办法
          </div>
        </span>
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
      dunIndex: 0,
      setting: {
        time: 3,
        fontsize: 0,
        imgshow: true,
        source: [0, 1, 2, 3, 4],
      },
    };
  },
  computed: {},
  methods: {
    init() {
      this.dunIndex = this.getBackgroundPage.Kaze.dunIndex;
      this.version = this.getBackgroundPage.Kaze.version;
    },
    save() {
      console.log(this.setting);
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
  .version {
    font-size: 1rem;
  }
  .info {
    text-align: center;
    .info-title {
      font-size: 1.3rem;
    }
    .info-time {
      font-size: 0.8rem;
      color: #aaa;
      margin-top: 10px;
    }
  }
  .btn-area {
    width: 100%;
    text-align: right;
  }
}
</style>