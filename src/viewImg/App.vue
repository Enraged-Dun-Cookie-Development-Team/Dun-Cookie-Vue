<!--
 * @Author: your name
 * @Date: 2021-06-26 15:14:20
 * @LastEditTime: 2021-06-27 21:30:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Dun-Cookie-Vue\src\viewImg\App.vue
-->
<template>
  <div id="app" v-loading="load">
    <div class="img-info" v-show="!load">
      <h3>图片信息</h3>
      <div>链接：{{ this.info.currentSrc }}</div>
      <div>{{ this.info.naturalWidth }} × {{ this.info.naturalHeight }}</div>
    </div>
        <img class="img" :src="img" :class="showInfo?'show-info':''" @click="viewInfo" @load="imgOnload($event)"/>
<!--    <img class="img" src="http://wx1.sinaimg.cn/bmiddle/006QZngZgy1gt2gik67e8j31hc0u07ht.jpg"
         :class="showInfo?'show-info':''" @click="viewInfo" @load="imgOnload($event)"/>-->
  </div>
</template>

<script>
import PlatformHelper from '../common/platform/PlatformHelper';

export default {
  name: "ViewImg",
  created() {
    PlatformHelper.Message.registerListener('view-img', 'view-img', data => {
      this.item = data.item;
      this.img = data.img;
      this.winId = data.winId;
    });
  },
  mounted() {
  },

  data() {
    return {
      load: true,
      item: null,
      img: null,
      info: {},
      showInfo: false,
    };
  },
  computed: {},
  methods: {
    imgOnload(data) {
      this.load = false;
      this.info.currentSrc = this.img;
      this.info.naturalHeight = data.target.height;
      this.info.naturalWidth = data.target.width;
    },
    // 查看图片信息
    viewInfo() {
      this.showInfo = !this.showInfo;
    }
  },
};
</script>

<style lang="less" scoped>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
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
}
</style>
