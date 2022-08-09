<template>
  <div id="timeline-area" :class="settings.display.announcementScroll && timelineEnableScroll ? 'scrollTimeline' : ''" ref="totalScrollArea">
    <Search ref="SearchModel" :searchShow="searchShow" @searchTextChange="changeFilterText"></Search>
    <el-card shadow="never" class="info-card online-speak" :class="searchShow ? 'searching' : ''" v-loading="loading"
      element-loading-text="【如果你看到这条信息超过1分钟，去*龙门粗口*看看网络有没有*龙门粗口*正常连接】">
      <div @wheel="gowheel" @mouseover="mouseOverAnnouncement" @mouseleave="mouseLeaveAnnouncement">
        <el-carousel ref="swiper" arrow="never" height="100px" direction="vertical" :interval="3000" :autoplay="true">
          <el-carousel-item v-if="isNew">
            <div class="new-info-area" @click="openUpdate">
              <img src="/assets/image/update.png" />
              博士，检测到了新版本，点击这里进入更新页面
            </div>
          </el-carousel-item>
          <el-carousel-item>
            <div class="day-info">
              <div class="day-info-content">
                <div class="day-info-content-top">
                  <div>
                    <div class="day-info-content-top-card-area" :key="index"
                      v-for="(item, index) in onlineDayInfo.countdown">
                      <div>
                        距离
                        <el-tooltip v-if="item.remark" :content="item.remark" placement="right">
                          <span class="online-blue">{{ item.text }}</span>
                        </el-tooltip>
                        <span v-else class="online-blue">{{ item.text }}</span>
                        <span title="国服 UTC-8">{{
                            " " + calcActivityDiff(item.time)
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="settings.feature.san && imgShow" class="sane-area" @click.stop="openToolDrawer">
                    <div class="sane">
                      当前理智为<span class="online-blue sane-number">{{ san.currentSan }}</span>点
                    </div>
                    <div class="sane-info">
                      {{ san.remainTime }}
                    </div>
                  </div>
                </div>
                <div class="day-info-content-bottom">
                  <div class="day-info-content-bottom-card-area">
                    <el-tooltip class="item" effect="dark" placement="bottom" v-for="item in dayInfo" :key="item.type">
                      <div slot="content">
                        {{ `${item.name} - 开放日期： ${calcResourceOpenDay(item.day)}` }}
                      </div>
                      <div class="day-info-content-bottom-card" :class="item.notToday ? 'notToday' : ''">
                        <img v-if="imgShow" v-lazy="item.src" />
                      </div>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </el-carousel-item>
          <el-carousel-item v-for="(item, index) in onlineSpeakList" :key="index">
            <div v-html="item.html"></div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </el-card>
    <el-tabs v-if="settings.display.showByTag" v-model="currentTag" :stretch="true" @tab-click="selectListByTag">
      <el-tab-pane v-for="item of transformToSortList(cardListByTag)" :key="item.dataName" :label="item.dataName"
        :name="item.dataName">
        <span slot="label">
          <el-tooltip effect="dark" :content="getDataSourceByName(item.dataName).title" placement="top">
            <img class="title-img" :src="getDataSourceByName(item.dataName).icon" />
          </el-tooltip>
        </span>
      </el-tab-pane>
    </el-tabs>
    <div class="content-timeline-shadow"></div>
    <el-timeline ref="elTimelineArea" v-if="LazyLoaded" :class="[
      settings.display.windowMode ? 'window' : '',
      settings.display.showByTag ? 'tag' : '',
    ]">
      <MyElTimelineItem v-for="(item, index) in filterCardList" :key="index" :timestamp="item.timeForDisplay"
        placement="top" :icon-style="{
          '--icon': `url('${getDataSourceByName(item.dataSource).icon}')`,
        }" :icon="'headImg'">
        <span class="is-top-info" v-if="item.isTop">
          <span class="color-blue">【当前条目在{{
              getDataSourceByName(item.dataSource).title
          }}的时间线内为置顶状态】</span>
        </span>

        <span class="card-btn-area">
          <el-button class="to-copy-share" :class="{ 'special-source': item.componentData }" size="small"
            @click="copyData(item)" @contextmenu.prevent.native="rightCopyData(item)" title="左键生成图片分享，右键九宫格分享">
            <i class="el-icon-share"></i>
          </el-button>
          <el-button class="to-copy-btn" :class="{ 'special-source': item.componentData }" size="small"
            @click="copyTextData(item)" title="复制文字进剪切板">
            <i class="el-icon-document-copy"></i>
          </el-button>
          <el-button v-if="!item.componentData" class="to-url-btn" size="small" title="前往该条内容"
            @click="openUrl(item.jumpUrl)"><i class="el-icon-right"></i></el-button>
        </span>
        <el-card class="card" :class="[
          `font-size-${settings.display.fontSize}`,
          { 'special-source': item.componentData },
        ]" shadow="never">
          <component :is="resolveComponent(item)" :item="item" :show-image="imgShow"></component>
        </el-card>
      </MyElTimelineItem>
    </el-timeline>
    <div v-else style="height: 300px" v-loading="loading" element-loading-custom-class="page-loading"></div>
    <el-dialog :modal-append-to-body="false" title="图片自动复制出错，请于图片右键复制图片" :visible.sync="imageError" width="80%">
      <img :src="errorImageUrl" style="width: 100%" />
    </el-dialog>
    <select-image-to-copy ref="SelectImageToCopy" @copyData="copyData">
    </select-image-to-copy>
    <update-info-notice :updateInfo="updateInfo"></update-info-notice>
  </div>
