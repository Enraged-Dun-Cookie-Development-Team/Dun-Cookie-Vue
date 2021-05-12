<template>
  <div class="background" :class="setting.outsideClass">
    <div id="app">
      <el-card class="box-card">
        <el-row type="flex" align="middle" justify="space-around">
          <el-image class="img" src="../assets/image/icon.png"></el-image>
          <div class="version">蹲饼 V{{ saveInfo.version }}</div>
        </el-row>
        <el-divider></el-divider>
        <div class="info">
          <div class="info-time">
            开始蹲饼时间：{{ timespanToDay(dunInfo.dunFristTime / 1000) }}
          </div>
          <div class="info-title">
            已为你蹲饼<span style="color: #23ade5"
              ><countTo
                :startVal="oldDunIndex"
                :endVal="dunInfo.dunIndex"
                :duration="1000"
              ></countTo></span
            >次
          </div>
          <div class="info-time">
            本次蹲饼时间：{{ timespanToDay(dunInfo.dunTime / 1000) }}
          </div>
          <!-- <div class="info-time">下次蹲饼时间：{{ nextdunTime }}</div> -->
        </div>
        <el-divider></el-divider>
        <el-form :rules="rules" ref="form" :model="setting" label-width="100px">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="核心设置" name="0">
              <el-form-item label="饼来源">
                <el-checkbox-group v-model="setting.source" :min="1">
                  <el-checkbox :label="0">
                    <span class="checkbox-area">
                      <img
                        class="iconimg"
                        src="/assets/image/bili.ico"
                      />B站</span
                    >
                  </el-checkbox>
                  <el-checkbox :label="1">
                    <span class="checkbox-area">
                      <img
                        class="iconimg"
                        src="/assets/image/weibo.ico"
                      />微博</span
                    ></el-checkbox
                  >
                  <el-checkbox :label="2">
                    <span class="checkbox-area">
                      <img
                        class="iconimg"
                        src="/assets/image/txz.jpg"
                      />通讯组</span
                    ></el-checkbox
                  >
                  <el-checkbox :label="3">
                    <span class="checkbox-area">
                      <img
                        class="iconimg"
                        src="/assets/image/cho3.jpg"
                      />朝陇山</span
                    ></el-checkbox
                  >
                  <el-checkbox :label="4">
                    <span class="checkbox-area">
                      <img
                        class="iconimg"
                        src="/assets/image/ys3.jpg"
                      />一拾山</span
                    ></el-checkbox
                  >
                  <el-checkbox :label="5">
                    <span class="checkbox-area">
                      <img
                        class="iconimg white"
                        src="/assets/image/sr.ico"
                      />塞壬唱片</span
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
              <el-form-item label="蹲饼频率(秒)">
                <el-input-number
                  controls-position="right"
                  size="small"
                  v-model="setting.time"
                  :min="3"
                  :max="3600"
                ></el-input-number>
                <span style="margin-left: 20px" v-if="setting.lowfrequency"
                  >低频模式下为{{ setting.time * 2 }}秒</span
                >
              </el-form-item>
              <el-tooltip
                class="item"
                effect="dark"
                content="关闭后仅可以查看列表，无法在电脑右下角和通知栏收到推送！"
                placement="left"
              >
                <el-form-item label="推送">
                  <el-switch v-model="setting.isPush"></el-switch>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="时间段内蹲饼的攻速降低100%，用来节省流量和性能"
                placement="left"
              >
                <el-form-item label="低频模式">
                  <el-row>
                    <el-col :span="3">
                      <el-switch v-model="setting.lowfrequency"></el-switch
                    ></el-col>
                    <el-col
                      v-show="setting.lowfrequency"
                      :span="20"
                      :offset="1"
                    >
                      <el-slider
                        v-model="setting.lowfrequencyTime"
                        show-stops
                        :max="24"
                        :marks="marks"
                        :format-tooltip="lowfrequencyTimeTooltip"
                        range
                      >
                      </el-slider>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-tooltip>

              <el-tooltip class="item" effect="dark" placement="bottom">
                <div slot="content">
                  有些数据比如通讯组是只有日期没有时间的，在数据列表内无法排序，所以在此统一这些卡片在当天信息流内是置顶还是置底。<br />
                  保存的时候可能会因为数据排序改变而发送错误的推送，请忽略！
                </div>
                <el-form-item label="无时间排序">
                  <el-radio-group v-model="setting.isTop">
                    <el-radio :label="true">当天内容顶部</el-radio>
                    <el-radio :label="false">当天内容底部</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-tooltip>
            </el-tab-pane>
            <el-tab-pane label="界面设置" name="1">
              <el-form-item label="字体大小">
                <el-radio-group v-model="setting.fontsize">
                  <el-radio :label="-1">小</el-radio>
                  <el-radio :label="0">正常</el-radio>
                  <el-radio :label="1">大</el-radio>
                  <el-radio :label="2">特别大</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="展示图片">
                <el-switch v-model="setting.imgshow"></el-switch>
              </el-form-item>
              <el-tooltip
                class="item"
                effect="dark"
                content="用标签栏分类或者直接全部展示"
                placement="left"
              >
                <el-form-item label="分类显示">
                  <el-row>
                    <el-col :span="3"
                      ><el-switch v-model="setting.isTag"></el-switch
                    ></el-col>
                    <el-col v-if="setting.isTag" :span="20" :offset="1">
                      <el-form-item prop="tagActiveName">
                        <el-select
                          v-model="setting.tagActiveName"
                          placeholder="选择默认标签"
                        >
                          <el-option
                            v-for="item in setting.source"
                            :key="item"
                            :label="numberOrEnNameToName(item)"
                            :value="numberOrEnNameToName(item)"
                          >
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="模式切换仅为预览，需点击保存存储设置"
                placement="left"
              >
                <el-form-item label="主题切换">
                  <el-radio-group v-model="setting.darkshow">
                    <el-radio :label="0">日常模式</el-radio>
                    <el-radio :label="1">夜间模式</el-radio>
                    <el-radio :label="-1" title="18点到06点为夜间模式"
                      >自动模式</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-tooltip>
            </el-tab-pane>
            <el-tab-pane label="反馈通道" name="2">
              <div v-html="saveInfo.feedbackInfo"></div>
            </el-tab-pane>
          </el-tabs>
          <div class="btn-area">
            <el-button type="primary" @click="saveSetting('form')"
              >保存</el-button
            >
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";

