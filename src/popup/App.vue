<template>
  <div :class="settings.getColorTheme()">
    <!-- <div id="app" :style="'height:' + allHeight + 'px'"> -->
    <div id="app">
      <!-- 理智计算 -->
      <el-drawer
          :visible.sync="toolDrawer"
          :show-close="false"
          direction="ttb"
          size="180px"
      >
        <el-divider content-position="left">理智计算提醒</el-divider>
        <el-form
            size="mini"
            class="sane-calculator"
            label-position="right"
            :inline="true"
            label-width="150px"
            style="text-align: center"
        >
          <el-form-item label="当前理智"
          >
            <el-input-number
                ref="saneEdit"
                v-model="currentSan"
                :min="0"
                :max="settings.san.maxValue"
                label="输入当前理智"
            ></el-input-number
            >
          </el-form-item>
          <el-form-item label="理智满后是否推送">
            <el-switch
                v-model="settings.san.noticeWhenFull"
                @change='settings.saveSettings()'
            ></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button @click="saveSan">开始计算</el-button>
          </el-form-item>
        </el-form>
        <div
            class="mention"
            style="text-align: center; margin-top: 16px; opacity: 0.4"
        ></div>
      </el-drawer>
      <!-- 菜单 -->
      <el-drawer
          :visible.sync="drawer"
          @close="menuIconClick"
          @open="menuIconClick"
          :show-close="false"
          :direction="settings.display.windowMode ? 'rtl' : 'ttb'"
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
        >快捷链接
        </el-divider
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
          >点个star
          </el-button
          >
          <el-button
              type="primary"
              :loading="isReload"
              @click="reload"
              icon="el-icon-refresh"
          >刷新
          </el-button
          >
          <el-button
              type="primary"
              icon="el-icon-setting"
              @click="openSetting"
              v-if="settings.feature.options"
          >设置
          </el-button
          >
          <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="drawer = false"
          >收起
          </el-button
          >
        </el-row>
        <div style="position: absolute; bottom: 10px; right: 10px" class="sign">
          Power By 蓝芷怡 & 洛梧藤 & 云闪
        </div>
      </el-drawer>
      <!-- 置顶按钮 -->
      <el-button
          icon="el-icon-top"
          type="primary"
          circle
          class="top-btn"
          :class="(!drawer && scrollShow)?'top-btn-show':''"
          @click.stop="goTop()"
      ></el-button>
      <div class="title-area">
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
        <!--        <span @click.stop="drawer = !drawer;"-->
        <!--              :class="[drawer?'menu-btn-open':'menu-btn-close', firefox ? 'menu-btn-firefox' : '','menu-btn','el-icon-menu']"></span>-->

        <Menu-Icon @handleIconClick="handleIconClick()"
          :class="[
            drawer ? 'menu-btn-open' : 'menu-btn-close',
            firefox ? 'menu-btn-firefox' : '',
            'menu-btn',
          ]"></Menu-Icon>
      </div>
      <div id="content">
        <time-line
            ref="timeline"
            :imgShow="LazyLoaded"
            :cardListByTag="cardList"
            @cardListChange="goTop(1, 0)"
        >
        </time-line>
      </div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";
import TimeLine from "../components/timeline/TimeLine";
import Settings from "../common/Settings";
import SanInfo from "../common/sync/SanInfo";
import DunInfo from "../common/sync/DunInfo";
import MenuIcon from "@/popup/MenuIcon";
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
  SHOW_VERSION,
} from "../common/Constants";
import PlatformHelper from "../common/platform/PlatformHelper";
import janvas from "../common/util/janvas.min.js";

