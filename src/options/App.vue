<template>
  <div id="app">
    <div class="loading-title-area" ref="loading-title">
      <el-image class="loading-image" src="../assets/image/icon.png"></el-image>
      <div class="loading-title">欢迎使用小刻食堂 V{{ currentVersion }}</div>
    </div>
    <div v-show="bodyIsShow" >
      <el-row>
        <div class="head-area" ref="head-area">
          <div class="head">
            <el-image class="img" src="../assets/image/icon.png"></el-image>
            <div class="name-area">
              <div class="name">小刻食堂</div>
              <div class="version">V {{ currentVersion }}</div>
            </div>
          </div>
          <div class="info-animate">
            <div class="animate">A</div>
            <div>小刻食堂正常运行中</div>
          </div>
          <div class="info">
            <div class="info-title">
              <div class="has-cookie">小刻已经成功找到
                <countTo
                    :startVal="0"
                    :endVal="dunInfo.cookieCount"
                    :duration="1000"
                ></countTo>
                个饼
              </div>
              <div class="look-cookie"> 进入食堂后找了
                <countTo
                    :startVal="oldDunCount"
                    :endVal="dunInfo.counter"
                    :duration="1000"
                ></countTo>
                次
              </div>
              <div class="more-cookie" ref="more-cookie">
                <div>
                  小刻在 {{ formatTime(settings.initTime, 'yyyy-MM-dd hh:mm:ss') }} 进入食堂
                </div>
                <div class="info-time">
                  小刻在 {{ formatTime(dunInfo.lastDunTime, 'hh:mm:ss') }} 翻箱倒柜一次
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-row>
      <div ref="body-area">
        <el-form ref="form" class="form" :model="settings" label-width="100px">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="核心设置" name="0">
              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  content="选择勾选来源，最少选择一个"
                  placement="bottom"
              >
                <el-form-item label="饼来源">
                  <el-checkbox-group class="checkbox-group-area" v-model="settings.enableDataSources" :min="1">
                    <el-checkbox v-for="source of defSourcesList" :key="source.dataName" :label="source.dataName">
                      <span class="checkbox-area">
                        <img class="icon-img" :src="source.icon"/>
                        {{ source.title }}
                      </span>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  placement="bottom"
              >
                <div slot="content">
                  微博端API有些账户需要登录才能查看最新微博<br/>
                  登录完成后点击“查看是否登录成功”按钮，如果能看到正常的微博个人信息，则表示成功<br/>
                  如果是登录注册页面，请点击“进入登录页面”按钮重新登录
                </div>
                <el-form-item label="微博登录">
                  <el-button
                      size="small"
                      @click="openUrl('https://passport.weibo.cn/signin/login')"
                  >进入登录页面
                  </el-button
                  >
                  <el-button
                      size="small"
                      @click="openUrl('https://m.weibo.cn/profile/')"
                  >查看是否登录成功
                  </el-button
                  >
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  :open-delay="1000"
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
                      :min="15"
                      :max="3600"
                  ></el-input-number>
                  <span style="margin-left: 20px" v-if="settings.dun.autoLowFrequency">
                    低频模式下为{{ settings.dun.intervalTime * settings.dun.timeOfLowFrequency }}秒刷新一次
                  </span>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  v-if="settings.dun.autoLowFrequency"
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  content="这个低频模式倍数乘原蹲饼时间为低频模式每次刷新时间间隔"
                  placement="bottom"
              >
                <el-form-item label="蹲饼频率(秒)">
                  <el-input-number
                      controls-position="right"
                      size="small"
                      v-model="settings.dun.timeOfLowFrequency"
                      :min="2"
                      :max="20"
                  ></el-input-number>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  :open-delay="1000"
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
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  content="关闭后不会在电脑右下角和通知栏收到重要公告推送，如刷活动前刷剿灭提醒与因不明原因导致小刻食堂崩溃！"
                  placement="bottom"
              >
                <el-form-item label="重要公告推送">
                  <el-switch v-model="settings.feature.announcementNotice"></el-switch>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  content="时间段内蹲饼的攻速降低，用来节省流量和性能，降低打开后数据请看蹲饼频率后面的文字说明"
                  placement="bottom"
              >
                <el-form-item label="低频模式">
                  <el-row>
                    <el-col :span="3">
                      <el-switch v-model="settings.dun.autoLowFrequency"></el-switch
                      >
                    </el-col>
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

              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  placement="bottom"
              >
                <div slot="content">
                  有些数据比如通讯组是只有日期没有时间的，在数据列表内无法排序，所以在此统一这些卡片在当天信息流内是置顶还是置底。<br/>
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
              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  placement="left"
              >
                <div slot="content">
                  转发内容大部分为抽奖结果，为了防止有人吃不了柠檬陷的饼，特意添加此开关。调整此开关会导致<br/>
                  调整此开关会导致源数据改变，可能会有错误的推送！
                </div>
                <el-form-item label="显示转发">
                  <el-switch v-model="settings.dun.showRetweet"></el-switch>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  placement="left"
              >
                <div slot="content">
                  列表打开快速跳转链接时，自动最大窗口并打开链接
                </div>
                <el-form-item label="窗口最大化">
                  <el-switch v-model="settings.feature.linkMax"></el-switch>
                </el-form-item>
              </el-tooltip>
              <el-tooltip
                  :open-delay="1000"
                  class="item"
                  effect="dark"
                  content="用标签栏分类或者直接全部展示"
                  placement="left"
              >
                <el-form-item label="分类显示">
                  <el-row>
                    <el-col :span="3"
                    >
                      <el-switch v-model="settings.display.showByTag"></el-switch
                      >
                    </el-col>
                    <el-col v-if="settings.display.showByTag" :span="20" :offset="1">
                      <el-form-item prop="display.defaultTag"
                                    :rules="{required: true, message: '请选择默认标签', trigger: 'blur'}">
                        <el-select v-model="settings.display.defaultTag" placeholder="选择默认标签">
                          <el-option
                              v-for="source in settings.currentDataSources"
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
                <el-switch v-model="settings.feature.san"></el-switch>
              </el-form-item>
              <el-tooltip
                  :open-delay="1000"
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
                  :open-delay="1000"
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
                    >自动模式
                    </el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-tooltip>
            </el-tab-pane>
            <el-tab-pane label="配置导入导出" name="3">
              <div style="display: flex; justify-content: space-around">
                <el-button type="success" size="small" @click="settingExport"
                >导出配置
                </el-button
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
                  >导入配置
                  </el-button
                  >
                </el-upload>
              </div>
            </el-tab-pane>
            <el-tab-pane label="反馈通道" name="2">
              <Feedback></Feedback>
            </el-tab-pane>
            <el-tab-pane v-if="false" label="高级设置" name="4">
              <div>
                <span>自定义数据源</span>
                <el-table
                    :data="customData"
                    style="width: 100%"
                    max-height="350">
                  <el-table-column
                      label="类型"
                      width="150">
                    <template #default="scope">
                      <el-select v-model="scope.row.type"
                                 @change="handleChangeCustomDataType(scope.$index, scope.row.type)" placeholder="请选择">
                        <el-option
                            v-for="item in customTypes"
                            :key="item.name"
                            :label="item.builder.title"
                            :value="item.name">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="参数"
                      width="270">
                    <template #default="scope">
                      <el-popover v-if="scope.row.type" :open-delay="700" trigger="hover" placement="top">
                        <template #default>{{ scope.row.builder.title }}</template>
                        <template #reference>
                          <el-input v-model="scope.row.arg" :placeholder="scope.row.builder.argTip"></el-input>
                        </template>
                      </el-popover>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作">
                    <template #header>
                      <el-button
                          size="mini"
                          type="success"
                          @click="addCustomData()">新增
                      </el-button>
                    </template>
                    <template #default="scope">
                      <el-button
                          size="mini"
                          type="danger"
                          @click="removeCustomData(scope.$index)">删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="btn-area" v-if="activeTab == '0' || activeTab == '1' || activeTab == '4'">
            <el-button type="primary" @click="saveSetting('form')"
            >保存
            </el-button
            >
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";

