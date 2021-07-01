<template>
  <div :class="settings.getColorTheme()">
    <!-- <div id="app" :style="'height:' + allHeight + 'px'"> -->
    <div id="app">
      <el-drawer
        :visible.sync="drawer"
        :show-close="false"
        :direction="settings.display.windowMode?'rtl':'ttb'"
        size="520px"
      >
        <el-divider content-position="left">饼的发源地</el-divider>
        <el-row type="flex" class="drawer-btn-area" justify="center">
          <el-tooltip
            :key="item.img"
            v-for="item in quickJump.source"
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
            v-if="settings.feature.options"
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
          Power By 蓝芷怡 & lwt & 云闪
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
        {{ `小刻食堂 V${currentVersion}` }}
        <span>
          <span
            >【已蹲饼
            <countTo
              :startVal="oldDunCount"
              :endVal="dunInfo.counter"
              :duration="1000"
            ></countTo
            >次】</span
          >
          <span v-if="settings.checkLowFrequency()"> 【低频蹲饼时段】 </span>
        </span>
      </div>
      <div id="content">
        <time-line
          :imgShow="LazyLoaded"
          :cardListByTag="cardList"
        >
        </time-line>
      </div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";
import TimeLine from "../components/timeline/TimeLine";
import Settings from '../common/Settings';
import BrowserUtil from '../common/util/BrowserUtil';
import DunInfo from '../common/sync/DunInfo';
import {
  dayInfo,
  MESSAGE_CARD_LIST_GET,
  MESSAGE_CARD_LIST_UPDATE,
  MESSAGE_DUN_INFO_UPDATE,
  MESSAGE_FORCE_REFRESH,
  PAGE_DONATE,
  PAGE_GITHUB_REPO,
  PAGE_OPTIONS,
  PAGE_UPDATE,
  quickJump,
  SHOW_VERSION
} from '../common/Constants';

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
          this.bindScrollFun();
        });
      } else {
        this.unbindScrollFun();
      }
    },
  },
  data() {
    return {
      show: false,
      LazyLoaded: false,
      isNew: false,
      cardList: {},
      currentVersion: SHOW_VERSION,
      onlineSpeakList: [],
      oldDunCount: 0,
      dunInfo: DunInfo,
      settings: Settings,
      drawer: false, // 打开菜单
      toolDrawer: false, // 理智计算器菜单
      isReload: false, // 是否正在刷新
      quickJump: quickJump,
      dayInfo: dayInfo,
      loading: true, // 初始化加载
      onlineDayInfo: {},
      // allHeight: 0,
    };
  },
  computed: {},
  beforeDestroy() {},
  methods: {
    openUrl: BrowserUtil.createTab,
    init() {
      BrowserUtil.addMessageListener('popup', MESSAGE_DUN_INFO_UPDATE, data => {
        this.oldDunCount = data.counter;
      });
      setTimeout(() => {
        // 计算高度
        // this.calcHeight();
        this.getCardList();
        // 图片卡 先加载dom后加载图片内容
        this.LazyLoaded = true;
      }, 1);
    },
    scrollHandler() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      scrollDiv.scrollLeft = scrollDiv.scrollLeft + event.deltaY;
    },
    bindScrollFun() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      // 添加监听事件（不同浏览器，事件方法不一样，所以可以作判断，也可以如下偷懒）
      // scrollDiv.addEventListener("DOMMouseScroll", handler, false);
      scrollDiv.addEventListener("wheel", this.scrollHandler, false);
    },
    unbindScrollFun() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      scrollDiv.removeEventListener("wheel", this.scrollHandler);
    },
    // 获取数据
    getCardList() {
      BrowserUtil.addMessageListener('popup', MESSAGE_CARD_LIST_UPDATE, (data) => this.cardList = data);
      BrowserUtil.sendMessage(MESSAGE_CARD_LIST_GET).then((data) => {
        this.cardList = data;
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
      BrowserUtil.sendMessage(MESSAGE_FORCE_REFRESH);
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

    openSetting() {
      BrowserUtil.createExtensionTab(PAGE_OPTIONS);
    },

    openDonate() {
      BrowserUtil.createExtensionTab(PAGE_DONATE);
    },

    openUpdate() {
      BrowserUtil.createExtensionTab(PAGE_UPDATE);
    },

    openGithub() {
      BrowserUtil.createTab(PAGE_GITHUB_REPO);
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
    // 展示注释
    // &::after {
    //   content: " ";
    //   position: fixed;
    //   height: 100px;
    //   right: 0;
    //   width: 20px;
    //   background: linear-gradient(90deg, transparent, @@bgColor 50%);
    // }
    // &::before {
    //   content: " ";
    //   position: fixed;
    //   height: 100px;
    //   left: 0;
    //   width: 20px;
    //   background: linear-gradient(90deg, @@bgColor 50%, transparent);
    // }
  }

  // 标签栏
  /deep/ .el-tabs {
    height: 30px;
    margin: 0 10px;
    .el-tabs__nav-prev,
    .el-tabs__nav-next {
      line-height: 30px;
      font-size: 18px;
    }
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
