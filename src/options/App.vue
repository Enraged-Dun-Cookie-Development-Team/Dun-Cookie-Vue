<template>
  <div class="background" :class="settings.getColorTheme()">
    <div id="app">
      <el-card class="box-card" shadow="never">
        <el-row type="flex" align="middle" justify="space-around">
          <el-image class="img" src="../assets/image/icon.png"></el-image>
          <div class="version">小刻食堂 V{{ currentVersion }}</div>
        </el-row>
        <el-divider></el-divider>
        <div class="info">
          <div class="info-time">
            小刻在 {{ formatTime(settings.initTime, 'yyyy-MM-dd hh:mm:ss') }} 进入食堂
          </div>
          <div class="info-title">
            小刻已经找了<span style="color: #23ade5"
              ><countTo
                :startVal="oldDunCount"
                :endVal="dunInfo.counter"
                :duration="1000"
              ></countTo></span
            >次饼了
          </div>
          <div class="info-time">
            小刻在 {{ formatTime(dunInfo.lastDunTime, 'hh:mm:ss') }} 翻箱倒柜一次
          </div>
          <!-- <div class="info-time">下次蹲饼时间：{{ nextdunTime }}</div> -->
        </div>
        <el-divider></el-divider>
        <el-form :rules="rules" ref="form" :model="settings" label-width="100px">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="核心设置" name="0">
              <el-tooltip
                class="item"
                effect="dark"
                content="选择勾选来源，最少选择一个"
                placement="bottom"
              >
                <el-form-item label="饼来源">
                  <el-checkbox-group v-model="settings.enableDataSources" :min="1">
                    <el-checkbox v-for="source of defSourcesList" :key="source.dataName" :label="source.dataName">
                      <span class="checkbox-area">
                        <img class="iconimg" :src="source.icon"/>
                        {{ source.title }}
                      </span>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" placement="bottom">
                <div slot="content">
                  微博端API有些账户需要登录才能查看最新微博<br />
                  登录完成后点击“查看是否登录成功”按钮，如果能看到正常的微博个人信息，则表示成功<br />
                  如果是登录注册页面，请点击“进入登录页面”按钮重新登录
                </div>
                <el-form-item label="微博登录">
                  <el-button
                    size="small"
                    @click="openUrl('https://passport.weibo.cn/signin/login')"
                    >进入登录页面</el-button
                  >
                  <el-button
                    size="small"
                    @click="openUrl('https://m.weibo.cn/profile/')"
                    >查看是否登录成功</el-button
                  >
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="是多少秒刷新一次，不是一秒刷新多少次"
                placement="bottom"
              >
                <el-form-item label="蹲饼频率(秒)">
                  <el-input-number
                    controls-position="right"
                    size="small"
                    v-model="settings.dun.intervalTime"
                    :min="3"
                    :max="3600"
                  ></el-input-number>
                  <span style="margin-left: 20px" v-if="settings.dun.autoLowFrequency">
                    低频模式下为{{ settings.dun.intervalTime * 2 }}秒刷新一次
                  </span>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="关闭后仅可以查看列表，无法在电脑右下角和通知栏收到推送！"
                placement="bottom"
              >
                <el-form-item label="推送">
                  <el-switch v-model="settings.dun.enableNotice"></el-switch>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="时间段内蹲饼的攻速降低100%，用来节省流量和性能，降低打开后数据请看蹲饼频率后面的文字说明"
                placement="bottom"
              >
                <el-form-item label="低频模式">
                  <el-row>
                    <el-col :span="3">
                      <el-switch v-model="settings.dun.autoLowFrequency"></el-switch
                    ></el-col>
                    <el-col
                      v-show="settings.dun.autoLowFrequency"
                      :span="20"
                      :offset="1"
                    >
                      <el-slider
                        v-model="settings.dun.lowFrequencyTime"
                        show-stops
                        :max="24"
                        :marks="marks"
                        :format-tooltip="lowFrequencyTimeTooltip"
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
                  <el-radio-group v-model="settings.dun.sortModeForOnlyDate">
                    <el-radio :label="1">当天内容顶部</el-radio>
                    <el-radio :label="2">当天内容底部</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-tooltip>
               
            </el-tab-pane>
            <el-tab-pane label="界面设置" name="1">
              <el-form-item label="字体大小">
                <el-radio-group v-model="settings.display.fontSize">
                  <el-radio :label="-1">小</el-radio>
                  <el-radio :label="0">正常</el-radio>
                  <el-radio :label="1">大</el-radio>
                  <el-radio :label="2">特别大</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="展示图片">
                <el-switch v-model="settings.display.showImage"></el-switch>
              </el-form-item>
              <el-tooltip class="item" effect="dark" placement="left">
                <div slot="content">
                  转发内容大部分为抽奖结果，为了防止有人吃不了柠檬陷的饼，特意添加此开关。调整此开关会导致<br />
                  调整此开关会导致源数据改变，可能会有错误的推送！
                </div>
                <el-form-item label="显示转发">
                  <el-switch v-model="settings.dun.showRetweet"></el-switch>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="用标签栏分类或者直接全部展示"
                placement="left"
              >
                <el-form-item label="分类显示">
                  <el-row>
                    <el-col :span="3"
                      ><el-switch v-model="settings.display.showByTag"></el-switch
                    ></el-col>
                    <el-col v-if="settings.display.showByTag" :span="20" :offset="1">
                      <el-form-item prop="defaultTag">
                        <el-select v-model="settings.display.defaultTag" placeholder="选择默认标签">
                          <el-option
                              v-for="source in settings.enableDataSources"
                              :key="source.dataName"
                              :label="source.title"
                              :value="source.dataName"
                          >
                            <div style="display: flex; align-items: center">
                              <img :src="source.icon" style="width: 25px; margin-right: 10px"/>
                              <span>{{ source.title }}</span>
                            </div>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-tooltip>
              <el-form-item label="窗口化" v-if="settings.feature.window">
                <el-switch v-model="settings.display.windowMode"></el-switch>
              </el-form-item>
              <el-form-item label="理智提醒">
                <el-switch v-model="settings.san.noticeWhenFull"></el-switch>
              </el-form-item>
              <el-tooltip
                v-if="settings.feature.san"
                class="item"
                effect="dark"
                content="用于公告栏计算理智回复"
                placement="left"
              >
                <el-form-item label="理智上限">
                  <el-input-number
                    controls-position="right"
                    size="small"
                    v-model="settings.san.maxValue"
                    :min="80"
                    :max="135"
                  ></el-input-number>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="模式切换仅为预览，需点击保存存储设置"
                placement="left"
              >
                <el-form-item label="主题切换">
                  <el-radio-group v-model="settings.display.darkMode">
                    <el-radio :label="0">日常模式</el-radio>
                    <el-radio :label="1">夜间模式</el-radio>
                    <el-radio :label="-1" title="18点到06点为夜间模式"
                      >自动模式</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-tooltip>
            </el-tab-pane>
            <el-tab-pane label="配置导入导出" name="3">
              <div style="display: flex; justify-content: space-around">
                <el-button type="success" size="small" @click="settingExport"
                  >导出配置</el-button
                >
                <!-- action随便传个参数，不然会报错 -->
                <el-upload
                  action="aaa"
                  :auto-upload="false"
                  :on-change="settingImport"
                  ref="upload"
                  accept="application/json"
                  :show-file-list="false"
                >
                  <el-button
                    type="danger"
                    size="small"
                    style="margin-left: 50px"
                    >导入配置</el-button
                  >
                </el-upload>
              </div>
            </el-tab-pane>
            <el-tab-pane label="反馈通道" name="2">
              <Feedback></Feedback>
            </el-tab-pane>
          </el-tabs>
          <div class="btn-area" v-if="activeTab == '0' || activeTab == '1'">
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

