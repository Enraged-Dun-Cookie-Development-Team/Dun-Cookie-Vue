<template>
  <div :class="settings.getColorTheme()">
    <!-- <div id="app" :style="'height:' + allHeight + 'px'"> -->
    <div id="app">
      <!-- 理智计算 -->
      <el-drawer
        :visible.sync="toolDrawer" :show-close="false"
        direction="ttb" size="180px"
      >
        <el-divider content-position="left">
          理智计算提醒
        </el-divider>
        <el-form
          size="mini" class="sane-calculator" label-position="right"
          :inline="true" label-width="150px"
          style="text-align: center"
        >
          <el-form-item label="当前理智">
            <el-input-number
              ref="saneEdit" v-model="currentSan"
              :min="0" :max="settings.san.maxValue" label="输入当前理智"
            />
          </el-form-item>
          <el-form-item label="理智满后是否推送">
            <el-switch
              v-model="settings.san.noticeWhenFull" class="san-push"
              @change="settings.saveSettings()"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="saveSan">
              开始计算
            </el-button>
          </el-form-item>
        </el-form>
        <div
          class="mention" style=" margin-top: 16px;text-align: center;

        opacity: 0.4"
        >
        </div>
      </el-drawer>
      <!-- 菜单 -->
      <el-drawer
        :visible.sync="drawer" :show-close="false" :direction="settings.display.windowMode ? 'rtl' : 'ttb'"
        size="520px" @close="menuIconClick" @open="menuIconClick"
      >
        <el-divider content-position="left">
          饼的发源地
        </el-divider>
        <el-row
          type="flex" class="drawer-btn-area"
          justify="center"
        >
          <el-tooltip
            v-for="item in quickJump.source" :key="item.img"
            :content="item.name" placement="top"
          >
            <el-button size="small" @click="openUrl(item.url)">
              <img
                class="btn-icon" :class="item.radius ? 'radius' : ''"
                :src="item.img"
              />
            </el-button>
          </el-tooltip>
        </el-row>
        <el-divider content-position="left">
          快捷工具
        </el-divider>
        <el-row
          type="flex" justify="center"
          class="drawer-btn-area"
        >
          <el-tooltip
            v-for="item in quickJump.tool" :key="item.img"
            :content="item.name" placement="top"
          >
            <el-button size="small" @click="openUrl(item.url)">
              <img
                class="btn-icon" :class="item.radius ? 'radius' : ''"
                :src="item.img"
              />
            </el-button>
          </el-tooltip>
        </el-row>
        <el-divider v-if="quickJump.url" content-position="left">
          快捷链接
        </el-divider>
        <div ref="drawerBtnAreaQuickJump" class="drawer-btn-area-quickJump">
          <el-tooltip
            v-for="(item, index) in quickJump.url" :key="index"
            :content="item.title" placement="top"
          >
            <div class="quickJump-img-area" style="vertical-align: middle;display: table-cell;">
              <img
                v-if="LazyLoaded" v-lazy="item.cover_img" class="btn-icon radius"
                @click="openUrl(item.video_link)"
              />
              <div class="author">
                <p>{{ item.author }}</p>
              </div>
            </div>
          </el-tooltip>
        </div>
        <el-divider content-position="left">
          调整蹲饼器
        </el-divider>
        <el-row
          class="menu-button-area" type="flex"
          justify="center"
        >
          <el-button
            type="primary" icon="el-icon-star-off"
            @click="openGithub"
          >
            点个star
          </el-button>
          <el-button
            type="primary" :loading="isReload"
            icon="el-icon-refresh" @click="reload"
          >
            刷新
          </el-button>
          <el-button
            v-if="settings.feature.options" type="primary"
            icon="el-icon-setting" @click="openSetting"
          >
            设置
          </el-button>
          <el-button
            type="primary" icon="el-icon-upload2"
            @click="drawer = false"
          >
            收起
          </el-button>
        </el-row>
        <div style="position: absolute; right: 10px; bottom: 10px" class="sign">
          Powered By 蓝芷怡 & 洛梧藤 & 云闪
        </div>
      </el-drawer>
      <!-- 置顶按钮 -->
      <el-button
        icon="el-icon-top" type="primary" circle
        class="top-btn"
        :class="!drawer && scrollShow ? 'top-btn-show' : ''" @click.stop="goTop()"
      />
      <div class="title-area">
        <div class="version">
          {{ `小刻食堂 V${currentVersion}` }}
          <span>
            <span>【已蹲饼
              <countTo
                :start-val="oldDunCount" :end-val="dunInfo.counter"
                :duration="1000"
              />次】
            </span>
            <span v-if="settings.checkLowFrequency()"> 【低频蹲饼时段】 </span>
          </span>
        </div>
        <!--        <span @click.stop="drawer = !drawer;"-->
        <!--              :class="[drawer?'menu-btn-open':'menu-btn-close', firefox ? 'menu-btn-firefox' : '','menu-btn','el-icon-menu']"></span>-->
        <div class="countdown-and-btn">
          <div
            v-show="countDownList.length > 0" class="count-down-area"
            @click="openCountDown()"
          >
            <div
              v-for="(item, index) in countDownList" :key="index"
              :title="'到点时间：' + item.stopTime"
            >
              {{ item.name }}:剩余约{{ item.timeStr }}
            </div>
            <div>【本数据仅会在打开列表时刷新】</div>
          </div>
          <Menu-Icon
            :class="[
              drawer ? 'menu-btn-open' : 'menu-btn-close',
              firefox ? 'menu-btn-firefox' : '',
              'menu-btn',
            ]" @handleIconClick="handleIconClick()"
          />
        </div>
      </div>
      <div id="content">
        <time-line
          ref="timeline" :img-show="LazyLoaded"
          :card-list-by-tag="cardList" @cardListChange="goTop(1, 0)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";
