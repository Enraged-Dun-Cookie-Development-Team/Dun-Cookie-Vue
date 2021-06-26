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
      this.$parent.changeFilterText(value);
    },
  },
  data() {
    return {
      searchText: "",
    };
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
  transition: 0.5s top;
  top: -150px;
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
  &.show {
    top: 40px;
    opacity: 1;
  }
}
</style> 