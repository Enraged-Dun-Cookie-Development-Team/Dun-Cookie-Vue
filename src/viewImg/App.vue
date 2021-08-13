<!--
 * @Author: your name
 * @Date: 2021-06-26 15:14:20
 * @LastEditTime: 2021-06-27 21:30:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Dun-Cookie-Vue\src\viewImg\App.vue
-->
<template>
  <div id="app" @click="showInfo = !showInfo" v-loading="load">
    <div class="img-info" v-show="!load">
      <h3>图片信息</h3>
      <div>{{ this.info.currentSrc }}</div>
      <div>{{ this.info.naturalWidth }} × {{ this.info.naturalHeight }}</div>
    </div>
    <div style="width: 100%; height: 100%; overflow: auto">
      <img
        class="img"
        :src="img"
        :class="showInfo ? 'show-info' : ''"
        @load="imgOnload($event)"
      />
    </div>
    <div class="turnPage" v-show="pageShow">
      <span class="turnPage-btn-area">
        <span @click.stop="leftPage" class="el-icon-arrow-left"></span>
        <span @click.stop="rightPage" class="el-icon-arrow-right"></span>
      </span>
      <span class="turnNumber">第{{ pageNow + 1 }}页，共{{ pageAll }}页</span>
    </div>
  </div>
</template>

<script>
import PlatformHelper from "../common/platform/PlatformHelper";

export default {
  name: "ViewImg",
  created() {
    PlatformHelper.Message.registerListener("view-img", "view-img", (data) => {
      this.item = data.item;
      this.img = data.img;
      this.winId = data.winId;
      if (this.item.imageList) {
        this.pageShow = true;
        this.pageAll = this.item.imageList.length;
        this.pageNow = this.item.imageList.findIndex((x) => x == this.img);
      }
    });
  },
  mounted() {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        // 关闭窗口
        chrome.windows.remove(this.winId);
      } else if (e.key === "ArrowLeft") {
        this.leftPage();
        // 左翻页
      } else if (e.key === "ArrowRight") {
        this.rightPage();
        // 右翻页
      }
    });
  },

  data() {
    return {
      load: true,
      item: {},
      img: null,
      info: {},
      showInfo: false,
      pageNow: 0,
      pageAll: 0,
      pageShow: false,
    };
  },
  computed: {},
  methods: {
    imgOnload(data) {
      this.load = false;
      this.info.currentSrc = this.img;
      this.info.naturalHeight =
        data.target.height + 39 > window.screen.height
          ? window.screen.height
          : data.target.height + 39;
      this.info.naturalWidth =
        data.target.width + 31 > window.screen.width
          ? window.screen.width
          : data.target.width + 31;
      chrome.windows.update(this.winId, {
        width: this.info.naturalWidth,
        height: this.info.naturalHeight,
      });
    },
    leftPage() {
      if (this.pageNow > 0) {
        this.img = this.item.imageList[--this.pageNow];
      }
    },
    rightPage() {
      if (this.pageNow < this.pageAll - 1) {
        this.img = this.item.imageList[++this.pageNow];
      }
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  height: 100vh;
  width: 100vw;
  //overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  perspective: 1000px;

  .img-info {
    position: fixed;
    width: 100%;
    text-align: center;
    z-index: -1;
  }

  .img {
    transition: all 1s;

    &.show-info {
      transform-style: preserve-3d;
      transform-origin: bottom;
      transform: rotateX(50deg);
      box-shadow: 0 0 30px -5px #23ade5;
    }
  }

  .turnPage {
    position: fixed;
    color: #23ade5;
    font-size: 1rem;
    font-weight: bold;
    background: transparent;
    border-radius: 3px;
    user-select: none;

    &:hover {
      opacity: 1;
    }

    .turnPage-btn-area {
      display: flex;
      width: 100%;
      justify-content: space-around;
    }

    .el-icon-arrow-left,
    .el-icon-arrow-right {
      position: fixed;
      top: 0;
      height: 100vh;
      width: 10vw;
      min-width: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 25px;
      border-radius: 5px;
      background: rgba(111, 111, 111, 0);
      color: #ffffff;
      cursor: pointer;
      transition: all 0.5s;
      &:hover {
        background: rgba(111, 111, 111, 0.7);
      }
    }
    .el-icon-arrow-left {
      left: 0;
    }
    .el-icon-arrow-right {
      right: 0;
    }

    .turnNumber {
      position: fixed;
      bottom: 30px;
      text-align: center;
      transform: translate(-50%, -25%);
      left: 50%;
    }
  }
}
</style>
