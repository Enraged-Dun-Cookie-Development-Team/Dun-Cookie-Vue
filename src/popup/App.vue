<template>
  <div :class="setting.outsideClass">
    <!-- <div id="app" :style="'height:' + allHeight + 'px'"> -->
    <div id="app">
      <el-drawer
        :visible.sync="drawer"
        :show-close="false"
        direction="ttb"
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
          <el-button
            type="primary"
            icon="el-icon-setting"
            @click="openSetting"
            v-if="showOption"
            >设置</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-upload2"
            @click="drawer = false"
            >收起</el-button
          >
        </el-row>
        <div style="position: absolute; bottom: 10px; right: 10px" class="sign">
          Power By 蓝芷怡 & lwt
        </div>
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
  created() {},
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
      sanShow: true,
      cardlist: [],
      cardlistdm: {},
      saveInfo: common.saveInfo,
      oldDunIndex: 0,
      dunInfo: common.dunInfo,
      setting: common.setting,
      showOption: true, //火狐浏览器不能进入设置
      drawer: false, // 打开菜单

      isReload: false, // 是否正在刷新
      quickJump: common.quickJump,
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
        this.getSane();
        // 图片卡 先加载dom后加载图片内容
        this.LazyLoaded = true;
        this.setClickFun();
      }, 1);
    },
    // 监听标签
    setClickFun() {
      document
        .querySelectorAll(".online-speak")[0]
        .addEventListener("click", () => {
          var target = event.target || event.srcElement;
          // 是否为a标签
          if (target.nodeName.toLocaleLowerCase() === "a") {
            // 对捕获到的 a 标签进行处理，需要先禁止它的跳转行为
            if (event.preventDefault) {
              event.preventDefault();
            } else {
              window.event.returnValue = true;
            }
            var url = target.getAttribute("href");
            this.openUrl(url);
          }

          if (target.nodeName.toLocaleLowerCase() === "drawer") {
            this.drawer = !this.drawer;
          }

          if (target.nodeName.toLocaleLowerCase() === "setting") {
            this.openSetting();
          }
        });
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
    unbindScroolFun() {},

    // 死数据
    getSaveInfo() {
      this.getLocalStorage("saveInfo").then((data) => {
        if (data != null) {
          this.saveInfo = data;
          this.showOption = this.saveInfo.webType != 1; // 如果是火狐内核浏览器，隐藏设置按钮
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
          if (this.saveInfo.webType == 1) {
            this.setting.sanShow = false; // 如果是火狐内核浏览器，隐藏理智规划
          }
          console.log(this.saveInfo.webType != 1);
          setInterval(() => {
            // 轮询在这里
            this.getCardlist();
            this.getDunInfo();
            this.getSane();
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
    width: 700px;
    height: 599px;
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
    z-index: 9999;
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
    display: flex;
    overflow-x: scroll;
    height: 100px;
    margin: 0 10px;
    .quickJump-img-area {
      flex-shrink: 0;
      max-width: 350px;
      margin-right: 10px;
      border-radius: 5px;
      overflow: hidden;
      border: 1px solid #dcdfe6;
      // display: flex;
      // flex-wrap: wrap;
      // align-items: center;
      .quickJump-img-area {
      }
      img {
        height: 100px;
      }
    }
    &::after {
      content: " ";
      position: fixed;
      height: 100px;
      right: 0;
      width: 20px;
      background: linear-gradient(90deg, transparent, @@bgColor 50%);
    }
    &::before {
      content: " ";
      position: fixed;
      height: 100px;
      left: 0;
      width: 20px;
      background: linear-gradient(90deg, @@bgColor 50%, transparent);
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
      min-height: 360px;
      .el-timeline {
        height: 360px;
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

  #content {
    margin-top: 40px;

    // 更改卡片阴影
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
  }

  // 隐藏二级菜单
  /deep/ .ttb {
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