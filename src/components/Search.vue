<template>
  <div class="search-area" :class="searchShow ? 'show' : ''">
    <input
      type="text"
      class="input-border"
      v-model="searchText"
      ref="searchText"
    />
  </div>
</template>
<script>
export default {
  name: "search",
  props: ["searchShow"],
  components: {},
  created() {},
  mounted() {},
  watch: {
    searchShow(value) {
      if (value) {
        this.$refs.searchText.focus();
      } else {
        this.$refs.searchText.blur();
      }
    },
    searchText(value) {
      this.$emit('searchTextChange', value);
    },
  },
  data() {
    return {
      searchText: "",
    };
  },
  computed: {},
  beforeDestroy() {},
  methods: {
    clearText() {
      this.searchText = null;
    },
  },
};
</script>
<style lang="less" scoped>
.search-area {
  height: 120px;
  width: 100%;
  position: fixed;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.5s top;
  top: -180px;
  .input-border {
    outline: none;
    width: 80%;
    height: 50px;
    font-size: 42px;
    font-family: "Geometos";
    padding: 8px;
    text-align: center;
    font-weight: bold;
    border: 0;
    background: #ffffff5c;
    animation: 10s textAnimate infinite linear;
    // box-shadow: 0 0 40px 0px #23ade5;
    // color: #23ade5;
  }
  &.show {
    top: 32px;
    opacity: 1;
  }
}

@keyframes textAnimate {
  0%,
  100% {
    box-shadow: 0 0 40px 0px #23ade5;
    color: #23ade5;
  }
  25% {
    box-shadow: 9px -9px 50px 15px #ff5ea7;
    color: #ff5ea7;
  }
  60% {
    box-shadow: 9px 7px 80px 0px #ff6530;
    color: #ff6530;
  }
  80% {
    box-shadow: -9px 5px 60px -10px #010fcb;
    color: #010fcb;
  }
}
</style> 
