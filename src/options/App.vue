<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <el-image class="img" src="../assets/image/icon.png"></el-image>
        <div class="version">V{{ saveInfo.version }}</div>
      </el-row>
      <el-divider></el-divider>
      <div class="info">
        <div class="info-time">
          开始蹲饼时间：{{ timespanToDay(dunInfo.dunFristTime) }}
        </div>
        <div class="info-title">
          <!-- 已为你蹲饼<span style="color: #23ade5">{{ dunInfo.dunIndex }}</span
          >次 -->
          已为你蹲饼<span style="color: #23ade5"
            ><countTo
              :startVal="oldDunIndex"
              :endVal="dunInfo.dunIndex"
              :duration="3000"
            ></countTo></span
          >次
        </div>
        <div class="info-time">
          本次蹲饼时间：{{ timespanToDay(dunInfo.dunTime) }}
        </div>
        <div class="info-time">下次蹲饼时间：{{ nextdunTime }}</div>
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
          <el-checkbox-group v-model="setting.source" :min="1">
            <el-checkbox :label="0">
              <span class="checkbox-area">
                <img class="iconimg" src="/assets/image/bili.ico" />B站</span
              >
            </el-checkbox>
            <el-checkbox :label="1">
              <span class="checkbox-area">
                <img class="iconimg" src="/assets/image/weibo.ico" />微博</span
              ></el-checkbox
            >
            <el-checkbox :label="2">
              <span class="checkbox-area">
                <img class="iconimg" src="/assets/image/txz.jpg" />通讯组</span
              ></el-checkbox
            >
            <el-checkbox :label="3">
              <span class="checkbox-area">
                <img class="iconimg" src="/assets/image/cho3.jpg" />朝陇山</span
              ></el-checkbox
            >
            <el-checkbox :label="4">
              <span class="checkbox-area">
                <img class="iconimg" src="/assets/image/ys3.jpg" />一拾山</span
              ></el-checkbox
            >
            <el-checkbox :label="5">
              <span class="checkbox-area">
                <img class="iconimg" src="/assets/image/sr.ico" />塞壬唱片</span
              ></el-checkbox
            >
            <el-checkbox :label="6">
              <span class="checkbox-area">
                <img
                  class="iconimg"
                  src="/assets/image/tl.jpg"
                />泰拉记事社</span
              ></el-checkbox
            >
            <el-checkbox :label="7">
              <span class="checkbox-area">
                <img
                  class="iconimg"
                  src="/assets/image/mrfz.ico"
                />官网网站</span
              ></el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="展示图片">
          <el-switch v-model="setting.imgshow"></el-switch>
        </el-form-item>
        <el-form-item
          label="推送信息 ?"
          title="关闭后仅可以查看列表，无法在电脑右下角和通知栏收到推送！"
        >
          <el-switch v-model="setting.isPush"></el-switch>
        </el-form-item>
        <el-form-item label="主题切换">
          <el-radio-group v-model="setting.darkshow">
            <el-radio :label="0">日常模式</el-radio>
            <el-radio :label="1">夜间模式</el-radio>
            <el-radio :label="-1">日出日落模式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="无时间位置 ?"
          title="有些数据比如通讯组是只有日期没有时间的，在数据列表内无法排序，所以在此统一这些卡片在当天信息流内是置顶还是置底。
          保存的时候可能会因为数据排序改变而发送错误的推送，请忽略！"
        >
          <el-radio-group v-model="setting.isTop">
            <el-radio :label="true">当天内容顶部</el-radio>
            <el-radio :label="false">当天内容底部</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="btn-area">
          <el-button type="primary" @click="saveSetting">保存</el-button>
        </div>
      </el-form>
      <!-- <el-divider></el-divider>
      <div style="text-align: center">
        <el-button @click="getUpdateInfo" size="mini"
          >检查更新</el-button
        >
      </div> -->
      <el-divider></el-divider>
      <div v-html="saveInfo.feedbackInfo"></div>
    </el-card>
  </div>
</template>

<script>
import countTo from "vue-count-to";
export default {
  name: "app",
  components: { countTo },
  mounted() {
    this.init();
  },
  data() {
    return {
      cardlist: [],
      saveInfo: { version: "?.?.??" },
      oldDunIndex: 0,
      dunInfo: {
        dunIndex: 0,
        dunTime: new Date().getTime(),
        dunFristTime: new Date().getTime(),
      },
      setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5, 6, 7],
        fontsize: 0,
        imgshow: true,
        isTop: true,
        isPush: true,
        darkshow: 0,
      },
    };
  },
  computed: {
    nextdunTime() {
      return this.timespanToDay(
        (this.dunInfo.dunTime / 1000 + this.setting.time) * 1000
      );
    },
  },
  methods: {
    init() {
      this.getSaveInfo();
      this.getDunInfo();
      this.getSetting();
    },

    // 死数据
    getSaveInfo() {
      this.getLocalStorage("saveInfo").then((data) => {
        if (data != null) {
          this.saveInfo = data;
        }
      });
    },

    // 蹲饼数据
    getDunInfo() {
      this.getLocalStorage("dunInfo").then((data) => {
        if (data != null) {
          this.oldDunIndex = this.dunInfo.dunIndex;
          this.dunInfo = data;
        }
      });
    },

    // 设置数据
    getSetting() {
      this.getLocalStorage("setting").then((data) => {
        if (data != null) {
          this.setting = data;
          setInterval(() => {
            this.getDunInfo();
          }, data.time * 500);
        }
      });
    },

    saveSetting() {
      console.log( this.setting)
      this.saveLocalStorage("setting", this.setting).then(() => {
        chrome.runtime.sendMessage({ info: "setting" });
        this.$message({
          center: true,
          message: "保存成功",
          type: "success",
        });
      });
    },

    // 保存
    saveLocalStorage(name, data) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [name]: data }, () => {
          resolve(true);
        });
      });
    },
    // 读取
    getLocalStorage(name) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([name], (result) => {
          if (Object.keys(result).length != 0) {
            resolve(result[name]);
            return;
          }
          resolve(null);
        });
      });
    },

    timespanToDay(date) {
      date = new Date(date);
      let Y = date.getFullYear();
      let M = date.getMonth() + 1;
      let D = date.getDate();
      let h = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();
      return `${Y}-${this.addZero(M)}-${this.addZero(D)} ${this.addZero(
        h
      )}:${this.addZero(m)}:${this.addZero(s)}`;
    },

    addZero(m) {
      return m < 10 ? "0" + m : m;
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
}
</style>