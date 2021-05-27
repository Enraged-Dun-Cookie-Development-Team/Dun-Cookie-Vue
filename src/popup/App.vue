<template>
  <div :class="setting.outsideClass">
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
                v-if="imgShow"
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
          <el-button
            type="primary"
            icon="el-icon-upload2"
            @click="drawer = false"
            >收起</el-button
          >
        </el-row>
        <div style="position: absolute; bottom: 10px; right: 10px">
          Power By 蓝芷怡 & lwt
        </div>
      </el-drawer>
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
              v-model="sane.saneIndex"
              :min="0"
              :max="setting.saneMax"
              label="输入当前理智"
            ></el-input-number
          ></el-form-item>
          <el-form-item label="理智满后是否推送">
            <el-switch v-model="sane.sanePush"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button @click="saveSane">开始计算</el-button>
          </el-form-item>
        </el-form>
        <div class="mention" style="text-align: center; margin-top: 16px; opacity: 0.4">
          数据不会保存！重启或休眠电脑，重启浏览器，重启插件，修改设置都会丢失数据
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
        {{ `蹲饼 V${saveInfo.version}` }}
        <div v-if="loading" style="color: red">
          【如果你看到这条信息超过1分钟，去*龙门粗口*看看网络有没有*龙门粗口*正常连接】
        </div>
        <span v-else>
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
        </span>
      </div>
      <div id="content">
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
            :interval="10000"
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
                    <div title="国服 UTC-8">
                      <div
                        class="day-info-content-top-card-area"
                        :key="index"
                        v-for="(item, index) in onlineDayInfo.countdown"
                      >
                        <div>
                          距离
                          <span style="color: #f56c6c">{{ item.text }}</span>
                          {{ diffTime(item.time) }}
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="imgShow"
                      class="sane-area"
                      @click.stop="openToolDrawer"
                    >
                      <div class="sane">
                        当前理智为<span class="sane-number">{{
                          sane.saneIndex
                        }}</span
                        >点
                      </div>
                      <div
                        class="sane-info"
                        v-if="sane.saneIndex == setting.saneMax"
                      >
                        已经回满
                      </div>
                      <div class="sane-info" v-else>
                        约{{
                          timespanToDay(sane.endTime / 1000, 2)
                        }}回满，剩余约{{ diffTime(sane.endTime) }}
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
                          {{
                            item.name +
                            " - " +
                            (item.notToday
                              ? `开放日期： ${
                                  item.day
                                    .map((x) => `${numberToWeek(x)}`)
                                    .join() + ""
                                }`
                              : "开放中")
                          }}
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

        <div class="content-timeline-shadown"></div>

        <time-line
          v-if="!setting.isTag"
          ref="TimeLine"
          :saveInfo="saveInfo"
          :setting="setting"
          :imgShow="imgShow"
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
              :imgShow="imgShow"
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
      imgShow: false,
      isNew: false,
      cardlist: [],
      cardlistdm: {},
      saveInfo: common.saveInfo,
      onlineSpeakList: [],
      oldDunIndex: 0,
      dunInfo: common.dunInfo,
      setting: common.setting,
      drawer: false, // 打开菜单
      toolDrawer: false, // 理智计算器菜单
      isReload: false, // 是否正在刷新
      quickJump: common.quickJump,
      dayInfo: common.dayInfo,
      loading: true, // 初始化加载
      sane: common.sane,
      onlineDayInfo: {},
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
        this.getCardlist();
        this.getSaveInfo();
        this.getSetting();
        this.getDunInfo();
        this.getOnlineSpeak();
        this.getSane();
        // 图片卡 先加载dom后加载图片内容
        this.imgShow = true;
      }, 1);
      this.setClickFun();
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
        let detail = event.wheelDelta || event.detail;
        let moveForwardStep = -1;
        let moveBackStep = 1;
        let step = 0;
        if (detail > 0) {
          step = moveForwardStep * 100;
        } else {
          step = moveBackStep * 100;
        }
        scrollDiv.scrollLeft = scrollDiv.scrollLeft + step;
      }
    },
    unbindScroolFun() {},
    // 今天有没有该资源可以刷
    resourcesNotToday() {
      let date = new Date();
      // 如果日期在里面
      let starTime = new Date(this.onlineDayInfo.resources.starTime);
      let overTime = new Date(this.onlineDayInfo.resources.overTime);
      if (date >= starTime && date <= overTime) {
        common.dayInfo.forEach((item) => {
          item.notToday = false;
        });
        return;
      }
      // 如果不在里面
      let week = new Date().getDay();
      common.dayInfo.forEach((item) => {
        item.notToday = !item.day.includes(week);
      });
    },
    // 检测更新
    getUpdateInfo() {
      chrome.runtime.sendMessage({ info: "getUpdateInfo" });
    },

    // 获取在线信息
    getOnlineSpeak() {
      this.Get(
        "http://cdn.liuziyang.vip/Dun-Cookies-Info.json?t=" +
          new Date().getTime()
      ).then((result) => {
        // 头部公告
        let data = JSON.parse(result);
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
        this.isNew = data.upgrade.v != this.saveInfo.version;

        // 资源获取
        this.onlineDayInfo = data.dayInfo;
        this.resourcesNotToday();
        this.loading = false;
      });
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
            this.getSane();
          }, data.time * 500);
        }
      });
    },

    // 获取理智数量
    getSane() {
      this.getLocalStorage("sane").then((data) => {
        if (data != null) {
          this.sane = data;
        }
      });
    },

    // 设置数据
    saveSane() {
      var m = new Date();
      this.sane.endTime = m.setMinutes(
        m.getMinutes() + (this.setting.saneMax - this.sane.saneIndex) * 6
      );
      this.saveLocalStorage("sane", this.sane).then((data) => {
        if (data != null) {
          chrome.runtime.sendMessage({ info: "sane" });
          this.toolDrawer = false;
          this.$message({
            center: true,
            message: "保存成功，开始计算",
            type: "success",
          });
        }
      });
    },

    // 打开计算小工具
    openToolDrawer() {
      this.toolDrawer = true;
      this.$nextTick(() => {
        this.$refs.saneEdit.focus();
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
    width: 700px;
    height: 599px;
    overflow: auto;
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
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      .quickJump-img-area {
      }
      img {
        height: 100%;
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
              justify-content: space-between;
              height: 100px;
              .day-info-content-top {
                width: 610px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
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
                      color: #23ade5;
                    }
                  }
                  .sane-info {
                  }
                }
              }
              .day-info-content-bottom {
                width: 610px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                & .day-info-content-bottom-card-area {
                  display: flex;
                  align-items: center;
                  justify-content: space-around;
                  .day-info-content-bottom-card {
                    height: 50px;
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
  @media screen and (max-width: 700px) {
    #app {
      height: 1500px;
    }
    .el-timeline {
      height: 1500px;
    }
  }
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
.el-timeline {
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
  font-size: 14px;
  align-items: center;
  margin-right: 30px;
  .online-title-img {
    height: 100px;
    margin-right: 10px;
    &.radius {
      border-radius: 4px;
    }
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
}
</style>