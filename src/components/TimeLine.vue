<template>
  <div id="timeline-area">
    <serach-model ref="SerachModel" :searchShow="searchShow"></serach-model>
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
      <div
        class="mention"
        style="text-align: center; margin-top: 16px; opacity: 0.4"
      >
        数据不会保存！重启或休眠电脑，重启浏览器，重启插件，修改设置都会丢失数据
      </div>
    </el-drawer>

    <el-card
      shadow="never"
      class="info-card online-speak"
      :class="searchShow ? 'searching' : ''"
      v-loading="loading"
      element-loading-text="【如果你看到这条信息超过1分钟，去*龙门粗口*看看网络有没有*龙门粗口*正常连接】"
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
                      <span v-else class="online-blue">{{ item.text }}</span>
                      <span title="国服 UTC-8">{{
                        " " + diffTime(item.time)
                      }}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="setting.sanShow && imgShow"
                  class="sane-area"
                  @click.stop="openToolDrawer"
                >
                  <div class="sane">
                    当前理智为<span class="online-blue sane-number">{{
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
                    约{{ timespanToDay(sane.endTime / 1000, 2) }}回满，{{
                      diffTime(sane.endTime)
                    }}
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
                              item.day.map((x) => `${numberToWeek(x)}`).join() +
                              ""
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
        <el-carousel-item v-for="(item, index) in onlineSpeakList" :key="index">
          <div v-html="item.html"></div>
        </el-carousel-item>
      </el-carousel>
    </el-card>

    <el-tabs
      v-if="setting.isTag"
      v-model="setting.tagActiveName"
      :stretch="true"
      @tab-click="filterDmList"
    >
      <el-tab-pane
        :ref="numberOrEnNameToName(item)"
        v-for="item in elTabPaneSortTitle"
        :key="item"
        :label="item"
        :name="numberOrEnNameToName(item)"
      >
        <span slot="label">
          <el-tooltip
            effect="dark"
            :content="numberOrEnNameToName(item)"
            placement="top"
          >
            <img class="title-img" :src="numberOrEnNameToIconSrc(item)" />
          </el-tooltip>
        </span>
      </el-tab-pane>
    </el-tabs>

    <div class="content-timeline-shadown"></div>

    <el-timeline
      v-if="LazyLoaded"
      :class="[setting.isWindow ? 'window' : '', setting.isTag ? 'tag' : '']"
      ref="el-timeline-area"
    >
      <el-timeline-item
        v-for="(item, index) in filterCardlist"
        :key="index"
        :timestamp="
          item.source == 2 || item.source == 5 || item.source == 7
            ? timespanToDay(item.time, 1)
            : timespanToDay(item.time)
        "
        placement="top"
        :icon="'headImg' + item.source"
      >
        <span class="is-top-info" v-if="item.isTop">
          <span class="color-blue" style="font-size: 1rem"
            >【当前条目在微博的时间线内为置顶状态】</span
          >
        </span>
        <el-card
          class="card"
          :class="'font-size-' + setting.fontsize + ' soure-' + item.source"
          shadow="never"
        >
          <span>
            <el-button
              class="to-copy-btn"
              :class="item.source != 8 && item.source != 9 ? '' : 'rigth-zero'"
              size="small"
              @click="copyData(item)"
              title="复制该条内容及链接"
              ><i class="el-icon-document-copy"></i
            ></el-button>
            <el-button
              v-if="item.source != 8 && item.source != 9"
              class="to-url-btn"
              size="small"
              title="前往该条内容"
              @click="openUrl(item.url)"
              ><i class="el-icon-right"></i
            ></el-button>
          </span>
          <!-- 泰拉记事社 -->
          <div v-if="item.source == 8" class="tlgw">
            <img v-if="imgShow" class="image-back" v-lazy="item.image" />
            <div class="content-card">
              <div class="content-card-info">
                <img
                  v-if="imgShow"
                  v-lazy="item.image"
                  class="content-card-image"
                />
                <div class="content-card-title">{{ item.name }}</div>
                <div class="content-card-introduction">
                  {{ item.html.introduction }}
                </div>
                <div class="content-card-subtitle">
                  {{ item.html.subtitle }}
                </div>
              </div>
              <div class="content-card-episodes">
                <span
                  v-for="episodes in item.html.episodes"
                  :key="episodes.cid"
                  class="content-card-episodes-btn"
                  @click="
                    openUrl(
                      `https://terra-historicus.hypergryph.com/comic/${item.html.cid}/episode/${episodes.cid}`
                    )
                  "
                  >{{ episodes.title }}</span
                >
              </div>
            </div>
          </div>
          <!-- 网易云音乐 -->
          <div
            v-else-if="item.source == 9"
            class="wyyyy"
            @click="openUrl(item.url)"
          >
            <img v-if="imgShow" class="image-back" v-lazy="item.image" />
            <div class="content-card">
              <div class="record-area">
                <div class="record-area-record">
                  <img class="record-image" v-lazy="item.image" />
                </div>
                <img
                  class="record-image-back"
                  v-lazy="'assets/image/record.png'"
                />
              </div>
              <div class="record-info">
                {{ item.name }}
              </div>
              <div class="record-size">共{{ item.size }}首</div>
              <div class="record-btn">
                <i class="el-icon-d-arrow-right"></i>
                Go To Album
              </div>
            </div>
          </div>
          <div v-else>
            <!-- 普通列 -->
            <div>
              <el-row>
                <div v-html="item.dynamicInfo"></div>
                <!-- 如果有转发 -->
                <el-card
                  v-if="item.retweeted"
                  class="card margintb"
                  shadow="never"
                >
                  转发至 @{{ item.retweeted.name }}:
                  <br />
                  <span v-html="item.retweeted.dynamicInfo"></span>
                </el-card>
              </el-row>
              <el-row
                v-if="imgShow && setting.imgshow && item.image"
                class="margintb"
              >
                <div
                  class="img-area"
                  @click="changeShowAllImage(item.image)"
                  :class="showAllImage.includes(item.image) ? 'show-all' : ''"
                >
                  <div
                    v-if="
                      item.imageList != undefined && item.imageList.length > 1
                    "
                    class="multi-img"
                  >
                    <el-row :gutter="5">
                      <el-col
                        v-for="(img, index) in item.imageList"
                        :key="img"
                        :span="8"
                        class="multi-img-area"
                        ><img
                          v-lazy="img"
                          class="img"
                          :ref="item.id + '_' + index"
                        />
                        <span
                          class="img-btn img-look-btn"
                          @click.stop="
                            ViewImg(item, img, item.id + '_' + index)
                          "
                          ><i class="el-icon-view"></i
                        ></span>
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else class="one-img">
                    <img v-lazy="item.image" :ref="item.id" class="img" />
                    <span
                      class="img-btn img-look-btn"
                      @click.stop="ViewImg(item, item.image, item.id)"
                      ><i class="el-icon-view"></i
                    ></span>
                  </div>
                </div>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <div v-else style="height: 300px" v-loading="loading"></div>
  </div>
</template>

<script>
import {
  timespanToDay,
  common,
  numberOrEnNameToName,
  numberOrEnNameToIconSrc,
  numberToWeek,
  Get,
  diffTime,
  saveLocalStorage,
  getLocalStorage,
} from "../assets/JS/common";
import SerachModel from "../components/Search";
export default {
  name: "TimeLine",
  components: { SerachModel },
  props: ["saveInfo", "imgShow", "cardlistdm"],
  data() {
    return {
      setting: common.setting,
      showAllImage: [],
      windowTabId: null,
      onlineSpeakList: [],
      loading: true, // 初始化加载
      dayInfo: common.dayInfo,
      onlineDayInfo: {},
      isNew: false,
      sane: common.sane,
      toolDrawer: false, // 理智计算器菜单
      quickJump: common.quickJump,
      searchShow: false,
      filterCardlist: [],
      cardlist: [],
      filterText: null,
      insiderCode: null, // 储存内部密码
      insiderOpen: true, // 内部模式开启
      kazeSource: {},
      elTabPaneSortTitle: [],
      LazyLoaded: false,
    };
  },
  mounted() {
    this.getkazeSource();
    this.getSetting();
    this.getOnlineSpeak();
    this.getSane();
    this.setClickFun();
    this.listenKeyBord();
    setTimeout(() => {
      this.LazyLoaded = true;
    }, 233);
  },
  watch: {
    cardlist() {
      this.filterList();
    },
    cardlistdm() {
      this.elTabPaneSortTitle = Object.keys(this.cardlistdm)
        .map((x) => this.kazeSource[x])
        .sort((x, y) => x.source - y.source)
        .map((x) => x.dataName);
      this.filterDmList();
    },
  },
  methods: {
    timespanToDay,
    numberToWeek,
    Get,
    diffTime,
    saveLocalStorage,
    getLocalStorage,
    numberOrEnNameToName,
    numberOrEnNameToIconSrc,
    getkazeSource() {
      this.getLocalStorage("kazeSource").then((data) => {
        this.kazeSource = data;
      });
    },
    getSetting() {
      this.getLocalStorage("setting").then((data) => {
        this.setting = data;
      });
    },
    // 更改标签了
    openUpdate() {
      chrome.tabs.create({
        url: chrome.extension.getURL("update.html"),
      });
    },
    // 调整过滤文字
    changeFilterText(text) {
      if (text != null) {
        text = text.trim();
      }
      this.filterText = text;
      this.filterList();
    },
    filterDmList() {
      // 如果是单独的
      if (this.setting.isTag) {
        this.$nextTick(() => {
          this.cardlist =
            this.cardlistdm[this.$refs[this.setting.tagActiveName][0].label];
        });
      } else {
        this.cardlist = Object.values(this.cardlistdm)
          .reduce((acc, cur) => [...acc, ...cur], [])
          .sort((x, y) => y.time - x.time)
          .map((x) => {
            x.dynamicInfo = x.dynamicInfo.replace(/\n/g, "<br/>");
            return x;
          });
      }
    },
    filterList() {
      if (this.filterText) {
        this.filterCardlist = this.cardlist.filter((item) =>
          item.dynamicInfo.toLowerCase().includes(this.filterText.toLowerCase())
        );
      } else {
        this.filterCardlist = this.cardlist;
      }
    },

    changeInsider() {
      if (this.filterText == this.insiderCode) {
        this.setting.insider = true;
        this.saveLocalStorage("setting", this.setting);
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
        if (e.keyCode == 13) {
          this.searchShow = !this.searchShow;
          if (!this.searchShow) {
            if (this.insiderOpen) {
              this.changeInsider();
            }
            this.$refs.SerachModel.clearText();
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
        // 倒计时
        this.onlineDayInfo.countdown = this.onlineDayInfo.countdown.filter(
          (x) =>
            new Date(x.starTime) <= new Date() &&
            new Date(x.overTime) >= new Date()
        );

        // 内部密码
        this.insiderCode = data.insider.insiderCode;
        this.insiderOpen = data.insider.insiderOpen;
        this.setting.insider = this.insiderOpen;
        this.saveLocalStorage("setting", this.setting);
        this.resourcesNotToday();
        this.loading = false;
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

    copyImg(refName) {
      let width = this.$refs[refName][0].naturalWidth;
      let height = this.$refs[refName][0].naturalHeight;
      let img = this.$refs[refName][0];
      try {
        console.log("图片已被复制！");
      } catch (err) {
        console.error(err.name, err.message);
      }
    },
    ViewImg(item, img, refName) {
      // 舍弃 会把列表关闭
      // chrome.tabs.create(
      //   {
      //     url: chrome.extension.getURL("viewImg.html"),
      //     active: true,
      //   },
      //   function (_tab) {
      //    setTimeout(() => {
      //       chrome.tabs.sendMessage(_tab.id, {
      //       message: "some custom message",
      //       arg: "some arg",
      //     });
      //    }, 1000);
      //   }
      // );
      // 直接打开 我也不知道为什么要加上这个神奇的数字 但是还是有缝隙
      let width = this.$refs[refName][0].naturalWidth + 32 || 1100;
      let height = this.$refs[refName][0].naturalHeight + 67 || 750;
      if (this.windowTabId != null) {
        chrome.windows.remove(this.windowTabId);
      }
      chrome.windows.create(
        {
          url: chrome.extension.getURL("viewImg.html"),
          type: "panel",
          width: width,
          height: height,
        },
        (window) => {
          this.windowTabId = window.id;
          this.saveLocalStorage("viewImg", {
            info: "tab",
            item: item,
            img: img,
            winId: window.id,
          }).then((data) => {});
        }
      );
    },
    // 复制文本
    copyData(item) {
      this.$copyText(
        `${item.dynamicInfo.replace(
          /<br\/>/g,
          `
`
        )}   

饼来源：${item.url}

数据由 小刻食堂${this.saveInfo.version} 收集
工具介绍链接：https://arknightscommunity.drblack-system.com/2012.html`
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
    openUrl(url) {
      chrome.tabs.create({ url: url });
    },
    // 图片收起展示
    changeShowAllImage(img) {
      if (this.showAllImage.includes(img)) {
        this.showAllImage.splice(
          this.showAllImage.findIndex((x) => x == img),
          1
        );
      } else {
        this.showAllImage.push(img);
      }
    },
  },
};
</script>
<style lang="less" >
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
  @shadow: "shadow-@{theme}"; // 卡片的阴影
  @hover: "hover-@{theme}"; // 按钮hover颜色

  a {
    color: @@content!important;
  }
  .color-blue {
    color: #23ade5;
  }

  .is-top {
    z-index: 11;
  }

  #timeline-area {
    position: relative;
    // 间隔阴影
    .content-timeline-shadown {
      position: absolute;
      width: 100%;
      height: 25px;
      background: linear-gradient(180deg, @@bgColor 50%, transparent);
      z-index: 10;
    }
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
    .margintb {
      margin: 10px 0 0 0;
    }
    .img-area {
      width: 100%;
      height: 150px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      .multi-img {
        max-width: 700px;
        width: 100%;
        margin: auto;
        .multi-img-area {
          position: relative;
        }
      }
      .one-img {
        max-width: 700px;
        width: 100%;
        margin: auto;
        position: relative;
      }
      .multi-img-area,
      .one-img {
        .img-btn {
          opacity: 0;
          transition: 0.5s opacity;
        }
        &:hover {
          .img-btn {
            opacity: 1;
          }
        }
      }

      .img {
        border-radius: 4px;
        width: 100%;
      }
      // 图片操作按钮
      .img-btn {
        position: absolute;
        z-index: 1;
        right: 6px;
        top: 2px;
        width: 26px;
        height: 20px;
        text-align: center;
        background: #fff;
        line-height: 16px;
        border-radius: 3px;
        i {
          font-size: 12px;
        }
      }
      .img-copy-btn {
        right: 36px;
      }
      &::before {
        content: " ";
        position: absolute;
        bottom: 0;
        height: 50px;
        width: 100%;
        background: linear-gradient(0, @@bgColor, transparent);
        z-index: 1;
      }
      &.show-all {
        height: 100%;
        &::before {
          height: 0;
        }
      }
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
      &.rigth-zero {
        right: 0;
      }
    }
    .to-copy-btn:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: @@hover;
    }

    // 罗德岛泰拉记事簿 网易云音乐
    &.soure-8,
    &.soure-9 {
      .el-card__body {
        padding: 0 !important;
      }
    }
  }

  .el-card__body {
    padding: 10px;
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

  // 标签栏
  .el-tabs {
    height: 30px;
    margin: 0px 10px;
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

  // 时间线
  .el-timeline {
    padding-left: 25px;
    overflow: auto;
    padding-top: 25px;
    padding-right: 20px;
    height: 415px;
    margin-top: 10px;
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
        &.headImg0::before {
          background: url("/assets/image/bili.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg1::before {
          background: url("/assets/image/weibo.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg2::before {
          border-radius: 10px;
          background: url("/assets/image/txz.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg3::before {
          border-radius: 10px;
          background: url("/assets/image/cho3Weibo.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg4::before {
          border-radius: 10px;
          background: url("/assets/image/ys3Weibo.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg5::before {
          background: url("/assets/image/sr.ico") no-repeat center, #fff;
          background-size: cover;
        }
        &.headImg6::before {
          border-radius: 10px;
          background: url("/assets/image/tlWeibo.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg7::before {
          border-radius: 10px;
          background: url("/assets/image/mrfz.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg8::before {
          border-radius: 10px;
          background: url("/assets/image/tl.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg9::before {
          border-radius: 10px;
          background: url("/assets/image/wyyyy.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg10::before {
          border-radius: 10px;
          background: url("/assets/image/hmlhw.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg11::before {
          border-radius: 10px;
          background: url("/assets/image/wei.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg12::before {
          border-radius: 10px;
          background: url("/assets/image/anmi.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg13::before {
          border-radius: 10px;
          background: url("/assets/image/starying.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg14::before {
          border-radius: 10px;
          background: url("/assets/image/lqy.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg15::before {
          border-radius: 10px;
          background: url("/assets/image/xyhm.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg16::before {
          border-radius: 10px;
          background: url("/assets/image/xrz.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg17::before {
          border-radius: 10px;
          background: url("/assets/image/agm.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg18::before {
          border-radius: 10px;
          background: url("/assets/image/lm7.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg19::before {
          border-radius: 10px;
          background: url("/assets/image/ht.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg20::before {
          border-radius: 10px;
          background: url("/assets/image/skade.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg21::before {
          border-radius: 10px;
          background: url("/assets/image/alchemaniaC.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg22::before {
          border-radius: 10px;
          background: url("/assets/image/jsd.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
      }
    }
  }

  // 泰拉官网单独使用样式
  .tlgw {
    position: relative;
    .image-back {
      top: 0;
      left: 0;
      width: 100%;
      filter: blur(5px) brightness(50%);
    }
    .content-card {
      display: flex;
      top: 0;
      left: 0;
      position: absolute;
      height: 100%;
      width: 100%;
      padding: 2% 4%;
      .content-card-info {
        margin-top: 3%;
        width: 50%;
        .content-card-image {
          width: 300px;
          box-shadow: 0 0 16px 10px rgb(6 0 1 / 65%), 0 0 8px 2px #b0243b;
        }
        .content-card-title {
          color: #fff;
          font-size: 2rem;
          letter-spacing: -0.1rem;
          text-shadow: 0 0 1rem #000, 0 0 0.5rem #000, 0 0 0.25rem #000;
        }
        .content-card-introduction {
          margin-top: 3px;
          font-size: 0.7rem;
          color: #afaeae;
        }
        .content-card-subtitle {
          margin-top: 5px;
          color: #fff;
          font-size: 0.9rem;
        }
      }
      .content-card-episodes {
        width: 240px;
        margin: 0 0 0 20px;
        max-height: 310px;
        overflow: auto;
        .content-card-episodes-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #fff;
          border-radius: 4px;
          line-height: 1.2;
          color: #fff;
          transition: background-color 0.5s;
          cursor: pointer;
          margin: 10px 0;
          padding: 3px 0;
          &:hover {
            background-color: #b0243b;
          }
        }
      }
    }
  }

  // 网易云音乐单独使用样式
  .wyyyy {
    position: relative;
    cursor: pointer;
    .image-back {
      top: 0;
      left: 0;
      width: 100%;
      filter: blur(70px) brightness(50%);
      height: 150px;
      object-fit: cover;
    }
    .content-card {
      top: 0;
      left: 0;
      position: absolute;
      height: 100%;
      width: 100%;
      // 左边 图片大小在此控制
      .record-area {
        position: absolute;
        height: 120px;
        top: 15px;
        left: 50px;
        width: 120px;
        // 动画效果
        .record-area-record {
          transform: perspective(500px);
          transition: transform 0.5s ease, opacity 0.5s ease;
          height: 100%;
          position: absolute;
          left: 0;
          z-index: 2;
          overflow: hidden;
          .record-image {
            height: 100%;
            overflow: hidden;
          }
          &:after {
            content: "";
            position: absolute;
            top: -58%;
            left: -18%;
            width: 150%;
            height: 150%;
            background-image: linear-gradient(
              hsla(0, 0%, 100%, 0.2),
              hsla(0, 0%, 100%, 0.25) 48%,
              hsla(0, 0%, 100%, 0) 52%
            );
            transform: rotate(24deg);
            opacity: 0.5;
            transition: transform 0.5s ease, opacity 0.5s ease;
            pointer-events: none;
          }
        }

        .record-image-back {
          position: absolute;
          left: 0;
          top: 5px;
          height: 110px;
          transition: all 0.5s;
          left: 35px;
        }
      }
      // 右边
      .record-info {
        transition: all 0.5s;
        font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei;
        font-size: 1.8rem;
        color: #fff;
        width: 380px;
        text-align: center;
        right: 0;
        position: absolute;
        top: 60px;
        padding: 10px 0;
      }
      .record-size {
        transition: all 0.5s;
        position: absolute;
        bottom: 17px;
        right: 330px;
        font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei;
        color: #fff;
        font-size: 1.2rem;
        opacity: 0;
      }
      .record-btn {
        transition: all 0.5s;
        font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei;
        font-size: 1.2rem;
        right: 15px;
        position: absolute;
        bottom: 15px;
        color: #fff;
        border: 1px solid #fff;
        padding: 3px 5px;
        white-space: nowrap;
        width: 18px;
        overflow: hidden;
        border-radius: 4px;
      }
    }
    &:hover {
      // 动画效果
      .record-area {
        .record-area-record {
          box-shadow: 0 7px 15px 4px rgb(0 0 0 / 30%);
          transform: perspective(500px) rotateX(8deg) scale(1.15);
        }
        .record-area-record:after {
          transform: perspective(500px) rotate(24deg) translateY(16%);
          opacity: 1;
        }
        .record-image-back {
          left: 60px;
          transform: rotateX(8deg) scale(1.15);
        }
      }

      .content-card {
        // 右边
        .record-info {
          font-size: 1.5rem;
          background: #454545;
          text-align: center;
          top: 30px;
          border-radius: 4px;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .record-size {
          opacity: 1;
        }
        .record-btn {
          width: 170px;
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