import TimeLine from "../components/timeline/TimeLine";
import Settings from "../common/Settings";
import TimeUtil from "../common/util/TimeUtil";
import SanInfo from "../common/sync/SanInfo";
import DunInfo from "../common/sync/DunInfo";
import MenuIcon from "@/popup/MenuIcon";
import {
    dayInfo,
    MESSAGE_FORCE_REFRESH,
    MESSAGE_GET_COUNTDOWN,
    PAGE_DONATE,
    PAGE_GITHUB_REPO,
    PAGE_OPTIONS,
    PAGE_TIME,
    PAGE_UPDATE,
    PLATFORM_FIREFOX,
    quickJump,
    SHOW_VERSION,
} from "../common/Constants";
import PlatformHelper from "../common/platform/PlatformHelper";
import "animate.css";
import CardList from "../common/sync/CardList";
import ServerUtil from "../common/util/ServerUtil";

export default {
    name: "App",
    components: { countTo, TimeLine, MenuIcon },
    data() {
        return {
            san: SanInfo,
            currentSan: SanInfo.currentSan,
            show: false,
            LazyLoaded: false,
            isNew: false,
            cardList: CardList,
            currentVersion: SHOW_VERSION,
            onlineSpeakList: [],
            oldDunCount: 0,
            dunInfo: DunInfo,
            settings: Settings,
            drawer: false, // 打开菜单
            drawerFirst: false, // 这次打开窗口是否打开过二级菜单
            toolDrawer: false, // 理智计算器菜单
            isReload: false, // 是否正在刷新
            quickJump: quickJump,
            dayInfo: dayInfo,
            loading: true, // 初始化加载
            onlineDayInfo: {},
            scrollShow: false,
            firefox: false,
            countDownList: [],
            // allHeight: 0,
        };
    },
    computed: {},
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
    created() { },
    mounted() {
        this.init();
        // 监听鼠标滚动事件
        window.addEventListener("scroll", this.handleScroll, true);
    },
    beforeDestroy() { },
    methods: {
        openUrl: PlatformHelper.Tabs.create,
        init() {
            // this.menuIconInit();
            DunInfo.doAfterUpdate((data) => {
                this.oldDunCount = data.counter;
            });
            CardList.doAfterUpdate((data) => {
                this.cardList = JSON.parse(JSON.stringify(data));
            });
            setTimeout(() => {
                // 计算高度
                // this.calcHeight();
                let head = navigator.userAgent;
                if (head.indexOf("Firefox") > 1) {
                    let div = document.getElementById("app");
                    div.style.fontFamily = "Microsoft yahei";
                    this.firefox = true;
                }
                // 图片卡 先加载dom后加载图片内容
                this.LazyLoaded = true;
                this.listenerWindowSize();
                this.getCountDownList();
            }, 1);
        },
        handleIconClick() {
            if (!this.drawer && !this.drawerFirst) {
                this.getVideoJump();
                this.drawerFirst = true;
            }

            this.drawer = !this.drawer;
        },
        // 获取快速跳转视频信息
        getVideoJump() {
            ServerUtil.getVideoInfo().then((data) => {
                // 快捷连接
                let btnList = data.filter(
                    (x) =>
                        new Date(x.start_time) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.over_time) >= TimeUtil.changeToCCT(new Date())
                );
                if (btnList.length > 0) {
                    this.quickJump.url.push(...btnList);
                }
            });
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
        async firefoxWarning() {
            const flagKey = "firefox-collapse-warning-flag";
            const flagDisableValue = "disabled";
            const flag = await PlatformHelper.Storage.getLocalStorage(flagKey);
            if (flag === flagDisableValue) {
                return;
            }
            const warningCountKey = "firefox-collapse-warning";
            const tip =
        '窗口太小,可能显示出现问题，您可以通过以下任意一种办法解决该问题：<br/>1.右键扩展图标并点击"移出折叠菜单"<br/>2.进入小刻食堂设置页面-界面设置-列表窗口化-启用';
            let count = parseInt(
                String(await PlatformHelper.Storage.getLocalStorage(warningCountKey))
            );
            if (!count) {
                count = 0;
            }
            count++;
            PlatformHelper.Storage.saveLocalStorage(warningCountKey, count).then();
            if (count < 3) {
                this.$alert(tip, "提示", {
                    dangerouslyUseHTMLString: true,
                }).then();
            } else {
                this.$alert(
                    tip +
          '<br/><span id="firefox-collapse-warning-tip" style="color: red">点击<button id="btn-disable-firefox-warning">此处</button>以后都不再提示</span>',
                    "提示",
                    {
                        dangerouslyUseHTMLString: true,
                    }
                ).then();
                setTimeout(() => {
                    document
                        .getElementById("btn-disable-firefox-warning")
                        .addEventListener("click", () => {
                            PlatformHelper.Storage.saveLocalStorage(
                                flagKey,
                                flagDisableValue
                            ).then(() => {
                                document.getElementById(
                                    "firefox-collapse-warning-tip"
                                ).innerHTML = "以后将不会再提示该信息";
                            });
                        });
                }, 10);
            }
        },
        listenerWindowSize() {
            if (!PlatformHelper.isMobile) {
                // 只在从大窗口缩小的时候提示(第一次除外)
                let fromLarge = true;
                window.onresize = () => {
                    if (fromLarge && window.innerWidth <= 699) {
                        if (
                            PlatformHelper.PlatformType === PLATFORM_FIREFOX &&
              (window.innerWidth === 425 || window.innerWidth === 348)
                        ) {
                            // 425和348两个魔法值来源于：https://discourse.mozilla.org/t/can-add-ons-webextensions-popups-determinate-whether-they-are-shown-in-the-overflow-menu-or-not/27937/6
                            this.firefoxWarning();
                        } else {
                            alert("窗口太小,可能显示出现问题");
                        }
                    }
                    fromLarge = window.innerWidth > 699;
                };
            }
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
        // 获取倒计时数据
        getCountDownList() {
            PlatformHelper.Message.send(MESSAGE_GET_COUNTDOWN).then((data) => {
                this.countDownList = data.sort((x, y) =>
                    new Date(x.stopTime) > new Date(y.stopTime) ? 1 : -1
                );
                console.log(this.countDownList);
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
            this.$message({
                offset: 50,
                center: true,
                message: "正在找饼，请保持网络畅通",
                type: "warning",
            });
            PlatformHelper.Message.send(MESSAGE_FORCE_REFRESH).then(() => {
                this.drawer = false;
                this.isReload = false;
            });
        },

        // 检测滚动条高度，大于600出现回顶部按钮
        handleScroll() {
            let scrollArea =
        this.$refs.timeline.$el.scrollTop == 0
            ? this.$refs.timeline.$refs.elTimelineArea.$el
            : this.$refs.timeline.$el;
            this.scrollShow = scrollArea.scrollTop > 600 ? true : false;
        },

        // 回顶部
        goTop(step = 10, interval = 10) {
            let scrollArea =
        this.$refs.timeline.$el.scrollTop == 0
            ? this.$refs.timeline.$refs.elTimelineArea.$el
            : this.$refs.timeline.$el;
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

        openCountDown() {
            PlatformHelper.Tabs.createWithExtensionFile(PAGE_TIME);
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
  @ceobeLightColor: "ceobeLightColor-@{theme}"; //小刻食堂主题亮色浅色
  @ceobeColor: "ceobeColor-@{theme}"; //小刻食堂主题亮色
  @ceobeVeryLightColor: "ceobeVeryLightColor-@{theme}"; // 小刻食堂主题亮色非常浅色
  @ceobeDarkColor: "ceobeDarkColor-@{theme}"; //小刻食堂主题暗色
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

  .sane-calculator {
    .san-push.is-checked {
      /deep/ .el-switch__core {
        border-color: @@ceobeColor;
        background-color: @@ceobeColor;
      }
    }
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
    align-items: flex-start;
    font-size: 1rem;
    color: @@ceobeColor;
    user-select: none;
    background: @@ceobeDarkColor;

    .version {
      text-align: left;
    }

    .countdown-and-btn {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .menu-btn {
        margin-top: 5px;
      }

      .count-down-area {
        cursor: pointer;
        margin-right: 10px;
        text-align: right;
        height: 40px;
        overflow: hidden;
        padding: 0 10px 0 0;
        border-radius: 3px;
        transition: all 0.5s;

        &:hover {
          background: @@bgColor;
          height: auto;
          box-shadow: 0 0 20px 0px;
        }
      }
    }
  }

  .top-btn {
    position: fixed;
    bottom: 30px;
    z-index: 9999;
    opacity: 1;
    right: -40px;
    transition: 0.3s all;
    background-color: @@ceobeColor;
    border-color: @@ceobeColor;

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
      position: relative;

      // display: flex;
      // flex-wrap: wrap;
      // align-items: center;
      &:hover {
        img {
          filter: blur(30px) brightness(0.1);
        }

        .author {
          & p {
            opacity: 1;
          }
        }
      }

      img {
        height: 100px;
      }

      .author {
        position: absolute;
        width: 100%;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;

        & p {
          opacity: 0;
          font-size: 20px;
          color: #fff;
        }
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
        color: @@ceobeColor;
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
      background-color: @@ceobeColor;
      border: @@ceobeColor 1px solid;
    }

    .el-button:hover {
      color: @@ceobeColor;
      border-color: @@ceobeLightColor;
      background-color: @@ceobeVeryLightColor;
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

    .el-input-number__increase:hover+.el-input>.el-input__inner,
    .el-input-number__decrease:hover+.el-input-number__increase+.el-input>.el-input__inner {
      border: @@ceobeColor 1px solid;
    }

    .el-input__inner {
      background-color: @@bgColor;
      color: @@setLarge;
      border: @@btnBorder 1px solid;
    }

    .el-input__inner:focus {
      border-color: @@ceobeColor;
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
@media (max-width: 699px) {
  .online-area {
    align-items: flex-start !important;
    font-size: small;
  }

  .online-title-img,
  .sane-area,
  .day-info-content-bottom {
    display: none !important;
  }

  .el-loading-spinner {
    top: 0 !important;
    margin-top: 0 !important;
  }

  .el-timeline {
    padding-left: 20px !important;
    padding-right: 10px !important;
  }

  .el-timeline-item__timestamp {
    margin-left: 13px !important;
  }

  .el-timeline-item__wrapper {
    padding-left: 14px !important;
  }

  .el-divider--horizontal {
    display: flex !important;
    justify-content: center !important;

    .el-divider__text.is-left {
      left: unset !important;
    }
  }

  .el-drawer {
    width: 100% !important;
  }

  .drawer-btn-area {
    flex-wrap: wrap;

    .el-button {
      margin: 3px !important;
    }
  }

  .menu-button-area {
    flex-wrap: wrap;

    .el-button {
      width: 40% !important;
      margin: 3px !important;
    }
  }

  .el-message-box {
    width: 100% !important;
  }
}

@media (max-width: 525px) {
  .online-area {
    font-size: x-small;
  }
}

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

  p {
    margin: 0px;
  }

  // 菜单按钮
  drawer {
    color: #dd558a;
  }

  // 设置按钮
  setting {
    color: #dd55c4;
  }

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

.online-orange {
  color: #ffba4b;
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