</template>

<script>
import {
  CURRENT_VERSION,
  dayInfo,
  PAGE_UPDATE,
  quickJump,
} from "../../common/Constants";
import MyElTimelineItem from "./MyTimeLineItem";
import DefaultItem from "./items/DefaultItem";
import DataSourceUtil from "../../common/util/DataSourceUtil";
import Settings from "../../common/Settings";
import SanInfo from "../../common/sync/SanInfo";
import TimeUtil from "../../common/util/TimeUtil";
import Search from "../Search";
import {  deepAssign  } from "../../common/util/CommonFunctions";
import PlatformHelper from "../../common/platform/PlatformHelper";
import InsiderUtil from "../../common/util/InsiderUtil";
import ServerUtil from "../../common/util/ServerUtil";
import SelectImageToCopy from "@/components/SelectImageToCopy";
import UpdateInfoNotice from '../UpdateInfoNotice';

export default {
  name: "TimeLine",
  components: { MyElTimelineItem, Search, SelectImageToCopy, UpdateInfoNotice },
  props: ["cardListByTag", "imgShow"],
  data() {
    Settings.doAfterInit(
      (settings) => (this.currentTag = settings.display.defaultTag)
    );
    Settings.doAfterUpdate((settings, changed) => {
      if (changed.display && changed.display.defaultTag) {
        this.currentTag = settings.display.defaultTag;
      }
    });
    return {
      announcementAreaScroll: true,
      timelineEnableScroll: true,
      settings: Settings,
      san: SanInfo,
      searchShow: false,
      onlineDayInfo: {},
      updateInfo: {},
      onlineSpeakList: [],
      isNew: false,
      dayInfo: dayInfo,
      quickJump: quickJump,
      loading: true, // 初始化加载
      cardList: [],
      cardListAll: {},
      currentTag: Settings.display.defaultTag,
      filterText: "",
      filterCardList: [],
      LazyLoaded: false,
      insiderCodeMap: null, // 储存内部密码
      janvas: null, //菜单模块icon
      imageError: false,
      errorImageUrl: "",
      openResources: false,
    };
  },
  mounted() {
    this.getOnlineSpeak();
    this.setClickFun();
    this.listenKeyBord();
    setTimeout(() => {
      this.LazyLoaded = true;
    }, 233);
  },
  watch: {
    cardListByTag() {
      this.cardListAll = DataSourceUtil.mergeAllData(this.cardListByTag);
      this.selectListByTag(false);
    },
    cardList() {
      this.filterList();
    },
  },
  methods: {
    openWeb: PlatformHelper.Tabs.create,
    openUrl(url, w = 1024, h = window.screen.height - 100) {
      if (this.settings.feature.linkMax) {
        PlatformHelper.Windows.createMaxPopupWindow(url);
      } else {
        PlatformHelper.Windows.createPopupWindow(url, w, h);
      }
    },
    getDataSourceByName: DataSourceUtil.getByName,
    transformToSortList: DataSourceUtil.transformToSortList,

    resolveComponent(item) {
      if (!item.componentData) {
        return DefaultItem;
      }
      return this.getDataSourceByName(item.dataSource).dataType;
    },
    selectListByTag(emitEvent = true) {
      if (this.settings.display.showByTag) {
        this.cardList = this.cardListByTag[this.currentTag];
      } else {
        this.cardList = this.cardListAll;
      }
      if (emitEvent) {
        this.$emit("cardListChange");
      }
    },
    // 打开计算小工具
    openToolDrawer() {
      this.$parent.toolDrawer = true;
      this.$parent.currentSan = SanInfo.currentSan;
      this.$nextTick(() => {
        this.$parent.$refs.saneEdit.focus();
      });
    },
    // 今天有没有该资源可以刷
    resourcesNotToday() {
      let date = TimeUtil.changeToCCT(new Date());
      // 如果日期在里面
      let starTime = new Date(this.onlineDayInfo.resources.starTime);
      let overTime = new Date(this.onlineDayInfo.resources.overTime);
      if (date >= starTime && date <= overTime) {
        this.dayInfo.forEach((item) => {
          item.notToday = false;
        });
        this.openResources = true;
        return;
      }
      // 如果不在里面
      let week = date.getDay();
      // 判断4点更新
      week = date.getHours() >= 4 ? week : week - 1;
      week = week == -1 ? 6 : week;
      this.dayInfo.forEach((item) => {
        item.notToday = !item.day.includes(week);
      });
      this.openResources = false;
    },
    // 获取在线信息
    getOnlineSpeak() {
      ServerUtil.checkOnlineInfo(false).then((data) => {
        // 头部公告
        let filterList = data.list.filter(
          (x) =>
            new Date(x.starTime) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.overTime) >= TimeUtil.changeToCCT(new Date())
        );

        this.onlineSpeakList.push(...filterList);

        // 快捷连接
        let btnList = data.btnList.filter(
          (x) =>
            new Date(x.starTime) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.overTime) >= TimeUtil.changeToCCT(new Date())
        );
        if (btnList.length > 0) {
          this.quickJump.url.push(...btnList);
        }

        // 是否最新
        this.isNew = Settings.JudgmentVersion(data.upgrade.v, CURRENT_VERSION);

        // 资源获取
        this.onlineDayInfo = data.dayInfo;
        // 倒计时
        this.onlineDayInfo.countdown = this.onlineDayInfo.countdown.filter(
          (x) =>
            new Date(x.starTime) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.overTime) >= TimeUtil.changeToCCT(new Date())
        );

        // 插件更新信息
        this.updateInfo = data.upgrade;

        if (data.iconName) {
          PlatformHelper.Storage.saveLocalStorage("iconName", data.iconName);
        }

        // 内部密码
        this.insiderCodeMap = data.insider;
        this.resourcesNotToday();
        this.loading = false;
      });
    },
    calcActivityDiff(endDate) {
      let startDate = TimeUtil.changeToCCT(new Date());
      const diff = TimeUtil.calcDiff(endDate, startDate);
      if (diff) {
        return "剩" + diff;
      } else {
        return "已结束";
      }
    },
    // 计算资源关卡开启时间
    calcResourceOpenDay(days) {
      if (this.openResources) {
        return "活动期间，“资源收集”限时全天开放";
      } else {
        return days.map((x) => TimeUtil.numberToWeek(x)).join();
      }
    },
    changeFilterText(text) {
      if (text != null) {
        text = text.trim();
      }
      this.filterText = text;
      this.filterList();
    },
    filterList() {
      if (this.filterText) {
        const newFilterList = [];
        deepAssign([], this.cardList).forEach((item) => {
          const regex = new RegExp(
            "(" +
            this.filterText.replaceAll(/([*.?+$^\[\](){}|\\\/])/g, "\\$1") +
            ")",
            "gi"
          );
          if (regex.test(item.content.replaceAll(/(<([^>]+)>)/gi, ""))) {
            item.content = item.content.replaceAll(
              regex,
              '<span class="highlight">$1</span>'
            );
            newFilterList.push(item);
          }
        });
        this.filterCardList = newFilterList;
      } else {
        this.filterCardList = this.cardList;
      }
    },
    changeInsider() {
      const [newLevel, validCode] = InsiderUtil.calcInsiderLevel(
        this.filterText,
        this.insiderCodeMap
      );
      if (validCode) {
        this.settings.insider.code = this.filterText;
        this.settings.insider.level = newLevel;
        this.settings.saveSettings();
        this.$message({
          center: true,
          message: "成功启用高级功能",
          type: "success",
        });
      }
    },
    // 监听键盘
    listenKeyBord() {
      document.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          this.searchShow = !this.searchShow;
          if (!this.searchShow) {
            this.changeInsider();
            this.$refs.SearchModel.clearText();
            this.filterText = null;
            this.$emit("cardListChange");
          }
        }
      });
    },
    // 监听标签
    setClickFun() {
      document
        .querySelectorAll(".online-speak")[0]
        .addEventListener("click", () => {
          const target = event.target || event.srcElement;
          // 是否为a标签
          if (
            target.nodeName.toLocaleLowerCase() === "a" ||
            target.parentNode.nodeName.toLocaleLowerCase() === "a"
          ) {
            // 对捕获到的 a 标签进行处理，需要先禁止它的跳转行为
            if (event.preventDefault) {
              event.preventDefault();
            } else {
              window.event.returnValue = true;
            }
            const url =
              target.getAttribute("href") ||
              target.parentNode.getAttribute("href");
            if (
              target.className === "webOpen" ||
              target.parentNode.className === "webOpen"
            ) {
              this.openWeb(url);
            } else {
              this.openUrl(url, 1400, 950);
            }
          }

          if (target.nodeName.toLocaleLowerCase() === "drawer") {
            this.$parent.drawer = !this.$parent.drawer;
          }

          if (target.nodeName.toLocaleLowerCase() === "setting") {
            this.$parent.openSetting();
          }
        });
    },
    openUpdate() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
    },
    copyTextData(item) {
      this.$copyText(
        `${item.content}

蜜饼来源：${item.jumpUrl}

数据由 小刻食堂${CURRENT_VERSION} 收集
工具介绍链接：https://arknightscommunity.drblack-system.com/15386.html`
      ).then(
        (e) => {
          this.$message({
            offset: 50,
            center: true,
            message: "复制成功",
            type: "success",
          });
        },
        (e) => {
          this.$message({
            offset: 50,
            center: true,
            message: "复制失败",
            type: "error",
          });
        }
      );
    },
    /**
     * 复制
     * @param item
     * @param imageUrl {string?} 用于展示图片
     */
    copyData(item, imageUrl) {
      this.$message({
        offset: 50,
        center: true,
        message: "生成图片中，请稍后",
        type: "info",
      });

      PlatformHelper.Img.generateShareImage(
        item,
        "/assets/image/" + Settings.logo,
        DataSourceUtil.getByName(item.dataSource).icon,
        imageUrl
      )
        .then((canvas) => {
          canvas.toBlob((blob) => {
            try {
              if (typeof ClipboardItem === "undefined") {
                this.$message({
                  offset: 50,
                  center: true,
                  message: "当前环境不支持自动复制到剪贴板",
                  type: "info",
                });
                this.errorImageUrl = canvas.toDataURL("image/jpeg");
                this.imageError = true;
              } else {
                navigator.clipboard
                  .write([new ClipboardItem({ [blob.type]: blob })])
                  .then(() => {
                    this.$message({
                      offset: 50,
                      center: true,
                      message: "已复制到剪切板",
                      type: "success",
                    });
                  })
                  .catch((e) => {
                    console.log(e);
                    this.errorImageUrl = canvas.toDataURL("image/jpeg");
                    this.imageError = true;
                  });
              }
            } catch (e) {
              console.log(e);
              this.errorImageUrl = canvas.toDataURL("image/jpeg");
              this.imageError = true;
            }
          });
        })
        .catch((e) => {
          console.log(e);
          this.$message({
            offset: 50,
            center: true,
            message: "图片生成失败",
            type: "error",
          });
        });
    },

    // 高级复制
    rightCopyData(item) {
      if (item.imageList.length > 0) {
        let selectImageToCopy = this.$refs.SelectImageToCopy;
        selectImageToCopy.item = item;
        selectImageToCopy.copyImageToImage = true;
      } else {
        this.$message({
          offset: 50,
          center: true,
          message: "当前图片不足2张",
          type: "warning",
        });
      }
    },

    // 上下滚动绑定滚轮事件
    gowheel(event) {
      if (event.deltaY > 0 && this.announcementAreaScroll == true) { //data中定义one为true 当one为true时执行
        this.$refs.swiper.next();           //以此来控制每次轮播图切换的张数
        this.announcementAreaScroll = false;
        setTimeout(() => {
          this.announcementAreaScroll = true
        }, 500)
      }

      if (event.deltaY < 0 && this.announcementAreaScroll == true) {
        this.$refs.swiper.prev();
        this.announcementAreaScroll = false;
        setTimeout(() => {
          this.announcementAreaScroll = true
        }, 500)
      }
    },
    mouseOverAnnouncement() {
      this.timelineEnableScroll = false
    },

    mouseLeaveAnnouncement() {
      this.timelineEnableScroll = true
    }
  },
};
</script>
<style lang="less">
.page-loading {
  .el-loading-spinner .el-loading-text {
    color: #ffba4b;
  }

  .el-loading-spinner .path {
    stroke: #ffba4b;
  }
}