export default {
  name: "app",
  components: {countTo, TimeLine, MenuIcon},
  created() {
  },
  mounted() {
    this.init();
    // 监听鼠标滚动事件
    window.addEventListener("scroll", this.handleScroll, true);
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
      san: SanInfo,
      currentSan: SanInfo.currentSan,
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
      scrollShow: false,
      firefox: false
      // allHeight: 0,
    };
  },
  computed: {},
  beforeDestroy() {
  },
  methods: {
    openUrl: PlatformHelper.Tabs.create,
    init() {
      // this.menuIconInit();
      PlatformHelper.Message.registerListener(
          "popup",
          MESSAGE_DUN_INFO_UPDATE,
          (data) => {
            this.oldDunCount = data.counter;
          }
      );
      setTimeout(() => {
        // 计算高度
        // this.calcHeight();
        let head = navigator.userAgent;
        if (head.indexOf("Firefox") > 1) {
          let div = document.getElementById("app");
          div.style.fontFamily = "Microsoft yahei";
          this.firefox = true;
        }
        this.getCardList();
        // 图片卡 先加载dom后加载图片内容
        this.LazyLoaded = true;
        this.listenerWindowSize();
      }, 1);
    },
    handleIconClick() {
      this.drawer = !this.drawer;
    },
    // 初始化菜单图标
    menuIconInit() {
      // this.janvas = new janvas.Canvas({
      //   container: "#menu-btn", // #容器 id 或者是容器引用
      //   props: {
      //     color: "#23ade5", // 颜色采用 HEX 格式，起始颜色，也即最开始展示的颜色
      //     backgroundColor: "#ffffff" // 中止颜色，也即背景颜色
      //   },
      //   methods: {
      //     init: function () { // 控件第一次初始化时调用，仅调用一次
      //       var ctx = this.$ctx, // 绘图上下文 ctx
      //           w = this.$width, h = this.$height, // 控件的宽与高
      //           ox = w / 2, oy = h / 2; // 控件 origin 中心点
      //       var center = new janvas.Point(ox, oy), // 持有中心点的 Point 对象
      //           start = new janvas.Point(ox, 0), // 为了计算矩形起始坐标的 Point 对象
      //           end = new janvas.Point(w, oy); // 为了计算矩形宽度的 Point 对象
      //       end.inline(start, 0.5 + 0.191 / 2); // 计算矩形处于终点处的右上角坐标
      //       var size = Math.floor(end.distance(start)); // 矩形大小，即宽高
      //       start.subtract(center).rotate(-Math.PI / 4).add(center); // 计算矩形起始点
      //       var rect = this.rect = new janvas.Rect(ctx, // 初始化矩形对象
      //           Math.ceil(start.x), Math.ceil(start.y), size, size, ox, oy);
      //       rect.getStyle().setFillStyle(this.color); // 设置颜色
      //       size = w - rect.getStartX() * 2; // 此为计算边界矩形大小
      //       var border = this.border = new janvas.Rect(ctx, // 边界矩形大小，为了避免多余像素
      //           rect.getStartX() + 1, rect.getStartY() + 1, size - 2, size - 2, ox, oy);
      //       border.getStyle().setFillStyle(this.backgroundColor);
      //       var sRgbStart = new janvas.Rgb().fromHexString(this.color).sRgbInverseCompanding(),
      //           sRgbEnd = new janvas.Rgb().fromHexString(this.backgroundColor).sRgbInverseCompanding(),
      //           rgb = new janvas.Rgb();
      //       this.rotate = new janvas.Animation(this.$raf, 500, 0, // 动画精灵对象
      //           function () {
      //             if (this.status) {
      //               this.angle = this.angleRange, this.angleRange = -Math.PI / 4;
      //               this.sRgbStart = sRgbEnd, this.sRgbEnd = sRgbStart;
      //             } else {
      //               this.angle = 0, this.angleRange = Math.PI / 4;
      //               this.sRgbStart = sRgbStart, this.sRgbEnd = sRgbEnd;
      //             }
      //           },
      //           function (ratio) {
      //             ratio = janvas.Utils.ease.out.cubic(ratio);
      //             rect.getMatrix().setAngle(this.angle + this.angleRange * ratio);
      //             border.getMatrix().setAngle(this.angle + this.angleRange * ratio);
      //             janvas.Rgb.sRgbMixing(this.sRgbStart, this.sRgbEnd, ratio, rgb);
      //             rect.getStyle().setFillStyle(rgb.sRgbCompanding().toRgbString());
      //             janvas.Rgb.sRgbMixing(this.sRgbStart, this.sRgbEnd, 1 - ratio, rgb);
      //             border.getStyle().setFillStyle(rgb.sRgbCompanding().toRgbString());
      //           },
      //           function (forward) {
      //             if (forward) this.status = !this.status;
      //           }
      //       );
      //     },
      //     update: function (timestamp, interval) { // 动画回调
      //       this.rotate.update(interval);
      //     },
      //     draw: function () { // 绘制逻辑部分
      //       this.$clear();
      //       this.border.fill(); // 背景矩形绘制
      //       var rect = this.rect;
      //       for (var i = 0; i < 4; i++) {
      //         rect.fill(); // 小矩形绘制，并依中心点旋转 90 度，从而绘制四个矩形
      //         rect.getMatrix().setAngle(rect.getMatrix().getAngle() + Math.PI / 2);
      //       }
      //     }
      //   },
      //   callbacks: {
      //     start: function () {
      //       if (this.rotate.isRunning()) this.rotate.reverse();
      //       else this.rotate.start();
      //     }
      //   }
      // });
    },
    menuIconClick() {
      // this.janvas.start();
    },
    listenerWindowSize() {
      window.onresize = (data) => {
        if (window.innerWidth <= 699) {
          alert("窗口太小,可能显示出现问题");
        }
      };
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
      PlatformHelper.Message.registerListener(
          "popup",
          MESSAGE_CARD_LIST_UPDATE,
          (data) => (this.cardList = data)
      );
      PlatformHelper.Message.send(MESSAGE_CARD_LIST_GET).then((data) => {
        this.cardList = data;
      });
    },
    // 设置数据
    saveSan() {
      this.san.currentSan = this.currentSan;
      this.san.saveUpdate();
      this.toolDrawer = false;
      this.$message({
        offset: 50,
        center: true,
        message: "保存成功，开始计算",
        type: "success",
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
      PlatformHelper.Message.send(MESSAGE_FORCE_REFRESH);
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

    // 检测滚动条高度，大于600出现回顶部按钮
    handleScroll() {
      let scrollArea = this.$refs.timeline.$refs.elTimelineArea.$el;
      this.scrollShow = scrollArea.scrollTop > 600 ? true : false;
    },

    // 回顶部
    goTop(step = 10, interval = 10) {
      let scrollArea = this.$refs.timeline.$refs.elTimelineArea.$el;
      let top = scrollArea.scrollTop;
      if (step < 1) {
        step = 1;
      }
      let changeTop = top / step;
      const timeTop = setInterval(() => {
        scrollArea.scrollTop = top -= changeTop;
        if (top <= 0) {
          clearInterval(timeTop);
        }
      }, interval);
    },

    openSetting() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_OPTIONS);
    },

    openDonate() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_DONATE);
    },

    openUpdate() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
    },

    openGithub() {
      PlatformHelper.Tabs.create(PAGE_GITHUB_REPO);
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
      color: @@content !important;
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
  .title-area {
    position: fixed;
    width: calc(100% - 32px);
    height: 40px;
    line-height: 40px;
    top: 0;
    z-index: 9999;
    display: flex;
    padding: 0 14px 0 18px;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
    color: #23ade5;
    user-select: none;
    background: @@bgColor;

    .version {
      text-align: left;
    }
  }

  .top-btn {
    position: fixed;
    bottom: 30px;
    z-index: 9999;
    opacity: 1;
    right: -40px;
    transition: 0.3s all;

    &.top-btn-show {
      right: 20px;
      opacity: 0.3;

      &:hover {
        opacity: 1;
      }
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
}

.dark {
  .styleChange(dark);
  background: #22272e;
  height: 100vh;
}

.light {
  .styleChange(light);
}
</style>

<style lang="less">
body {
  margin: 0;
}

.el-timeline,
.drawer-btn-area-quickJump,
.content-card-episodes {
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
