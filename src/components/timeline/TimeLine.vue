<template>
  <div id="timeline-area">
    <Search ref="SearchModel" :searchShow="searchShow"></Search>
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
        ><el-input-number
            ref="saneEdit"
            v-model="san.currentSan"
            :min="0"
            :max="settings.san.maxValue"
            label="输入当前理智"
        ></el-input-number
        ></el-form-item>
        <el-form-item label="理智满后是否推送">
          <el-switch v-model="settings.san.noticeWhenFull"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button @click="saveSan">开始计算</el-button>
        </el-form-item>
      </el-form>
      <div
          class="mention"
          style="text-align: center; margin-top: 16px; opacity: 0.4"
      >
      </div>
    </el-drawer>
    <el-card
        shadow="never"
        class="info-card online-speak"
        v-loading="loading"
        element-loading-text="正在获取在线信息"
    >
      <el-carousel
          arrow="never"
          height="100px"
          direction="vertical"
          :interval="3000"
          :autoplay="true"
      >
        <el-carousel-item v-if="isNew">
          <div class="new-info-area" @click="openUpdate">
            <img
                src="http://prts.wiki/images/b/be/%E9%81%93%E5%85%B7_%E5%B8%A6%E6%A1%86_%E8%B5%84%E6%B7%B1%E5%B9%B2%E5%91%98%E7%89%B9%E8%AE%AD%E9%82%80%E8%AF%B7%E5%87%BD.png"
            />
            博士，检测到了新版本，点击这里进入更新页面
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="day-info">
            <div class="day-info-content">
              <div class="day-info-content-top">
                <div>
                  <div
                      class="day-info-content-top-card-area"
                      :key="index"
                      v-for="(item, index) in onlineDayInfo.countdown"
                  >
                    <div>
                      距离
                      <el-tooltip
                          v-if="item.remark"
                          :content="item.remark"
                          placement="right"
                      >
                        <span class="online-blue">{{ item.text }}</span>
                      </el-tooltip>
                      <span v-else class="online-blue">{{
                          item.text
                        }}</span>
                      <span title="国服 UTC-8">{{
                          " " + calcActivityDiff(item.time)
                        }}</span>
                    </div>
                  </div>
                </div>
                <div
                    v-if="settings.feature.san && imgShow"
                    class="sane-area"
                    @click.stop="openToolDrawer"
                >
                  <div class="sane">
                    当前理智为<span class="online-blue sane-number">{{san.currentSan }}</span>点
                  </div>
                  <div class="sane-info">
                    {{san.calcRemainingTime()}}
                  </div>
                </div>
              </div>
              <div class="day-info-content-bottom">
                <div class="day-info-content-bottom-card-area">
                  <el-tooltip
                      class="item"
                      effect="dark"
                      placement="bottom"
                      v-for="item in dayInfo"
                      :key="item.type"
                  >
                    <div slot="content">
                      {{`${item.name} - 开放日期： ${calcResourceOpenDay(item.day)}`}}
                    </div>
                    <div
                        class="day-info-content-bottom-card"
                        :class="item.notToday ? 'notToday' : ''"
                    >
                      <img v-if="imgShow" v-lazy="item.src" />
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item
            v-for="(item, index) in onlineSpeakList"
            :key="index"
        >
          <div v-html="item.html"></div>
        </el-carousel-item>
      </el-carousel>
    </el-card>
    <div class="content-timeline-shadow"></div>
    <el-tabs
          v-if="settings.display.showByTag"
          v-model="settings.display.defaultTag"
          :stretch="true"
          @tab-click="selectListByTag"
      >
        <el-tab-pane
            v-for="item of transformToSortList(cardListByTag)"
            :key="item.dataName"
            :label="item.dataName"
            :name="item.dataName">
            <span slot="label">
              <el-tooltip
                  effect="dark"
                  :content="getDataSourceByName(item.dataName).title"
                  placement="top"
              >
              <img
                  :title="item"
                  class="title-img"
                  :src="getDataSourceByName(item.dataName).icon"
              />
              </el-tooltip>
            </span>
        </el-tab-pane>
      </el-tabs>
    <el-timeline ref="el-timeline-area" v-if="LazyLoaded" :class="settings.display.windowMode ? 'window' : ''">
      <MyElTimelineItem
          v-for="(item, index) in filterCardList"
          :key="index"
          :timestamp="item.timeForDisplay"
          placement="top"
          :icon-style="{'--icon': `url('${getDataSourceByName(item.dataSource).icon}')`}"
          :icon="'headImg'"
      >
        <span class="is-top-info" v-if="item.isTop">
          <span class="color-blue">【当前条目在{{getDataSourceByName(item.dataSource).title}}的时间线内为置顶状态】</span>
        </span>
        <el-card
            class="card"
            :class="[`font-size-${settings.display.fontSize}`, {'special-source': item.component}]"
            shadow="never"
        >
        <span>
          <el-button
              class="to-copy-btn"
              :class="{'special-source': item.componentData}"
              size="small"
              @click="copyData(item)"
              title="复制该条内容及链接"
          ><i class="el-icon-document-copy"></i
          ></el-button>
          <el-button
              v-if="!item.componentData"
              class="to-url-btn"
              size="small"
              title="前往该条内容"
              @click="openUrl(item.jumpUrl)"
          ><i class="el-icon-right"></i
          ></el-button>
        </span>
          <component :is="resolveComponent(item)" :item="item" :show-image="imgShow"></component>
        </el-card>
      </MyElTimelineItem>
    </el-timeline>
    <div v-else style="height: 300px" v-loading="loading"></div>
  </div>
