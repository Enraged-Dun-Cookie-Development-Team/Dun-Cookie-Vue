<template>
  <div id="app">
    <div v-if="false" class="loading-title-area" ref="loading-title">
      <el-image class="loading-image" src="../assets/image/icon.png"></el-image>
      <div class="loading-title">欢迎使用小刻食堂 V{{ currentVersion }}</div>
    </div>
    <!--    <div v-show="bodyIsShow">-->
    <div>
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
              <div class="has-cookie">
                小刻已经成功找到
                <countTo
                  :startVal="0"
                  :endVal="dunInfo.cookieCount"
                  :duration="1000"
                ></countTo>
                个饼
              </div>
              <div class="look-cookie">
                进入食堂后找了
                <countTo
                  :startVal="oldDunCount"
                  :endVal="dunInfo.counter"
                  :duration="1000"
                ></countTo>
                次
              </div>
            </div>
            <div class="more-cookie" ref="more-cookie">
              <div>
                小刻在
                {{ formatTime(settings.initTime, "yyyy-MM-dd hh:mm:ss") }}
                进入食堂
              </div>
              <div class="info-time">
                小刻在
                {{ formatTime(dunInfo.lastDunTime, "hh:mm:ss") }} 翻箱倒柜一次
              </div>
            </div>
          </div>
        </div>
      </el-row>
      <div class="body-area" ref="body-area">
        <div class="body-menu-big">
          <div
            class="body-menu-big-left"
            ref="body-menu-big-left"
            @click="changeMenu(0)"
          >
            <div @click.stop="changeMenu()">back</div>
            <div class="menu-card system">
              <span>系统</span>
              <span>设置</span>
            </div>
          </div>
          <div
            class="body-menu-big-right"
            ref="body-menu-big-right"
            @click="changeMenu(1)"
          >
            <div @click.stop="changeMenu()">back</div>
            <div class="menu-card view">
              <span>界面</span>
              <span>设置</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";

import Settings from "../common/Settings";
import DunInfo from "../common/sync/DunInfo";
import Feedback from "../components/Feedback";
import { MESSAGE_DUN_INFO_UPDATE, SHOW_VERSION } from "../common/Constants";
import { defaultDataSourcesList } from "../common/datasource/DefaultDataSources";
import TimeUtil from "../common/util/TimeUtil";
import {
  customDataSourceTypes,
  customDataSourceTypesByName,
} from "../common/datasource/CustomDataSources";
import { deepAssign } from "../common/util/CommonFunctions";
import PlatformHelper from "../common/platform/PlatformHelper";
import "animate.css";

