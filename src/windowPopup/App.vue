<template>
  <div :class="setting.outsideClass">
    <div id="app">
      <el-drawer
        :visible.sync="drawer"
        :show-close="false"
        class="menu-drawer"
        direction="rtl"
        size="520px"
      >
        <el-divider content-position="left">饼的发源地</el-divider>
        <el-row type="flex" class="drawer-btn-area" justify="center">
          <el-tooltip
            :key="item.img"
            v-for="item in quickJump.soure"
            :content="item.name"
            placement="top"
          >
            <el-button size="small" @click="openUrl(item.url)"
              ><img
                class="btn-icon"
                :class="item.radius ? 'radius' : ''"
                :src="item.img"
            /></el-button>
          </el-tooltip>
        </el-row>
        <el-divider content-position="left">快捷工具</el-divider>
        <el-row type="flex" justify="center" class="drawer-btn-area">
          <el-tooltip
            :key="item.img"
            v-for="item in quickJump.tool"
            :content="item.name"
            placement="top"
          >
            <el-button size="small" @click="openUrl(item.url)"
              ><img
                class="btn-icon"
                :class="item.radius ? 'radius' : ''"
                :src="item.img"
            /></el-button>
          </el-tooltip>
        </el-row>
        <el-divider v-if="quickJump.url" content-position="left"
          >快捷链接</el-divider
        >
        <div class="drawer-btn-area-quickJump" ref="drawerBtnAreaQuickJump">
          <el-tooltip
            :content="item.name"
            :key="index"
            v-for="(item, index) in quickJump.url"
            placement="top"
          >
            <div class="quickJump-img-area">
              <img
                v-if="LazyLoaded"
                v-lazy="item.img"
                class="btn-icon"
                :class="item.radius ? 'radius' : ''"
                @click="openUrl(item.url)"
              />
            </div>
          </el-tooltip>
        </div>
        <el-divider content-position="left">调整蹲饼器</el-divider>
        <el-row type="flex" justify="center">
          <el-button type="primary" @click="openGithub" icon="el-icon-star-off"
            >点个star</el-button
          >
          <el-button
            type="primary"
            :loading="isReload"
            @click="reload"
            icon="el-icon-refresh"
            >刷新</el-button
          >
          <el-button type="primary" icon="el-icon-setting" @click="openSetting"
            >设置</el-button
          >
        </el-row>
        <div class="sign">Power By 蓝芷怡 & lwt</div>
      </el-drawer>
      
      <el-button
        v-show="!drawer"
        icon="el-icon-more"
        type="primary"
        circle
        class="more-btn"
        @click.stop="drawer = true"
      ></el-button>
      <div class="version">
        {{ `小刻食堂 V${saveInfo.version}` }}
      
          <span
            >【已蹲饼
            <countTo
              :startVal="oldDunIndex"
              :endVal="dunInfo.dunIndex"
              :duration="1000"
            ></countTo
            >次】</span
          >
          <span v-if="setting.islowfrequency"> 【低频蹲饼时段】 </span>
      </div>
      <div id="content">
      

        <!-- <time-line
          v-if="!setting.isTag"
          ref="TimeLine"
          :saveInfo="saveInfo"
          :setting="setting"
          :imgShow="LazyLoaded"
          :cardlist="cardlist"
          :allHeight="allHeight"
        >
        </time-line> -->
        <time-line
          v-if="!setting.isTag"
          ref="TimeLine"
          :saveInfo="saveInfo"
          :setting="setting"
          :imgShow="LazyLoaded"
          :cardlist="cardlist"
        >
        </time-line>

        <el-tabs
          v-if="setting.isTag"
          v-model="setting.tagActiveName"
          :stretch="true"
        >
          <el-tab-pane
            v-for="item in Object.keys(cardlistdm)"
            :key="item"
            :label="numberOrEnNameToName(item)"
            :name="numberOrEnNameToName(item)"
          >
            <span slot="label">
              <img
                :title="numberOrEnNameToName(item)"
                class="title-img"
                :src="numberOrEnNameToIconSrc(item)"
              />
            </span>
            <time-line
              ref="TimeLine"
              :saveInfo="saveInfo"
              :setting="setting"
              :imgShow="LazyLoaded"
              :cardlist="cardlistdm[item]"
            >
            </time-line>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";