</template>

<script>
import BrowserUtil from '../../common/util/BrowserUtil';
import {CURRENT_VERSION, dayInfo, PAGE_UPDATE, quickJump} from '../../common/Constants';
import MyElTimelineItem from './MyTimeLineItem';
import DefaultItem from './items/DefaultItem';
import DataSourceUtil from '../../common/util/DataSourceUtil';
import Settings from '../../common/Settings';
import SanInfo from '../../common/sync/SanInfo';
import TimeUtil from '../../common/util/TimeUtil';
import Search from '../Search';
import HttpUtil from '../../common/util/HttpUtil';
import {deepAssign} from '../../common/util/CommonFunctions';

export default {
  name: "TimeLine",
  components: {MyElTimelineItem, Search},
  props: ["cardListByTag", "imgShow"],
  data() {
    return {
      settings: Settings,
      san: SanInfo,
      searchShow: false,
      toolDrawer: false, // 理智计算器菜单
      onlineDayInfo: {},
      onlineSpeakList: [],
      isNew: false,
      dayInfo: dayInfo,
      quickJump: quickJump,
      loading: true, // 初始化加载
      cardList: [],
      cardListAll: {},
      filterText: '',
      filterCardList: [],
      LazyLoaded: false,
      insiderCode: null, // 储存内部密码
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
      this.cardListAll = DataSourceUtil.mergeAllData(this.cardListByTag).map((x) => {
        x.content = x.content.replace(/\n/g, "<br/>");
        return x;
      });
      this.selectListByTag();
    },
    cardList() {
      this.filterList();
    }
  },
  methods: {
    openUrl: BrowserUtil.createTab,
    getDataSourceByName: DataSourceUtil.getByName,
    transformToSortList: DataSourceUtil.transformToSortList,
    resolveComponent(item) {
      if (!item.componentData) {
        return DefaultItem;
      }
      return this.getDataSourceByName(item.dataSource).dataType;
    },
    selectListByTag() {
      if (this.settings.display.showByTag) {
        this.cardList = this.cardListByTag[this.settings.display.defaultTag];
      } else {
        this.cardList = this.cardListAll;
      }
    },
    // 打开计算小工具
    openToolDrawer() {
      this.toolDrawer = true;
      this.$nextTick(() => {
        this.$refs.saneEdit.focus();
      });
    },
    // 设置数据
    saveSan() {
      this.san.saveUpdate();
      this.toolDrawer = false;
      this.$message({
        center: true,
        message: "保存成功，开始计算",
        type: "success",
      });
    },
    // 今天有没有该资源可以刷
    resourcesNotToday() {
      let date = new Date();
      // 如果日期在里面
      let starTime = new Date(this.onlineDayInfo.resources.starTime);
      let overTime = new Date(this.onlineDayInfo.resources.overTime);
      if (date >= starTime && date <= overTime) {
        this.dayInfo.forEach((item) => {
          item.notToday = false;
        });
        return;
      }
      // 如果不在里面
      let week = new Date().getDay();
      this.dayInfo.forEach((item) => {
        item.notToday = !item.day.includes(week);
      });
    },
    // 获取在线信息
    getOnlineSpeak() {
      HttpUtil.GET_Json(
          "http://cdn.liuziyang.vip/Dun-Cookies-Info.json?t=" +
          new Date().getTime()
      ).then((data) => {
        // 头部公告
        let filterList = data.list.filter(
            (x) =>
                new Date(x.starTime) <= new Date() &&
                new Date(x.overTime) >= new Date()
        );

        this.onlineSpeakList.push(...filterList);

        // 快捷连接
        let btnList = data.btnList.filter(
            (x) =>
                new Date(x.starTime) <= new Date() &&
                new Date(x.overTime) >= new Date()
        );
        if (btnList.length > 0) {
          this.quickJump.url.push(...btnList);
        }

        // 是否最新
        this.isNew = data.upgrade.v !== CURRENT_VERSION;

        // 资源获取
        this.onlineDayInfo = data.dayInfo;
        // 倒计时
        this.onlineDayInfo.countdown = this.onlineDayInfo.countdown.filter(
            (x) =>
                new Date(x.starTime) <= new Date() &&
                new Date(x.overTime) >= new Date()
        );

        // 内部密码
        this.insiderCode = data.insider.insiderCode;
        if (this.insiderCode !== this.settings.insider.code) {
          this.settings.insider.level = 0;
          this.settings.saveSettings();
        }
        this.resourcesNotToday();
        this.loading = false;
      });
    },
    calcActivityDiff(endDate) {
      const diff = TimeUtil.calcDiff(endDate);
      if (diff) {
        return '剩' + diff;
      } else {
        return '已结束';
      }
    },
    // 计算资源关卡开启时间
    calcResourceOpenDay(days) {
      if (days.notToday) {
        return days.map(x => TimeUtil.numberToWeek(x)).join();
      } else {
        return '开放中';
      }
    },
    // 调整过滤文字
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
        deepAssign([], this.cardList)
            .forEach((item) => {
              const lowerCase = item.content.toLowerCase();
              let oldIdx = 0;
              let idx = 0;
              let flag = false;
              let newContent = '';
              while ((idx = lowerCase.indexOf(this.filterText, idx)) >= 0) {
                flag = true;
                newContent += item.content.substring(oldIdx, idx);
                newContent += `<span class="highlight">${item.content.substring(idx, this.filterText.length)}</span>`;
                oldIdx = idx;
                idx += this.filterText.length;
              }
              if (flag) {
                newContent += item.content.substring(idx);
                item.content = newContent;
                newFilterList.push(item.content);
              }
            });
        this.filterCardList = newFilterList;
      } else {
        this.filterCardList = this.cardList;
      }
    },
    changeInsider() {
      if (this.filterText === this.insiderCode) {
        this.settings.insider.code = this.insiderCode;
        this.settings.insider.level = 1;
        this.settings.saveSettings();
        this.$message({
          center: true,
          message: "成功进入隐藏模式",
          type: "success",
        });
      }
    },
    // 监听键盘
    listenKeyBord() {
      document.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
          this.searchShow = !this.searchShow;
          if (!this.searchShow) {
            this.changeInsider();
            this.$refs.SearchModel.clearText();
            this.filterText = null;
            // 同时滚动条回到最顶上
            this.$refs["el-timeline-area"].$el.scrollTop = 0;
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
            if (target.nodeName.toLocaleLowerCase() === "a") {
              // 对捕获到的 a 标签进行处理，需要先禁止它的跳转行为
              if (event.preventDefault) {
                event.preventDefault();
              } else {
                window.event.returnValue = true;
              }
              const url = target.getAttribute("href");
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
    openUpdate() {
      BrowserUtil.createExtensionTab(PAGE_UPDATE);
    },
    // 复制
    copyData(item) {
      this.$copyText(
        `${item.content.replace(
          /<br\/>/g,
          `
`
        )}   

${item.url}

数据由 小刻食堂${CURRENT_VERSION} 收集
工具链接：https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue`
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
  },
};
</script>
<style lang="less">
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
    color: @@content!important;
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
    .to-url-btn {
      position: absolute;
      top: -8px;
      right: 0;
      background-color: @@bgColor;
      color: @@content;
      border: @@btnBorder 1px solid;
    }
    .to-url-btn:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: @@hover;
    }
    .to-copy-btn {
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
    }
    .to-copy-btn:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: @@hover;
    }

    // 需要特殊显示的数据源
    &.special-source {
      .el-card__body {
        padding: 0 !important;
      }
    }
  }

  .el-card__body {
    padding: 10px;
  }

  #content {
    margin-top: 40px;
    position: fixed;
    width: 100%;
    // 间隔阴影
    .content-timeline-shadow {
      position: fixed;
      width: 100%;
      height: 20px;
      background: linear-gradient(180deg, @@bgColor 50%, transparent);
      z-index: 10;
    }
    // 更改卡片阴影
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
  }

  .online-speak {
    padding: 3px;
    margin: 0px 18px;
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
                font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular",
                YaHei;
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
    .el-carousel__button {
      background-color: #23ade5;
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
      color: #23ade5;
      box-shadow: 0 0 10px 0 red;
      transform: scale(1.1);
      padding: 5px;
      margin: 5px;
      display: inline-block;
    }
    &.tag {
      height: 365px;
    }
    &.window {
      height: calc(100vh - 184px);
      &.tag {
        height: calc(100vh - 230px);
      }
    }
    .is-top-info {
      position: absolute;
      top: 0px;
      left: 220px;
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