import {
  common,
  timespanToDay,
  numberOrEnNameToName,
} from "../assets/JS/common";
export default {
  name: "app",
  components: { countTo },
  mounted() {
    this.init();
  },
  watch: {
    setting: {
      handler(newobj) {
        let hour = new Date().getHours();
        this.setting.outsideClass =
          (newobj.darkshow == -1 && (hour >= 18 || hour < 6)) ||
          newobj.darkshow == 1
            ? "dark"
            : "light";
        // this.saveSetting();
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      cardlist: [],
      saveInfo: common.saveInfo,
      oldDunIndex: 0,
      dunInfo: common.dunInfo,
      setting: common.setting,
      marks: {
        8: "20点",
        12: "当天凌晨",
        20: "8点",
      },
      activeTab: "0",
      rules: {
        tagActiveName: [
          { required: true, message: "请选择默认标签", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    // nextdunTime() {
    //   console.log(this.setting.islowfrequency);
    //   if (this.setting.islowfrequency) {
    //     return timespanToDay(
    //       this.dunInfo.dunTime / 1000 + this.setting.time * 2
    //     );
    //   }
    //   return timespanToDay(this.dunInfo.dunTime / 1000 + this.setting.time);
    // },
  },
  methods: {
    numberOrEnNameToName,
    timespanToDay,
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

    saveSetting(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveLocalStorage("setting", this.setting).then(() => {
            chrome.runtime.sendMessage({ info: "setting" });
            this.$message({
              center: true,
              message: "保存成功",
              type: "success",
            });
          });
        } else {
          console.log("error submit!!");
          return false;
        }
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

    // 低频时间选择
    lowfrequencyTimeTooltip(val) {
      if (val == 12) {
        return "当天凌晨";
      } else if (val < 12) {
        return `上一天${val + 12}点整`;
      } else if (val > 12) {
        return `当天${val - 12}点整`;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "../theme/theme.less";

.styleChange(@theme) {
  @bgColor: "bgColor-@{theme}"; // 背景颜色
  @content: "content-@{theme}"; // 文本颜色
  @timeline: "timeline-@{theme}"; // 时间线颜色和时间线border颜色
  @subTitle: "subTitle-@{theme}"; // 小标题颜色
  @btnBorder: "btnBorder-@{theme}"; // 按钮边框颜色和一些小线条
  @setLarge: "setLarge-@{theme}"; // 设置标题颜色
  @setSmall: "setSmall-@{theme}"; // 设置文本颜色
  @shadow: "shadow-@{theme}"; // 卡片的阴影
  @hover: "hover-@{theme}"; // 按钮hover颜色
  @numberInput: "numberInput-@{theme}"; //设置页面加减按钮

  #app {
    /deep/ a {
      color: @@content!important;
    }

    width: 600px;
    min-width: 600px;
    margin: auto;
    .is-always-shadow {
      box-shadow: 0 2px 12px 0 @@shadow;
    }
    .box-card {
      background-color: @@bgColor;
      border: @@btnBorder 1px solid;

      .el-divider {
        background-color: @@btnBorder;
      }
      .img {
        width: 50px;
      }
      .version {
        font-size: 1.5rem;
        color: @@setLarge;
      }
      .info {
        text-align: center;
        .info-title {
          font-size: 1.3rem;
          color: @@setLarge;
        }
        .info-time {
          font-size: 0.8rem;
          color: #aaa;
          margin: 10px 0;
        }
      }
      .el-tabs--border-card {
        border: @@btnBorder 1px solid;
        box-shadow: 0 2px 4px 0 @@shadow, 0 0 6px 0 @@shadow;

        /deep/.el-tabs__header {
          background-color: @@numberInput;
          border-bottom: 1px solid @@btnBorder;
        }
        /deep/.el-tabs__item {
          color: @@subTitle;
        }
        /deep/.el-tabs__item.is-active {
          background-color: @@bgColor;
          border-right-color: @@btnBorder;
          border-left-color: @@btnBorder;
        }
        /deep/.el-tabs__content {
          background-color: @@bgColor;
        }
      }

      /deep/.el-input-number.is-controls-right .el-input-number__increase {
        border-bottom: 1px solid @@btnBorder;
      }
      /deep/.el-input-number__increase,
      /deep/.el-input-number__decrease {
        background-color: @@numberInput;
        border-left: @@btnBorder 1px solid;
        color: @@setSmall;
      }
      /deep/.el-input-number__increase:hover + .el-input > .el-input__inner,
      /deep/.el-input-number__decrease:hover
        + .el-input-number__increase
        + .el-input
        > .el-input__inner {
        border: #409eff 1px solid;
      }
      /deep/.el-input__inner {
        background-color: @@bgColor;
        color: @@setLarge;
        border: @@btnBorder 1px solid;
      }
      /deep/.el-input__inner:focus {
        border-color: #409eff;
      }
      /deep/.el-form-item__label,
      /deep/.el-radio,
      /deep/.el-checkbox {
        color: @@setSmall;
      }
      .lowfrequency-time-picker {
        width: 100%;
      }
      .el-radio__input.is-checked + .el-radio__label {
        color: #409eff;
      }
      .btn-area {
        width: 100%;
        text-align: center;
        margin-top: 10px;
      }

      .checkbox-area {
        display: flex;
        align-items: center;
        .iconimg {
          margin-right: 5px;
          width: 16px;
        }
      }
      /deep/.footer {
        color: @@setLarge;
      }
    }
  }
  .white {
    background-color: #fff;
  }
}

.background {
  transition: background 0.5s;
  height: calc(100vh - 16px);
  overflow: auto;
}

.dark {
  .styleChange(dark);
  margin: -8px;
  background-color: #22272e;
  border: #22272e 8px solid;
}

.light {
  .styleChange(light);
}
</style>