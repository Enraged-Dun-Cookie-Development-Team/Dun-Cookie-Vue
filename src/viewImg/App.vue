<template>
  <div id="app" v-loading="load" @click="showInfo = !showInfo">
    <div v-show="!load" class="img-info">
      <h3>图片信息</h3>
      <div>{{ info.currentSrc }}</div>
      <div>{{ info.naturalWidth }} × {{ info.naturalHeight }}</div>
    </div>
    <div ref="imgScroll" :class="overflow ? 'imgScrollOverflow' : 'imgScroll'">
      <img :class="showInfo ? 'show-info' : ''" :src="img" class="img" @load="imgOnload($event)" />
    </div>
    <div v-show="pageShow" class="turnPage">
      <span class="turnPage-btn-area">
        <span class="el-icon-arrow-left" @click.stop="leftPage"></span>
        <span class="el-icon-arrow-right" @click.stop="rightPage"></span>
      </span>
      <span class="turnNumber">第{{ pageNow + 1 }}页，共{{ pageAll }}页</span>
    </div>
  </div>
</template>

<script>
import PlatformHelper from '../common/platform/PlatformHelper';

export default {
  name: 'ViewImg',

  data() {
    return {
      load: true,
      imageList: [],
      img: null,
      info: {},
      showInfo: false,
      pageNow: 0,
      pageAll: 0,
      pageShow: false,
      overflow: false,
    };
  },
  computed: {},
  created() {
    this.init();
  },
  mounted() {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        // 关闭窗口
        PlatformHelper.Windows.remove(this.winId);
      } else if (e.key === 'ArrowLeft') {
        this.leftPage();
        // 左翻页
      } else if (e.key === 'ArrowRight') {
        this.rightPage();
        // 右翻页
      }
    });
  },
  methods: {
    async init() {
      this.winId = await PlatformHelper.Storage.getLocalStorage('windowTabId');
      this.imageList = await PlatformHelper.Storage.getLocalStorage('imageList');
      this.img = await PlatformHelper.Storage.getLocalStorage('imgNow');
      if (this.imageList) {
        this.pageShow = true;
        this.pageAll = this.imageList.length;
        this.pageNow = this.imageList.findIndex((x) => x === this.img);
      }
    },
    imgOnload(data) {
      this.load = false;
      this.info.currentSrc = this.img;
      this.info.naturalHeight = data.target.naturalHeight;
      this.info.naturalWidth = data.target.naturalWidth;

      this.overflow = false;
      const appendHeight = window.outerHeight - window.innerHeight;
      const appendWidth = window.outerWidth - window.innerWidth;
      let newWidth = this.info.naturalWidth + appendWidth;
      if (newWidth > window.screen.width) {
        newWidth = window.screen.width - 100;
        this.overflow = true;
      }
      let newHeight = this.info.naturalHeight + appendHeight;
      if (newHeight > window.screen.height) {
        newHeight = window.screen.height - 100;
        this.overflow = true;
      }
      PlatformHelper.Windows.update(this.winId, newWidth, newHeight);
    },
    leftPage() {
      if (this.pageNow > 0) {
        this.img = this.imageList[--this.pageNow];
        let scrollArea = this.$refs.imgScroll;
        scrollArea.scrollTop = 0;
      }
    },
    rightPage() {
      if (this.pageNow < this.pageAll - 1) {
        this.img = this.imageList[++this.pageNow];
        let scrollArea = this.$refs.imgScroll;
        scrollArea.scrollTop = 0;
      }
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  perspective: 1000px;

  .img-info {
    position: fixed;
    z-index: -1;
    width: 100%;
    text-align: center;
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
    font-size: 1rem;
    font-weight: bold;
    border-radius: 3px;
    color: #23ade5;
    background: transparent;
    user-select: none;

    .turnPage-btn-area {
      display: flex;
      justify-content: space-around;
      width: 100%;
    }

    .el-icon-arrow-left,
    .el-icon-arrow-right {
      position: fixed;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 10vw;
      min-width: 40px;
      height: 100vh;
      font-size: 25px;
      border-radius: 5px;
      color: #fff;
      background: rgba(111, 111, 111, 0);
      transition: all 0.5s;
      cursor: pointer;

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
      left: 50%;
      text-align: center;
      opacity: 0.3;
      transition: all 0.5s;
      transform: translate(-50%, -25%);
    }
  }

  &:hover .turnNumber {
    opacity: 1;
  }

  .imgScroll {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .imgScrollOverflow {
    overflow: auto;
    width: 100%;
    height: 100%;
  }
}
</style>