export default {
  name: "app",
  components: { countTo },
  // Feedback
  created() {},
  mounted() {
    this.init();
    // this.initAnimate();
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
      bodyIsShow: false,
      activeMenu: -1,
      menuList: ["body-menu-big-left", "body-menu-big-right"],
    };
  },
  computed: {},
  methods: {
    formatTime: TimeUtil.format,
    openUrl: PlatformHelper.Tabs.create,
    init() {
      this.settings.doAfterInit((settings) => {
        this.customData = settings.customDataSources
          .map((item) => {
            const type = customDataSourceTypesByName[item.type];
            if (type) {
              return {
                type: type.typeName,
                builder: type,
                arg: item.arg,
              };
            }
          })
          .filter((item) => !!item);
        global.customData = this.customData;
      });
      PlatformHelper.Message.registerListener(
        "options",
        MESSAGE_DUN_INFO_UPDATE,
        (data) => {
          this.oldDunCount = data.counter;
        }
      );
    },
    initAnimate() {
      this.animateCSS("loading-title", "zoomInDown", () => {
        setTimeout(() => {
          this.animateCSS("loading-title", "zoomOut", () => {
            this.bodyIsShow = true;
            this.animateCSS("head-area", "slideInDown");
            // this.animateCSS('body-area', 'fadeInUp')
            this.$refs["loading-title"].style.display = "none";
          });
        }, 500);
      });
    },
    addCustomData() {
      this.customData.push({ type: "" });
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
      this.settings.customDataSources = this.customData.map((item) => {
        return {
          type: item.type,
          arg: item.arg,
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
      PlatformHelper.Downloads.downloadURL(
        URL.createObjectURL(blob),
        undefined,
        true
      ).then((data) => {
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

    // 以下为动画使用 后期移动到通用类
    animateCSS(element, animation, callback) {
      let prefix = "animate__";
      new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = this.$refs[element];
        // document.querySelector(element)
        node.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd(event) {
          event.stopPropagation();
          node.classList.remove(`${prefix}animated`, animationName);
          resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, {
          once: true,
        });
      }).then(() => {
        if (callback) {
          callback();
        }
      });
    },
    changeMenu(className = -1) {
      if (className == -1) {
        this.menuList.forEach((item) => {
          this.$refs[item].classList.remove("hide");
          this.$refs[item].classList.remove("active");
        });
      } else {
        this.menuList.forEach((item, index) => {
          if (index == className) {
            this.$refs[item].classList.add("active");
          } else {
            this.$refs[item].classList.add("hide");
          }
        });
      }
    },
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

      &:hover + .more-cookie {
        opacity: 1;
      }

      .has-cookie {
        font-size: 1.6rem;
      }

      .look-cookie {
        margin-top: 5px;
        font-size: 1.2rem;
      }
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
      z-index: 999;

      .info-time {
        margin-top: 10px;
      }
    }
  }
}

.body-area {
  .body-menu-big {
    height: calc(100vh - 100px);
    position: relative;

    .body-menu-big-left,
    .body-menu-big-right {
      position: absolute;
      left: calc(25vw - 150px);
      top: calc(50vh - 100px - 150px);
      width: 300px;
      height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      transition: 1s all;

      &.active {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        .menu-card {
          border: 2px solid #fff;

          span:first-child,
          span:last-child {
            font-size: 3rem;
            bottom: 10px;
          }

          span:last-child {
            left: 123px;
          }

          &.system:after,
          &.view:after {
            font-size: 4rem;
            right: 6px;
            top: 6px;
          }
        }
      }

      &.hide {
        width: 0;
        height: 0;
        opacity: 0;
        z-index: -1;
      }

      .menu-card {
        width: 100%;
        height: 100%;
        cursor: pointer;
        border-radius: 3px;
        border: 2px solid #cccccc;
        display: flex;
        flex-direction: column;
        user-select: none;
        position: relative;
        overflow: hidden;
        transition: all 1s;
        box-sizing: border-box;

        &.system:after,
        &.view:after {
          font-family: element-icons !important;
          content: "\e6ca";
          font-size: 15rem;
          position: absolute;
          right: -40px;
          top: -70px;
          opacity: 0.2;
          z-index: 0;
          transition: all 1s;
        }

        &.view:after {
          content: "\e775";
        }

        span:first-child,
        span:last-child {
          font-size: 5.5rem;
          color: #fff;
          font-family: "SimHei", -apple-system, BlinkMacSystemFont,
            "Microsoft YaHei", "Segoe UI", "Roboto", "Helvetica Neue", Arial,
            sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          text-shadow: 0 0 1rem #312f2f, 0 0 0.5rem #312f2f, 0 0 0.25rem #312f2f;
          position: absolute;
          bottom: 90px;
          left: 25px;
          z-index: 2;
          transition: all 1s;
        }

        span:last-child {
          font-size: 4rem;
          left: 95px;
          bottom: 20px;
          z-index: 1;
        }
      }
    }

    .body-menu-big-right {
      left: calc(75vw - 150px);
      top: calc(50vh - 100px - 150px);
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
}

.info-animate {
  border-radius: 3px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #312f2f;
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
      content: " ";
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