import TimeLine from "../components/TimeLine";
import {
  common,
  timespanToDay,
  Get,
  numberOrEnNameToName,
  numberOrEnNameToIconSrc,
  numberToWeek,
  diffTime,
  saveLocalStorage,
  getLocalStorage,
} from "../assets/JS/common";
export default {
  name: "app",
  components: { countTo, TimeLine },
  mounted() {
    this.init();
  },
  watch: {
    drawer(value) {
      if (value) {
        this.$nextTick(() => {
          this.bindScroolFun();
        });
      } else {
        this.unbindScroolFun();
      }
    },
  },
  data() {
    return {
      show: false,
      LazyLoaded: false,
      isNew: false,
      sanShow: true,
      cardlist: [],
      cardlistdm: {},
      saveInfo: common.saveInfo,
      onlineSpeakList: [],
      oldDunIndex: 0,
      dunInfo: common.dunInfo,
      setting: common.setting,
      drawer: false, // 打开菜单
      isReload: false, // 是否正在刷新
      quickJump: common.quickJump,
      dayInfo: common.dayInfo,
      loading: true, // 初始化加载
      onlineDayInfo: {},
      // allHeight: 0,
    };
  },
  computed: {},
  beforeDestroy() {},
  methods: {
    numberOrEnNameToName,
    numberOrEnNameToIconSrc,
    numberToWeek,
    timespanToDay,
    diffTime,
    Get,
    saveLocalStorage,
    getLocalStorage,
    init() {
      setTimeout(() => {
        // 计算高度
        // this.calcHeight();
        this.getCardlist();
        this.getSaveInfo();
        this.getSetting();
        this.getDunInfo();
        // 图片卡 先加载dom后加载图片内容
        this.LazyLoaded = true;
        this.listenerWindowSize();
      }, 1);
    },
    listenerWindowSize() {
      window.onresize = (data) => {
        if (window.innerWidth <= 700) {
          alert("窗口太小,可能显示出现问题");
        }
      };
    },
    bindScroolFun() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      // 添加监听事件（不同浏览器，事件方法不一样，所以可以作判断，也可以如下偷懒）
      // scrollDiv.addEventListener("DOMMouseScroll", handler, false);
      scrollDiv.addEventListener("wheel", handler, false);
      function handler(event) {
        scrollDiv.scrollLeft = scrollDiv.scrollLeft + event.deltaY;
      }
    },
    unbindScroolFun() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      scrollDiv.removeEventListener("wheel");
    },
    // 检测更新
    getUpdateInfo() {
      chrome.runtime.sendMessage({ info: "getUpdateInfo" });
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
            // 轮询在这里
            this.getCardlist();
            this.getDunInfo();
            this.$refs.TimeLine.getSane();
          }, data.time * 500);
        }
      });
    },

    
    // 获取数据
    getCardlist() {
      this.getLocalStorage("cardlistdm").then((data) => {
        if (!data) {
          return;
        }
        this.cardlist = Object.values(data)
          .reduce((acc, cur) => [...acc, ...cur], [])
          .sort((x, y) => y.time - x.time)
          .map((x) => {
            x.dynamicInfo = x.dynamicInfo.replace(/\n/g, "<br/>");
            return x;
          });
        this.cardlistdm = data;
      });
    },

    // 更改高度，适应手机端
    // calcHeight() {
    //   this.allHeight =
    //     innerWidth >= 700 ? 599 : (innerHeight / innerWidth) * 700;
    // },

    // 强刷
    reload() {
      this.isReload = true;
      chrome.runtime.sendMessage({ info: "reload" });
      this.$message({
        offset: 50,
        center: true,
        message: "正在找饼，请保持网络畅通",
        type: "warning",
      });
      setTimeout(() => {
        this.drawer = false;
        this.isReload = false;
      }, 5000);
    },

    openUrl(url) {
      chrome.tabs.create({ url: url });
    },

    openSetting() {
      chrome.tabs.create({
        url: chrome.extension.getURL("options.html"),
      });
    },

    openDonate() {
      chrome.tabs.create({
        url: chrome.extension.getURL("donate.html"),
      });
    },

    openUpdate() {
      chrome.tabs.create({
        url: chrome.extension.getURL("update.html"),
      });
    },

    openGithub() {
      chrome.tabs.create({
        url:
          "https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue",
      });
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

    background-color: @@bgColor;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    font-size: 14px;
  }

  .color-blue {
    color: #23ade5;
  }

  .version {
    text-align: center;
    color: #23ade5;
    font-size: 1rem;
    position: fixed;
    width: calc(100% - 16px);
    height: 40px;
    line-height: 40px;
    top: 0;
  }
  .more-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999;
    opacity: 0.3;
    &:hover {
      opacity: 1;
    }
  }
  .menu-drawer {
    /deep/.el-drawer__body {
      padding: 10px;
    }
    .drawer-btn-area {
      .el-button {
        padding: 5px;
      }
      .btn-icon {
        width: 30px;
        &.radius {
          border-radius: 10px;
        }
      }
    }

    // 快捷连接
    .drawer-btn-area-quickJump {
      overflow-x: scroll;
      height: 100px;
      margin: 0 10px;
      display: flex;
      .quickJump-img-area {
        flex-shrink: 0;
        max-width: 350px;
        margin-right: 10px;
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid #dcdfe6;
        .quickJump-img-area {
        }
        img {
          height: 100px;
        }
      }
    }
  }

  // 标签栏
  /deep/ .el-tabs {
    .el-tabs__header {
      margin-bottom: 5px;
      margin-top: 15px;
      .title-img {
        width: 30px;
        border-radius: 4px;
      }
    }
    .el-tabs__content {
      min-height: calc(100vh - 239px);
      .el-timeline {
        height: calc(100vh - 239px);
      }
    }
    .el-tabs__nav-wrap::after {
      background-color: @@timeline;
    }
    .el-tabs__item {
      color: @@setLarge;
      &:hover {
        color: #409eff;
      }
    }
  }

  .sane-calculator {
    display: flex;
    justify-content: space-around;
    .el-form-item {
      margin-bottom: 0;
    }
  }

  #content {
    margin-top: 40px;
    // 间隔阴影
    .content-timeline-shadown {
      position: fixed;
      width: 100%;
      height: 20px;
      background: linear-gradient(180deg, @@bgColor 50%, transparent);
      z-index: 10;
    }

    .info-card {
      padding: 3px;
      margin: 0px 18px;
      background-color: @@bgColor;
      border: @@timeline solid 1px;
      color: @@content;
      &.isnew {
        margin-bottom: 10px;
        cursor: pointer;
        text-align: center;
      }
      &.online-speak {
        /deep/ .el-card__body {
          padding: 0;
          // 升级内容样式
          .new-info-area {
            cursor: pointer;
            height: 100%;
            display: flex;
            flex-direction: beww;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            justify-content: space-evenly;
            img {
              width: 100px;
            }
          }
          // 今日信息内容样式
          .day-info {
            .day-info-title {
            }
            .day-info-content {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              height: 100px;
              margin-right: 30px;
              .day-info-content-top {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                .day-info-content-top-card-area {
                  font-size: 12px;
                }
                .sane-area {
                  cursor: pointer;
                  display: flex;
                  justify-content: right;
                  align-items: flex-end;
                  flex-direction: column;
                  .sane {
                    font-size: 16px;
                    font-family: Geometos, "Sans-Regular",
                      "SourceHanSansCN-Regular", YaHei;
                    .sane-number {
                      font-size: 28px;
                    }
                  }
                  .sane-info {
                  }
                }
              }
              .day-info-content-bottom {
                margin-top: 5px;
                width: 100%;
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                & .day-info-content-bottom-card-area {
                  display: flex;
                  align-items: center;
                  justify-content: space-around;
                  .day-info-content-bottom-card {
                    height: 40px;
                    width: 70px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    img {
                      height: 100%;
                    }
                    &.notToday {
                      filter: opacity(0.2);
                    }
                  }
                }
              }
            }
          }
        }
      }
      /deep/ .el-carousel__button {
        background-color: #23ade5;
      }
    }
    // 更改卡片阴影
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
  }

  // 隐藏二级菜单
  /deep/ .el-drawer {
    background-color: @@bgColor;

    .el-divider {
      background-color: @@btnBorder;
    }
    .el-divider__text {
      background-color: @@bgColor;
      color: @@setLarge;
    }
    .el-button {
      background-color: @@bgColor;
      border: @@btnBorder 1px solid;

      .radius {
        background-color: #fff;
      }
    }
    // 单独对刷新设置设颜色
    .el-button--primary {
      background-color: @@btnBg;
      border: @@setBtnBorder 1px solid;
    }
    .el-button:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: @@hover;
    }
    .sign {
      position: absolute;
      bottom: 10px;
      width: 100%;
      text-align: center;
      color: @@setLarge;
    }

    .mention,
    .el-form-item__label,
    .el-button--mini {
      color: @@setLarge;
    }
    .el-input-number__increase,
    .el-input-number__decrease {
      background-color: @@numberInput;
      color: @@setSmall;
    }
    .el-input-number__increase {
      border-left: @@btnBorder 1px solid;
    }
    .el-input-number__decrease {
      border-right: @@btnBorder 1px solid;
    }
    .el-input-number__increase:hover + .el-input > .el-input__inner,
    .el-input-number__decrease:hover
      + .el-input-number__increase
      + .el-input
      > .el-input__inner {
      border: #409eff 1px solid;
    }
    .el-input__inner {
      background-color: @@bgColor;
      color: @@setLarge;
      border: @@btnBorder 1px solid;
    }
    .el-input__inner:focus {
      border-color: #409eff;
    }
  }
  // @media screen and (max-width: 699px) {
  //   #app {
  //     height: 1500px;
  //   }
  //   .el-timeline {
  //     height: 1500px;
  //   }
  // }
}

.dark {
  .styleChange(dark);
}

.light {
  .styleChange(light);
}
</style>

<style  lang="less">
body {
  margin: 0;
}
.el-timeline,
.drawer-btn-area-quickJump {
  scrollbar-width: none;
}
::-webkit-scrollbar {
  width: 0 !important;
}
::-webkit-scrollbar {
  width: 0 !important;
  height: 0;
}
.online-area {
  display: flex;
  align-items: center;
  margin-right: 30px;
  .online-title-img {
    height: 100px;
    margin-right: 10px;
    &.radius {
      border-radius: 4px;
    }
  }
}
.online-pointer {
  cursor: pointer;
}
.online-blue {
  color: #23ade5;
}
.online-red {
  color: #f56c6c;
}
.online-yellow {
  color: #e6a23c;
}
.online-green {
  color: #67c23a;
}
.online-gray {
  color: #909399;
}
</style>