<template>
  <div id="app" v-loading="load">
    <img :src="img" @load="imgOnload($event)" />
  </div>
</template>

<script>
export default {
  name: "ViewImg",
  created() {
    chrome.runtime.onMessage.addListener((data) => {
      console.log(data);
      if (data.info != 'tab') {
        return;
      }
      this.item = data.item;
      this.img = data.img;
      this.winId = data.winId;
    });

  },
  mounted() {
  },

  data() {
    return {
      load: false,
      item: null,
      img: null,
      info: null,
    };
  },
  computed: {},
  methods: {
    imgOnload(data) {
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
  align-items:  flex-start;
  justify-content: center;
}
</style>
