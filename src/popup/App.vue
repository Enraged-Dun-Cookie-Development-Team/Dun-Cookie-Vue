<template>
  <div :class="setting.outsideClass">
    <div id="app">
      <el-drawer
        :visible.sync="drawer"
        :show-close="false"
        direction="ttb"
        size="440px"
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
        <el-row type="flex" justify="center" class="drawer-btn-area">
          <el-tooltip
            :key="item.img"
            v-for="item in quickJump.url"
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
        <el-divider content-position="left">调整蹲饼器</el-divider>
        <el-row type="flex" justify="center">
          <el-tooltip content="刷新" placement="top">
            <el-button
              type="primary"
              :loading="isReload"
              @click="reload"
              icon="el-icon-refresh"
            ></el-button>
          </el-tooltip>

          <!-- <el-tooltip v-if="isNew" content="检测更新" placement="top">
            <el-button
              type="primary"
              @click="getUpdateInfo"
              icon="el-icon-upload2"
            ></el-button>
          </el-tooltip> -->

          <el-tooltip content="点个star" placement="top">
            <el-button
              type="primary"
              @click="openGithub"
              icon="el-icon-star-off"
            ></el-button>
          </el-tooltip>

          <el-tooltip content="设置" placement="top">
            <el-button
              type="primary"
              icon="el-icon-setting"
              @click="openSetting"
            ></el-button>
          </el-tooltip>
        </el-row>
        <div style="text-align: right; margin-right: 10px">
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
            :interval="5000"
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
} from "../assets/JS/common";
export default {
  name: "app",
  components: { countTo, TimeLine },
  mounted() {
    this.init();
  },

  data() {
    return {
      show: false,
      isNew: false,
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
      loading: true, // 初始化加载
    };
  },
  computed: {},
  methods: {
    numberOrEnNameToName,
    numberOrEnNameToIconSrc,
    timespanToDay,
    Get,
    init() {
      setTimeout(() => {
        this.getCardlist();
        this.getSaveInfo();
        this.getSetting();
        this.getDunInfo();
        this.getOnlineSpeak();
      }, 1);
    },

    // 获取后台数据
    getLocalStorage(name) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([name], (result) => {
          if (result) {
            resolve(result[name]);
            return;
          }
          resolve(null);
        });
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
          // console.log(this.setting);
          setInterval(() => {
            this.getCardlist();
            this.getDunInfo();
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
      var urlToOpen = chrome.extension.getURL("options.html");
      chrome.tabs.create({
        url: urlToOpen,
      });
    },

    openUpdate() {
      var urlToOpen = chrome.extension.getURL("update.html");
      chrome.tabs.create({
        url: urlToOpen,
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
  @shadow: "shadow-@{theme}"; // 卡片的阴影
  @hover: "hover-@{theme}"; // 按钮hover颜色

  #app {
    /deep/ a {
      color: @@content!important;
    }

    // 抵消body的margin：8px
    // margin: -8px;
    background-color: @@bgColor;
    // border: 8px @@bgColor solid;
    width: 700px;
    height: 600px;
    overflow: auto;
  }

  .color-blue {
    color: #23ade5;
  }

  ::-webkit-scrollbar {
    width: 0 !important;
  }
  ::-webkit-scrollbar {
    width: 0 !important;
    height: 0;
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
  .online-blue {
    color: #23ade5;
  }
  .online-red {
    color: #23ade5;
  }
}
</style>