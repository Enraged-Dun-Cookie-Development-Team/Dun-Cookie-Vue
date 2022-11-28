<template>
  <div
    id="timeline-area"
    ref="totalScrollArea"
    :class="settings.display.announcementScroll && timelineEnableScroll ? 'scrollTimeline' : ''"
  >
    <Search ref="SearchModel" :search-show="searchShow" @searchTextChange="changeFilterText" />
    <el-card
      v-loading="loading"
      shadow="never"
      class="info-card online-speak"
      :class="searchShow ? 'searching' : ''"
      element-loading-text="【如果你看到这条信息超过1分钟，去*龙门粗口*看看网络有没有*龙门粗口*正常连接】"
    >
      <div
        class="announcement-area"
        @wheel="gowheel"
        @mouseover="mouseOverAnnouncement"
        @mouseleave="mouseLeaveAnnouncement"
      >
        <el-carousel
          v-if="!loading"
          ref="swiper"
          height="100px"
          arrow="never"
          direction="vertical"
          :interval="3000"
          :autoplay="true"
        >
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
                    <div
                      v-for="(item, index) in onlineDayInfo.countdown"
                      :key="index"
                      class="day-info-content-top-card-area"
                    >
                      <div>
                        距离
                        <el-tooltip v-if="item.remark" :content="item.remark" placement="right">
                          <span class="online-orange">{{ item.text }}</span>
                        </el-tooltip>
                        <span v-else class="online-orange">{{ item.text }}</span>
                        <span title="国服 UTC-8">{{ ' ' + calcActivityDiff(item.time) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="settings.feature.san && imgShow" class="sane-area" @click.stop="openToolDrawer">
                    <div class="sane">
                      当前理智为<span class="online-orange sane-number">{{ san.currentSan }}</span
                      >点
                    </div>
                    <div class="sane-info">
                      {{ san.remainTime }}
                    </div>
                  </div>
                </div>
                <div class="day-info-content-bottom">
                  <div class="day-info-content-bottom-card-area">
                    <el-tooltip v-for="item in dayInfo" :key="item.type" class="item" effect="dark" placement="bottom">
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
    <el-tabs
      v-if="settings.display.showByTag"
      v-model="currentTag"
      :stretch="true"
      :class="$refs.SearchModel.penguinShow ? 'penguin-show' : ''"
      @tab-click="selectListByTag"
    >
      <el-tab-pane
        v-for="item of transformToSortList(cardListByTag)"
        :key="item.dataName"
        :label="item.dataName"
        :name="item.dataName"
      >
        <span slot="label">
          <el-tooltip effect="dark" :content="getDataSourceByName(item.dataName).title" placement="top">
            <img class="title-img" :src="getDataSourceByName(item.dataName).icon" />
          </el-tooltip>
        </span>
      </el-tab-pane>
    </el-tabs>
    <div class="content-timeline-shadow"></div>
    <el-timeline
      v-if="LazyLoaded"
      ref="elTimelineArea"
      :class="[settings.display.windowMode ? 'window' : '', settings.display.showByTag ? 'tag' : '']"
    >
      <MyElTimelineItem
        v-for="(item, index) in filterCardList"
        :key="index"
        :timestamp="item.timeForDisplay"
        placement="top"
        :icon-style="{
          '--icon': `url('${getDataSourceByName(item.dataSource).icon}')`,
        }"
        :icon="'headImg'"
      >
        <span v-if="item.isTop" class="is-top-info">
          <span class="color-blue"
            >【当前条目在{{ getDataSourceByName(item.dataSource).title }}的时间线内为置顶状态】</span
          >
        </span>

        <span class="card-btn-area">
          <el-button
            class="to-copy-share"
            :class="{ 'special-source': item.componentData }"
            size="small"
            title="左键生成图片分享，右键九宫格分享"
            @click="copyData(item)"
            @contextmenu.prevent.native="rightCopyData(item)"
          >
            <i class="el-icon-share"></i>
          </el-button>
          <el-button
            class="to-copy-btn"
            :class="{ 'special-source': item.componentData }"
            size="small"
            title="复制文字进剪切板"
            @click="copyTextData(item)"
          >
            <i class="el-icon-document-copy"></i>
          </el-button>
          <el-button
            v-if="!item.componentData"
            class="to-url-btn"
            size="small"
            title="前往该条内容"
            @click="openUrl(item.jumpUrl)"
            ><i class="el-icon-right"></i
          ></el-button>
        </span>
        <el-card
          class="card"
          :class="[`font-size-${settings.display.fontSize}`, { 'special-source': item.componentData }]"
          shadow="never"
        >
          <component :is="resolveComponent(item)" :item="item" :show-image="imgShow" />
        </el-card>
      </MyElTimelineItem>
    </el-timeline>
    <div v-else v-loading="loading" style="height: 300px" element-loading-custom-class="page-loading"></div>
    <el-dialog
      :modal-append-to-body="false"
      title="图片自动复制出错，请于图片右键复制图片"
      :visible.sync="imageError"
      width="80%"
    >
      <img :src="errorImageUrl" style="width: 100%" />
    </el-dialog>
    <select-image-to-copy ref="SelectImageToCopy" @copyData="copyData" />
    <update-info-notice />
  </div>
</template>

<script>
import { CURRENT_VERSION, dayInfo, PAGE_UPDATE, quickJump } from '../../common/Constants';
import MyElTimelineItem from './MyTimeLineItem';
import DefaultItem from './items/DefaultItem';
import DataSourceUtil from '../../common/util/DataSourceUtil';
import Settings from '../../common/Settings';
import SanInfo from '../../common/sync/SanInfo';
import TimeUtil from '../../common/util/TimeUtil';
import Search from '../Search';
import { deepAssign } from '../../common/util/CommonFunctions';
import PlatformHelper from '../../common/platform/PlatformHelper';
import InsiderUtil from '../../common/util/InsiderUtil';
import ServerUtil from '../../common/util/ServerUtil';
import SelectImageToCopy from '@/components/SelectImageToCopy';
import UpdateInfoNotice from '../UpdateInfoNotice';
import CurrentDataSource from '../../common/sync/CurrentDataSource';

export default {
  name: 'TimeLine',
  components: { MyElTimelineItem, Search, SelectImageToCopy, UpdateInfoNotice },
  props: { cardListByTag: { type: Object, required: true }, imgShow: Boolean },
  data() {
    Settings.doAfterInit((settings) => (this.currentTag = settings.display.defaultTag));
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
      filterText: '',
      filterCardList: [],
      LazyLoaded: false,
      insiderCodeMap: null, // 储存内部密码
      janvas: null, //菜单模块icon
      imageError: false,
      errorImageUrl: '',
      openResources: false,
    };
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
  mounted() {
    this.getOnlineSpeak();
    this.setClickFun();
    this.listenKeyBord();
    setTimeout(() => {
      this.LazyLoaded = true;
    }, 233);
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
      return this.getDataSourceByName(item.dataSource).dataType.typeName;
    },
    selectListByTag(emitEvent = true) {
      if (this.settings.display.showByTag) {
        this.cardList = this.cardListByTag[this.currentTag];
      } else {
        this.cardList = this.cardListAll;
      }
      if (emitEvent) {
        this.$emit('cardListChange');
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
      let starTime = new Date(this.onlineDayInfo.resources.start_time);
      let overTime = new Date(this.onlineDayInfo.resources.over_time);
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
      let version = ServerUtil.getVersionInfo(false).then((data) => {
        // 是否最新
        this.isNew = Settings.JudgmentVersion(data.version, CURRENT_VERSION);
      });

      let announcement = ServerUtil.getAnnouncementInfo(false).then((data) => {
        // 头部公告
        let filterList = data.filter(
          (x) =>
            new Date(x.start_time) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.over_time) >= TimeUtil.changeToCCT(new Date())
        );

        this.onlineSpeakList.push(...filterList);
      });

      let resource = ServerUtil.getResourceInfo(false).then((data) => {
        // 资源获取
        this.onlineDayInfo = data;
        // 倒计时
        this.onlineDayInfo.countdown = this.onlineDayInfo.countdown.filter(
          (x) =>
            new Date(x.start_time) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.over_time) >= TimeUtil.changeToCCT(new Date())
        );
      });

      Promise.all([announcement, version, resource]).then(() => {
        this.resourcesNotToday();
        this.loading = false;
      });
    },

    calcActivityDiff(endDate) {
      let startDate = TimeUtil.changeToCCT(new Date());
      const diff = TimeUtil.calcDiff(endDate, startDate);
      if (diff) {
        return '剩' + diff;
      } else {
        return '已结束';
      }
    },
    // 计算资源关卡开启时间
    calcResourceOpenDay(days) {
      if (this.openResources) {
        return '活动期间，“资源收集”限时全天开放';
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
          const regex = new RegExp('(' + this.filterText.replaceAll(/([*.?+$^[\](){}|\\/])/g, '\\$1') + ')', 'gi');
          if (regex.test(item.content.replaceAll(/(<([^>]+)>)/gi, ''))) {
            item.content = item.content.replaceAll(regex, '<span class="highlight">$1</span>');
            newFilterList.push(item);
          }
        });
        this.filterCardList = newFilterList;
      } else {
        this.filterCardList = this.cardList;
      }
    },
    changeInsider() {
      const [newLevel, validCode] = InsiderUtil.calcInsiderLevel(this.filterText, this.insiderCodeMap);
      if (validCode) {
        this.settings.insider.code = this.filterText;
        this.settings.insider.level = newLevel;
        this.settings.saveSettings();
        this.$message({
          center: true,
          message: '成功启用高级功能',
          type: 'success',
        });
      }
    },
    // 监听键盘
    listenKeyBord() {
      document.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.searchShow = !this.searchShow;
          if (!this.searchShow) {
            this.changeInsider();
            this.$refs.SearchModel.clearText();
            this.filterText = null;
            this.$emit('cardListChange');
          }
        }
      });
    },
    // 监听标签
    setClickFun() {
      document.querySelectorAll('.online-speak')[0].addEventListener('click', () => {
        const target = event.target || event.srcElement;
        // 是否为a标签
        if (target.nodeName.toLocaleLowerCase() === 'a' || target.parentNode.nodeName.toLocaleLowerCase() === 'a') {
          // 对捕获到的 a 标签进行处理，需要先禁止它的跳转行为
          if (event.preventDefault) {
            event.preventDefault();
          } else {
            window.event.returnValue = true;
          }
          const url = target.getAttribute('href') || target.parentNode.getAttribute('href');
          if (target.className === 'tabOpen' || target.parentNode.className === 'tabOpen') {
            this.openUrl(url, 1400, 950);
          } else {
            this.openWeb(url);
          }
        }

        if (target.nodeName.toLocaleLowerCase() === 'drawer') {
          this.$parent.handleIconClick();
        }

        if (target.nodeName.toLocaleLowerCase() === 'setting') {
          this.$parent.openSetting();
        }
      });
    },
    openUpdate() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
    },
    copyTextData(item) {
      this.$copyText(
        `${item.content.replace(/<\/span>|<span class="highlight">/g, '')}

蜜饼来源：${item.jumpUrl}

数据由 小刻食堂${CURRENT_VERSION} 收集
工具介绍链接：https://arknightscommunity.drblack-system.com/15386.html`
      ).then(
        (e) => {
          this.$message({
            offset: 50,
            center: true,
            message: '复制成功',
            type: 'success',
          });
        },
        (e) => {
          this.$message({
            offset: 50,
            center: true,
            message: '复制失败',
            type: 'error',
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
        message: '生成图片中，请稍后',
        type: 'info',
      });
      PlatformHelper.Img.generateShareImage(
        item,
        '/assets/image/' + Settings.logo,
        { ...DataSourceUtil.getByName(item.dataSource) },
        imageUrl
      )
        .then((canvas) => {
          canvas.toBlob((blob) => {
            try {
              if (typeof ClipboardItem === 'undefined') {
                this.$message({
                  offset: 50,
                  center: true,
                  message: '当前环境不支持自动复制到剪贴板',
                  type: 'info',
                });
                this.errorImageUrl = canvas.toDataURL('image/jpeg');
                this.imageError = true;
              } else {
                navigator.clipboard
                  .write([new ClipboardItem({ [blob.type]: blob })])
                  .then(() => {
                    this.$message({
                      offset: 50,
                      center: true,
                      message: '已复制到剪切板',
                      type: 'success',
                    });
                  })
                  .catch((e) => {
                    console.log(e);
                    this.errorImageUrl = canvas.toDataURL('image/jpeg');
                    this.imageError = true;
                  });
              }
            } catch (e) {
              console.log(e);
              this.errorImageUrl = canvas.toDataURL('image/jpeg');
              this.imageError = true;
            }
          });
        })
        .catch((e) => {
          console.log(e);
          this.$message({
            offset: 50,
            center: true,
            message: '图片生成失败',
            type: 'error',
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
          message: '当前图片不足2张',
          type: 'warning',
        });
      }
    },

    // 上下滚动绑定滚轮事件
    gowheel(event) {
      if (event.deltaY > 0 && this.announcementAreaScroll == true) {
        //data中定义one为true 当one为true时执行
        this.$refs.swiper.next(); //以此来控制每次轮播图切换的张数
        this.announcementAreaScroll = false;
        setTimeout(() => {
          this.announcementAreaScroll = true;
        }, 500);
      }

      if (event.deltaY < 0 && this.announcementAreaScroll == true) {
        this.$refs.swiper.prev();
        this.announcementAreaScroll = false;
        setTimeout(() => {
          this.announcementAreaScroll = true;
        }, 500);
      }
    },
    mouseOverAnnouncement() {
      this.timelineEnableScroll = false;
    },

    mouseLeaveAnnouncement() {
      this.timelineEnableScroll = true;
    },
  },
};
</script>
<style lang="less">
@import '../../theme/theme.less';

.page-loading {
  .el-loading-spinner .el-loading-text {
    color: #ffba4b;
  }

  .el-loading-spinner .path {
    stroke: #ffba4b;
  }
}

// 图片加载中

img[lazy='loading'] {
  -webkit-animation: loading 1s linear 1s 5 alternate;
  animation: loading 1s linear infinite;
}

img[lazy='error'] {
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

.styleChange(@theme) {
  @ceobeLightColor: 'ceobeLightColor-@{theme}'; //小刻食堂主题亮色浅色
  @ceobeColor: 'ceobeColor-@{theme}'; //小刻食堂主题亮色
  @ceobeVeryLightColor: 'ceobeVeryLightColor-@{theme}'; // 小刻食堂主题亮色非常浅色

  @ceobeDarkColor: 'ceobeDarkColor-@{theme}'; //小刻食堂主题暗色
  @bgColor: 'bgColor-@{theme}'; // 背景颜色
  @content: 'content-@{theme}'; // 文本颜色
  @timeline: 'timeline-@{theme}'; // 时间线颜色和时间线border颜色
  @subTitle: 'subTitle-@{theme}'; // 小标题颜色
  @btnBorder: 'btnBorder-@{theme}'; // 按钮边框颜色和一些小线条
  @setBtnBorder: 'setBtnBorder-@{theme}';
  @btnBg: 'btnBg-@{theme}'; // 按钮内部颜色
  @setLarge: 'setLarge-@{theme}'; // 设置标题颜色
  @shadow: 'shadow-@{theme}'; // 卡片的阴影
  @hover: 'hover-@{theme}'; // 按钮hover颜色

  a {
    color: @@content !important;
  }

  .color-blue {
    color: #23ade5;
  }

  .penguin-show {
    opacity: 0;
  }

  .card {
    width: 100%;
    border: @@timeline solid 1px;
    color: @@content;
    background-color: @@bgColor;
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
    position: fixed;
    margin-top: 40px;
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
        z-index: 10;
        width: 100%;
        height: 25px;
        background: linear-gradient(180deg, @@bgColor 50%, transparent);
      }
    }

    // 更改卡片阴影
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
  }

  .online-speak {
    margin: 0 18px;
    padding: 3px;
    border: @@timeline solid 1px;
    color: @@content;
    background-color: @@bgColor;
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

      .announcement-area {
        height: 100px;
      }

      // 升级内容样式

      .new-info-area {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        height: 100%;
        font-size: 1.3rem;
        cursor: pointer;
        flex-direction: row;

        img {
          width: 100px;
        }
      }

      // 今日信息内容样式

      .day-info {
        .day-info-content {
          display: flex;
          justify-content: flex-start;
          margin-right: 30px;
          height: 100px;
          flex-direction: column;

          .day-info-content-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            flex-direction: row;

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
                font-family: Geometos, 'Sans-Regular', 'SourceHanSansCN-Regular', YaHei, serif;

                .sane-number {
                  font-size: 28px;
                }
              }
            }
          }

          .day-info-content-bottom {
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            margin-top: 5px;
            width: 100%;

            & .day-info-content-bottom-card-area {
              display: flex;
              justify-content: space-around;
              align-items: center;

              .day-info-content-bottom-card {
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                width: 70px;
                height: 40px;

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
    overflow: auto;
    margin-top: 10px;
    padding-top: 25px;
    padding-right: 20px;
    padding-left: 25px;
    height: 415px;
    transition: all 0.5s;

    .highlight {
      display: inline-block;
      margin: 5px;
      padding: 5px;
      color: @@ceobeColor;
      box-shadow: 0 0 10px 0 red;
      transform: scale(1.1);
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
        border: @@btnBorder 1px solid;
        color: @@content;
        background-color: @@bgColor;
      }

      .to-url-btn:hover {
        border-color: @@ceobeLightColor;
        color: @@ceobeColor;
        background-color: @@ceobeVeryLightColor;
      }

      .to-copy-btn,
      .to-copy-share {
        position: absolute;
        top: -8px;
        right: 50px;
        border: @@btnBorder 1px solid;
        color: @@content;
        background-color: @@bgColor;

        // 需要特殊显示的数据源只提供复制按钮，跳转由数据源自行实现

        &.special-source {
          right: 0;
        }

        &:hover {
          border-color: @@ceobeLightColor;
          color: @@ceobeColor;
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
      margin-bottom: 15px;
      margin-left: 20px;
      font-size: 1rem;
      color: @@subTitle;
    }

    .el-timeline-item__node {
      background: none;

      .el-timeline-item__icon {
        position: relative;

        &::before {
          content: ' ';
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
  z-index: 11;
  width: 100%;
  height: 120px;
}
</style>
