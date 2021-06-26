<template>
  <div class="search-area" v-if="false">
    <input type="text" class="input-border" />
  </div>
</template>
<script>
export default {
  name: "search",
  //   props: ["searchShow"],
  components: {},
  created() {},

  mounted() {
    this.init();
  },
  watch: {
    searchText(value) {
      if (value) {
        this.$nextTick(() => {});
      }
    },
  },
  data() {
    return {};
  },
  computed: {},
  beforeDestroy() {},
  methods: {},
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
    box-shadow: 0 0 40px 0px #23ade5;
    background: #ffffff5c;
    color: #23ade5;
  }
}
</style> 