<template>
  <div id="app">
    <el-drawer
      :visible.sync="drawer"
      :show-close="false"
      direction="ttb"
      size="350px"
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
      <el-divider content-position="left">快捷链接</el-divider>
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

        <el-tooltip content="检测更新" placement="top">
          <el-button
            type="primary"
            @click="getUpdateInfo"
            icon="el-icon-upload2"
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
      <span v-if="cardlist.length == 0" style="color: red"
        >【无内容，请检查网络】</span
      >
      <!-- <span v-else>【已蹲饼{{ dunInfo.dunIndex }}次】</span> -->
      <span v-else
        >【已蹲饼
        <countTo
          :startVal="oldDunIndex"
          :endVal="dunInfo.dunIndex"
          :duration="3000"
        ></countTo
        >次】</span
      >
    </div>
    <div id="content">
      <el-card shadow="always" class="info-card">
        这是软件开发者给大家的话，从线上获取<br/>
        能换行
        <div style="color:red">能加HTML码</div>
      </el-card>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in cardlist"
          :key="index"
          :timestamp="
            item.source == 2 || item.source == 5 || item.source == 7
              ? timespanToDay(item.time, 2)
              : timespanToDay(item.time)
          "
          placement="top"
          :icon="'headImg' + item.source"
        >
          <!-- 0 b服 1微博 2通讯组 3朝陇山 4一拾山 5塞壬唱片 -->
          <el-card class="card" :class="'font-size-' + setting.fontsize">
            <div>
              <el-button
                class="to-copy-btn"
                size="small"
                @click="copyData(item)"
                title="复制该条内容及链接"
                ><i class="el-icon-document-copy"></i
              ></el-button>
              <el-button
                class="to-url-btn"
                size="small"
                title="前往饼之发源地"
                @click="openUrl(item.url)"
                ><i class="el-icon-right"></i
              ></el-button>
              <span class="is-top-info" v-if="item.isTop">
                <span class="color-blue"
                  >【当前条目在微博的时间线内为置顶状态】</span
                >
              </span>
              <el-row
                type="flex"
                justify="space-between"
                align="middle"
                class="margintb"
              >
              </el-row>
              <div :ref="'index_' + index">
                <el-row class="margintb">
                  <div v-html="item.dynamicInfo"></div>
                </el-row>

                <transition name="el-fade-in-linear">
                  <el-row
                    class="margintb"
                    v-if="imgShow && setting.imgshow && item.image"
                  >
                    <div
                      class="img-area"
                      @click="changeShowAllImage(item.image)"
                      :class="
                        showAllImage.includes(item.image) ? 'show-all' : ''
                      "
                    >
                      <div
                        v-if="
                          item.imageList != undefined &&
                          item.imageList.length > 1
                        "
                      >
                        <el-row :gutter="5">
                          <el-col
                            v-for="img in item.imageList"
                            :key="img"
                            :span="8"
                            ><img :src="img" class="img" />
                          </el-col>
                        </el-row>
                      </div>
                      <div v-else>
                        <img :src="item.image" class="img" />
                      </div>
                    </div>
                  </el-row>
                </transition>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";
