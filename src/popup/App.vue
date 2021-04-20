<template>
  <div id="app">
    <el-drawer
      :visible.sync="drawer"
      :show-close="false"
      direction="ttb"
      size="330px"
    >
      <el-divider content-position="left">饼的发源地</el-divider>
      <el-row type="flex" justify="center">
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://space.bilibili.com/161775300/dynamic')"
          >去B站吃饼</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://weibo.com/arknights')"
          >去微博吃饼</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://weibo.com/u/6441489862')"
          >朝陇山微博</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://weibo.com/u/7506039414')"
          >一拾山微博</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://monster-siren.hypergryph.com/')"
          >塞壬官网</el-button
        >
      </el-row>
      <el-divider content-position="left">快捷链接</el-divider>
      <el-row type="flex" justify="center">
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('http://prts.wiki/')"
          >PRTS Wiki</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://map.ark-nights.com/')"
           title="by Houdou"
          >PRTS.Map</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://penguin-stats.io/')"
          >企鹅物流</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://www.bigfun.cn/tools/aktools/')"
          title="by 一只灰喵"
          >明日方舟工具箱</el-button
        >
         <el-button
          size="medium"
          type="primary"
          @click="openUrl('https://opssr.net/')"
          >源石作战室</el-button
        >
      </el-row>
      <el-divider content-position="left">调整蹲饼器</el-divider>
      <el-row type="flex" justify="center">
        <el-button
          size="medium"
          type="success"
          :disabled="isReload"
          @click="reload"
          >{{ isReload ? "找饼中……" : "强制刷新" }}</el-button
        >
        <el-button size="medium" type="warning" @click="openSetting"
          >设置</el-button
        >
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
      {{ version }}
      <span v-if="cardlist.length == 0" style="color: red"
        >【无内容，请检查网络】</span
      >
      <span v-else>【已蹲饼{{ dunIndex }}次】</span>
    </div>
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) in cardlist"
        :key="index"
        :timestamp="
          item.source == 2 || item.source == 5
            ? timespanToDay(item.time, 2)
            : timespanToDay(item.time)
        "
        placement="top"
        :icon="'headImg' + item.source"
      >
        <!-- 0 b服 1微博 2通讯组 3朝陇山 4一拾山 5塞壬唱片 -->
        <el-card class="card" :class="'font-size-' + fontSizeClass">
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
              <el-row class="margintb" v-if="setting.imgshow && item.image">
                <div
                  class="img-area"
                  @click="changeShowAllImage(item.image)"
                  :class="showAllImage.includes(item.image) ? 'show-all' : ''"
                >
                  <div
                    v-if="
                      item.imageList != undefined && item.imageList.length > 1
                    "
                  >
                    <el-row :gutter="5">
                      <el-col v-for="img in item.imageList" :key="img" :span="8"
                        ><img :src="img" class="img" />
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else>
                    <img :src="item.image" class="img" />
                  </div>
                </div>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
export default {
  name: "app",
  mounted() {
    this.init();
  },

  data() {
    return {
      getBackgroundPage: chrome.extension.getBackgroundPage(),
      cardlist: [],
      version: "蹲饼",
      dunIndex: 0,
      setting: {},
      drawer: false, //打开菜单
      isReload: false, //是否正在刷新
      showImage: true,
      showAllImage: [],
    };
  },
  computed: {},
  methods: {
    init() {
      this.version = `蹲饼 V${this.getBackgroundPage.Kaze.version}`;
      this.dunIndex = this.getBackgroundPage.Kaze.dunIndex;
      this.getbackgroundData();
      this.setting = this.getBackgroundPage.Kaze.setting;
      this.fontSizeClass = this.setting.fontsize;
      setInterval(() => {
        this.getbackgroundData();
        this.dunIndex = this.getBackgroundPage.Kaze.dunIndex;
      }, this.setting.time * 500);
    },
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
    getbackgroundData() {
      let {
        weibo = [],
        cho3 = [],
        yj = [],
        bili = [],
        ys3 = [],
        sr = [],
      } = this.getBackgroundPage.Kaze.cardlistdm;
      this.cardlist = [...weibo, ...cho3, ...yj, ...bili, ...ys3, ...sr]
        .map((x) => {
          x.dynamicInfo = x.dynamicInfo.replace(/\n/g, "<br/>");
          return x;
        })
        .sort((x, y) => y.time - x.time);
    },
    reload() {
      this.getBackgroundPage.Kaze.GetData();
      this.isReload = true;
      this.drawer = false;
      this.$message({
        offset: 50,
        center: true,
        message: "正在找饼，请保持网络畅通",
        type: "warning",
      });
      setTimeout(() => {
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
      this.$copyText(
        `${item.dynamicInfo.replace(
          /<br\/>/g,
          `
`
        )}    
${item.url}

数据由 ${this.version} 收集`
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

/deep/ .el-timeline {
  margin-top: 50px;
  padding-left: 25px;
  height: 520px;
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
        background: url("/assets/image/mrfz.ico") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg3::before {
        background: url("/assets/image/cho3.jpg") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg4::before {
        background: url("/assets/image/ys3.jpg") no-repeat center, #fff;
        background-size: cover;
      }
      &.headImg5::before {
        background: url("/assets/image/sr.ico") no-repeat center, #fff;
        background-size: cover;
      }
    }
  }
}
</style>