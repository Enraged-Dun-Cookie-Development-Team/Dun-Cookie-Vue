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
    <img :src="img" @load="imgOnload($event)" />
  </div>
</template>

<script>
import { getLocalStorage } from "../assets/JS/common";
export default {
  name: "ViewImg",
  created() {},
  mounted() {
    this.getLocalStorage("viewImg").then(({ item, img, winId }) => {
      this.item = item;
      this.img = img;
      this.winId = winId;
    });
  },

  data() {
    return {
      load: true,
      item: null,
      img: null,
      info: null,
    };
  },
  computed: {},
  methods: {
    getLocalStorage,
    imgOnload(data) {
      this.load = false;
      this.info = {
        currentSrc: data.currentSrc,
        naturalHeight: data.naturalHeight,
        naturalWidth: data.naturalWidth,
      };
    },
  },
};
</script>

<style scoped>
#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  justify-content: flex-start;
}
</style>