export default {
  name: "app",
  components: { countTo },
  mounted() {
    this.init();
  },

  data() {
    return {
      // getBackgroundPage: chrome.extension.getBackgroundPage(),
      cardlist: [],
      saveInfo: { setIntervalindex: 0, version: "?.?.??" },
      oldDunIndex: 0,
      dunInfo: {
        dunIndex: 0,
      },
      setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5, 6],
        fontsize: 0,
        imgshow: true,
        isTop: true,
        isPush: true,
      },
      drawer: false, //打开菜单
      isReload: false, //是否正在刷新
      showImage: true,
      showAllImage: [],
      imgShow: false, //延迟展示图片
      quickJump: {
        soure: [
          {
            url: "https://ak.hypergryph.com/#information",
            name: "官方网站",
            img: "/assets/image/mrfz.ico",
          },
          {
            url: "https://space.bilibili.com/161775300/dynamic",
            name: "官方哔哩哔哩",
            img: "/assets/image/bili.ico",
          },
          {
            url: "https://weibo.com/arknights",
            name: "官方微博",
            img: "/assets/image/weibo.ico",
          },
          {
            url: "https://weibo.com/u/6441489862",
            name: "朝陇山微博",
            img: "/assets/image/cho3.jpg",
            radius: true,
          },
          {
            url: "https://weibo.com/u/7506039414",
            name: "一拾山微博",
            img: "/assets/image/ys3.jpg",
            radius: true,
          },
          {
            url: "https://monster-siren.hypergryph.com/",
            name: "塞壬官网",
            img: "/assets/image/sr.ico",
          },
          {
            url: "https://weibo.com/u/7499841383",
            name: "泰拉记事社微博",
            img: "/assets/image/tl.jpg",
            radius: true,
          },
        ],
        tool: [
          {
            url: "http://prts.wiki/",
            name: "PRTS.Wiki",
            img: "/assets/image/akwiki.png",
            radius: true,
          },
          {
            url: "https://mapcn.ark-nights.com",
            name: "PRTS.Map",
            img: "/assets/image/akmap.ico",
            radius: true,
          },
          {
            url: "https://penguin-stats.cn/",
            name: "企鹅物流",
            img: "/assets/image/penguin_stats_logo.webp",
            radius: true,
          },
          {
            url: "https://www.bigfun.cn/tools/aktools/",
            name: "明日方舟工具箱",
            img: "/assets/image/mrgzjjx.png",
            radius: true,
          },
          {
            url: "https://opssr.net/",
            name: "源石作战室",
            img: "/assets/image/yszzs.png",
            radius: true,
          },
        ],
      },
    };
  },
  computed: {},
  methods: {
    init() {
      this.getCardlist();
      this.getSaveInfo();
      this.getSetting();
      this.getDunInfo();
      // 图片卡 先加载dom后加载图片内容
      setTimeout(() => {
        this.imgShow = true;
      }, 1000);
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

    // 检测更新
    getUpdateInfo() {
      chrome.runtime.sendMessage({ info: "getUpdateInfo" });
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
            this.getCardlist();
            this.getDunInfo();
          }, data.time * 500);
        }
      });
    },
    getCardlist() {
      this.getLocalStorage("cardlistdm").then((data) => {
        // console.log(data);
        this.cardlist = Object.values(data)
          .reduce((acc, cur) => [...acc, ...cur], [])
          .sort((x, y) => y.time - x.time)
          .map((x) => {
            x.dynamicInfo = x.dynamicInfo.replace(/\n/g, "<br/>");
            return x;
          });
      });
    },

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

    copyData(item) {
      debugger;
      this.$copyText(
        `${item.dynamicInfo.replace(
          /<br\/>/g,
          `
`
        )}   

${item.url}

数据由 蹲饼${this.saveInfo.version} 收集`
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
    // 以下为数据处理方法
    timespanToDay(date, type = 1) {
      date = new Date(date * 1000);
      let Y = date.getFullYear();
      let M = date.getMonth() + 1;
      let D = date.getDate();
      let h = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();
      if (type == 2) {
        return `${Y}-${this.addZero(M)}-${this.addZero(D)}`;
      }
      return `${Y}-${this.addZero(M)}-${this.addZero(D)} ${this.addZero(
        h
      )}:${this.addZero(m)}:${this.addZero(s)}`;
    },
    addZero(m) {
      return m < 10 ? "0" + m : m;
    },
  },
};
</script>

<style lang="less" scoped>
.color-blue {
  color: #23ade5;
}
#app {
  min-width: 600px;
  height: 580px;
  overflow: auto;
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
  background: linear-gradient(180deg, #fff 60%, transparent);
  position: fixed;
  width: 100%;
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

.card {
  width: 600px;
  margin: 10px 0;

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
    margin: 0 0 10px 0;
  }
  .img-area {
    width: 100%;
    height: 150px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    .img {
      width: 100%;
    }
    &::before {
      content: " ";
      position: absolute;
      bottom: 0;
      height: 50px;
      width: 100%;
      background: linear-gradient(0, #fff, transparent);
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
  }
  .to-copy-btn {
    position: absolute;
    top: -8px;
    right: 50px;
  }
  .is-top-info {
    position: absolute;
    top: 0px;
    left: 220px;
  }
}

/deep/ .el-card__body {
  padding: 0 20px;
}

#content {
  margin-top: 50px;
  .info-card {
    padding: 3px;
    margin: 0px 20px;
  }
}

/deep/ .el-timeline {
  padding-left: 25px;
  overflow: auto;
  padding-top: 20px;
  padding-right: 20px;
  .el-timeline-item__timestamp {
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
        background: url("/assets/image/bili.ico") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg1::before {
        background: url("/assets/image/weibo.ico") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg2::before {
        border-radius: 10px;
        background: url("/assets/image/txz.jpg") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg3::before {
        border-radius: 10px;
        background: url("/assets/image/cho3.jpg") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg4::before {
        border-radius: 10px;
        background: url("/assets/image/ys3.jpg") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg5::before {
        background: url("/assets/image/sr.ico") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg6::before {
        border-radius: 10px;
        background: url("/assets/image/tl.jpg") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg7::before {
        border-radius: 10px;
        background: url("/assets/image/mrfz.ico") no-repeat center, #fff;
        background-size: cover;
      }
    }
  }
}
</style>