// 图片加载中
img[lazy="loading"] {
  -webkit-animation: loading 1s linear 1s 5 alternate;
  animation: loading 1s linear infinite;
}

img[lazy="error"] {
  filter: brightness(20%);
}

@keyframes loading {
  from {
    filter: brightness(20%);
  }

  50% {
    filter: brightness(90%);
  }

  to {
    filter: brightness(20%);
  }
}

@import "../../theme/theme.less";

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
  @shadow: "shadow-@{theme}"; // 卡片的阴影
  @hover: "hover-@{theme}"; // 按钮hover颜色

  a {
    color: @@content  !important;
  }

  .color-blue {
    color: #23ade5;
  }

  .card {
    width: 100%;
    background-color: @@bgColor;
    border: @@timeline solid 1px;
    color: @@content;
    // .retweeted  {
    //   background-color: @@bgColor;
    //   border: @@timeline solid 1px;
    //   color: @@content;
    // }

    &.font-size--1 {
      font-size: 0.7rem;
    }

    &.font-size-0 {
      font-size: 1rem;
    }

    &.font-size-1 {
      font-size: 1.2rem;
    }

    &.font-size-2 {
      font-size: 1.5rem;
    }

    .time {
      margin-left: 10px;
      color: #23ade5;
    }

    .head-img {
      width: 20px;
    }
  }

  .el-card__body {
    padding: 10px;
  }

  .is-top {
    z-index: 11;
  }

  #content {
    margin-top: 40px;
    position: fixed;
    width: 100%;

    .scrollTimeline {
      overflow: scroll;

      .el-timeline {
        overflow: unset;
      }
    }

    #timeline-area {
      position: relative;

      // 间隔阴影
      .content-timeline-shadow {
        position: absolute;
        width: 100%;
        height: 25px;
        background: linear-gradient(180deg, @@bgColor 50%, transparent);
        z-index: 10;
      }
    }

    // 更改卡片阴影
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
  }

  .online-speak {
    padding: 3px;
    margin: 0 18px;
    background-color: @@bgColor;
    border: @@timeline solid 1px;
    color: @@content;
    filter: blur(0);
    transition: 0.5s filter;

    &.isnew {
      margin-bottom: 10px;
      cursor: pointer;
      text-align: center;
    }

    &.searching {
      filter: blur(40px);
    }

    .el-card__body {
      padding: 0;

      // 升级内容样式
      .new-info-area {
        cursor: pointer;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 1.3rem;
        justify-content: space-evenly;

        img {
          width: 100px;
        }
      }

      // 今日信息内容样式
      .day-info {
        .day-info-title {}

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
                font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular",
                  YaHei, serif;

                .sane-number {
                  font-size: 28px;
                }
              }

              .sane-info {}
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

    .el-carousel__button {
      background-color: @@ceobeColor;
    }
  }

  .sane-calculator {
    display: flex;
    justify-content: space-around;

    .el-form-item {
      margin-bottom: 0;
    }
  }

  .el-timeline {
    padding-left: 25px;
    overflow: auto;
    padding-top: 25px;
    padding-right: 20px;
    height: 415px;
    margin-top: 10px;
    transition: all 0.5s;

    .highlight {
      color: @@ceobeColor;
      box-shadow: 0 0 10px 0 red;
      transform: scale(1.1);
      padding: 5px;
      margin: 5px;
      display: inline-block;
    }

    &.tag {
      height: 368px;
    }

    &.window {
      height: calc(100vh - 184px);

      &.tag {
        height: calc(100vh - 230px);
      }
    }

    .is-top-info {
      position: absolute;
      top: 2px;
      left: 220px;
    }

    .card-btn-area {
      position: absolute;
      top: 2px;
      right: 0;

      .to-url-btn {
        position: absolute;
        top: -8px;
        right: 0;
        background-color: @@bgColor;
        color: @@content;
        border: @@btnBorder 1px solid;
      }

      .to-url-btn:hover {
        color: @@ceobeColor;
        border-color: @@ceobeLightColor;
        background-color: @@ceobeVeryLightColor;
      }

      .to-copy-btn,
      .to-copy-share {
        position: absolute;
        top: -8px;
        right: 50px;
        background-color: @@bgColor;
        color: @@content;
        border: @@btnBorder 1px solid;

        // 需要特殊显示的数据源只提供复制按钮，跳转由数据源自行实现
        &.special-source {
          right: 0;
        }

        &:hover {
          color: @@ceobeColor;
          border-color: @@ceobeLightColor;
          background-color: @@ceobeVeryLightColor;
        }
      }

      .to-copy-share {
        right: 100px;
        // 需要特殊显示的数据源只提供复制按钮，跳转由数据源自行实现
        &.special-source {
          right: 50px;
        }
      }

      // 需要特殊显示的数据源
      &.special-source {
        .el-card__body {
          padding: 0 !important;
        }
      }
    }

    .el-timeline-item__tail {
      border-left: 2px solid @@timeline;
    }

    .el-timeline-item__timestamp {
      color: @@subTitle;
      margin-left: 20px;
      margin-bottom: 15px;
      font-size: 1rem;
    }

    .el-timeline-item__node {
      background: none;

      .el-timeline-item__icon {
        position: relative;

        &::before {
          content: " ";
          position: absolute;
          top: -12px;
          left: -18px;
          width: 36px;
          height: 36px;
        }

        &.headImg::before {
          border-radius: 10px;
          background: var(--icon) no-repeat center, @@bgColor;
          background-size: cover;
        }
      }
    }
  }
}

.dark {
  .styleChange(dark);
}

.light {
  .styleChange(light);
}

.search-area {
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 11;
}
</style>