import Settings from '../common/Settings';
import BrowserUtil from '../common/util/BrowserUtil';
import DunInfo from '../common/sync/DunInfo';
import Feedback from '../components/Feedback';
import {CURRENT_VERSION, MESSAGE_DUN_INFO_UPDATE} from '../common/Constants';
import {defaultDataSourcesList} from '../common/datasource/DefaultDataSources';
import TimeUtil from '../common/util/TimeUtil';

export default {
  name: "app",
  components: {Feedback, countTo },
  mounted() {
    this.init();
  },
  watch: {},
  data() {
    return {
      currentVersion: CURRENT_VERSION,
      oldDunCount: 0,
      dunInfo: DunInfo,
      settings: Settings,
      defSourcesList: defaultDataSourcesList,
      marks: {
        8: "20点",
        12: "第二天凌晨",
        20: "8点",
      },
      activeTab: "0",
      rules: {
        defaultTag: [
          { required: true, message: "请选择默认标签", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
  },
  methods: {
    formatTime: TimeUtil.format,
    openUrl: BrowserUtil.createTab(url),
    init() {
      BrowserUtil.addMessageListener('options', MESSAGE_DUN_INFO_UPDATE, data => {
        this.oldDunCount = data.counter;
      });
    },
    // 保存设置
    saveSetting(formName, data) {
      if (!data) {
        data = this.$refs[formName].data
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          settings.setAll(data);
          settings.saveSettings().then(() => {
            this.$message({
              center: true,
              message: "保存成功",
              type: "success",
            });
          });
        } else {
          console.log("form invalid and can't submit!");
          return false;
        }
      });
    },

    // 导出设置
    settingExport() {
      const blob = new Blob([JSON.stringify(settings)], {
        type: "application/json",
      });
      let src = URL.createObjectURL(blob);
      BrowserUtil.downloadFile({ url: src, saveAs: true }, (data) => {
        console.log(data);
      });
    },
    // 导入设置
    settingImport(file) {
      const reader = new FileReader();
      reader.onload = (res) => {
        const { result } = res.target; // 得到字符串
        const data = JSON.parse(result); // 解析成json对象
        this.$confirm("解析文件成功，是否覆盖当前设置?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.saveSetting("form", data);
          })
          .catch(() => {
            this.$message("你决定了不覆盖当前设置项");
          });
      }; // 成功回调
      reader.onerror = (err) => {
        this.$message.error("没有导入成功，心态崩了啊！");
        this.$notify({
          title: "貌似检测到导出失败",
          message: "可以加QQ群 362860473 后将文件发送给管理员查看检测问题",
          duration: 0,
        });
      }; // 失败回调
      reader.readAsText(new Blob([file.raw]), "utf-8"); // 按照utf-8编码解析
    },

    // 低频时间选择
    lowFrequencyTimeTooltip(val) {
      if (val === 12) {
        return "第二天凌晨";
      } else if (val < 12) {
        return `当天${val + 12}点整`;
      } else if (val > 12) {
        return `第二天${val - 12}点整`;
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
  @setBtnBorder: "setBtnBorder-@{theme}";
  @btnBg: "btnBg-@{theme}"; // 按钮内部颜色
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
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
    .box-card {
      background-color: @@bgColor;
      border: @@btnBorder 1px solid;

      .el-divider {
        background-color: @@btnBorder;
      }
      .img {
        width: 80px;
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
        box-shadow: none;
        background: none;

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

          #pane-0 .el-button {
            color: @@setSmall;
            background-color: @@bgColor;
            border: @@btnBorder 1px solid;
          }
          #pane-0 .el-button:hover {
            color: #409eff;
            border-color: #c6e2ff;
            background-color: @@hover;
          }
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