import Settings from '../common/Settings';
import DunInfo from '../common/sync/DunInfo';
import Feedback from '../components/Feedback';
import {MESSAGE_DUN_INFO_UPDATE, SHOW_VERSION} from '../common/Constants';
import {defaultDataSourcesList} from '../common/datasource/DefaultDataSources';
import TimeUtil from '../common/util/TimeUtil';
import {customDataSourceTypes, customDataSourceTypesByName} from '../common/datasource/CustomDataSources';
import {deepAssign} from '../common/util/CommonFunctions';
import PlatformHelper from '../common/platform/PlatformHelper';
import "animate.css"

export default {
  name: "app",
  components: {Feedback, countTo},
  created() {

  },
  mounted() {
    this.init();
    this.animateCSS('loading-title', 'zoomInDown', () => {
      setTimeout(() => {
        this.animateCSS('loading-title', 'zoomOut', () => {
          this.bodyIsShow = true;
          this.animateCSS('head-area', 'slideInDown')
          this.animateCSS('body-area', 'fadeInUp')
          this.$refs['loading-title'].style.display = 'none';

        });
      }, 500);
    });
  },
  watch: {},
  data() {
    return {
      currentVersion: SHOW_VERSION,
      oldDunCount: 0,
      dunInfo: DunInfo,
      settings: Settings,
      defSourcesList: defaultDataSourcesList,
      customTypes: customDataSourceTypes,
      customTypesByName: customDataSourceTypesByName,
      marks: {
        8: "20点",
        12: "第二天凌晨",
        20: "8点",
      },
      activeTab: "0",
      customData: [],
      bodyIsShow: false
    };
  },
  computed: {},
  methods: {
    formatTime: TimeUtil.format,
    openUrl: PlatformHelper.Tabs.create,
    init() {
      this.settings.doAfterInit((settings) => {
        this.customData = settings.customDataSources.map(item => {
          const type = customDataSourceTypesByName[item.type];
          if (type) {
            return {
              type: type.typeName,
              builder: type,
              arg: item.arg
            };
          }
        }).filter(item => !!item);
        global.customData = this.customData;
      });
      PlatformHelper.Message.registerListener('options', MESSAGE_DUN_INFO_UPDATE, data => {
        this.oldDunCount = data.counter;
      });
    },
    addCustomData() {
      this.customData.push({type: ''});
    },
    handleChangeCustomDataType(index, newType) {
      this.customData[index].builder = customDataSourceTypesByName[newType];
    },
    removeCustomData(index) {
      this.customData.splice(index, 1);
    },
    // 保存设置
    saveSetting(formName, data) {
      if (data) {
        deepAssign(this.settings, data);
      }
      this.settings.customDataSources = this.customData.map(item => {
        return {
          type: item.type,
          arg: item.arg
        };
      });
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.settings.saveSettings().then(() => {
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
      const blob = new Blob([JSON.stringify(this.settings)], {
        type: "application/json",
      });
      PlatformHelper.Downloads.downloadURL(URL.createObjectURL(blob), undefined, true)
          .then(data => {
            console.log(data);
          });
    },
    // 导入设置
    settingImport(file) {
      const reader = new FileReader();
      reader.onload = (res) => {
        const {result} = res.target; // 得到字符串
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

    // 以下为动画使用 后期移动到通用类
    animateCSS(element, animation, callback) {
      let prefix = 'animate__';
      new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = this.$refs[element];
        // document.querySelector(element)
        node.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd(event) {
          event.stopPropagation();
          node.classList.remove(`${prefix}animated`, animationName);
          resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, {once: true});
      }).then(() => {
        if (callback) {
          callback()
        }
      });
    }
  },
};
</script>

<style lang="less" scoped>


.loading-title-area {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  user-select: none;

  .loading-title {
    font-size: 2rem;
    margin-top: 50px;
  }

  .loading-image {
    width: 200px;
  }
}

.head-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #23ade5;
  color: #fff;
  height: 100px;
  padding: 0 20px;

  .head {
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;

    .img {
      width: 80px;
    }

    .name-area {
      display: flex;
      flex-direction: column;
      margin-left: 20px;

      .name {
        font-size: 1.6rem;
      }

      .version {
        margin-top: 5px;
        font-size: 1.2rem;
      }
    }
  }

  .info {
    text-align: center;
    color: #ffffff;
    position: relative;

    .info-title {
      font-size: 1.3rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      user-select: none;

      &:hover {
        .more-cookie {
          opacity: 1;
        }
      }

      .has-cookie {
        font-size: 1.6rem;
      }

      .look-cookie {
        margin-top: 5px;
        font-size: 1.2rem;
      }

      .more-cookie {
        border-radius: 3px;
        position: absolute;
        right: -10px;
        background: #23ade5;
        color: #ffffff;
        top: 90px;
        text-align: right;
        font-size: 0.95rem;
        padding: 10px;
        opacity: 0;
        transition: all 0.5s;

        .info-time {
          margin-top: 10px;
        }
      }
    }

  }
}

//表单
.form {
  .btn-area {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }

  .checkbox-group-area {
    display: flex;
    flex-wrap: wrap;

    .el-checkbox {
      display: flex;
      align-items: center;

      .checkbox-area {
        display: flex;
        align-items: center;

        .icon-img {
          margin-right: 5px;
          width: 16px;
        }
      }
    }
  }

}

.info-animate {
  border-radius: 3px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #312F2F;
  color: #fff;
  padding: 16px 30px;
  font-size: 1.6rem;
  width: 300px;

  .animate {
    position: relative;
    width: 30px;
    text-align: center;

    &::after {
      position: absolute;
      content: ' ';
      width: 40px;
      height: 40px;
      border: 3px #fff;
      border-style: solid none none none;
      top: -3px;
      left: -5px;
      border-radius: 50%;
      animation: rotate infinite 2s linear;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
