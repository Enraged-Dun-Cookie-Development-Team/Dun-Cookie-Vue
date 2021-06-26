<template>
  <div v-if="searchShow">
    <input type="text" />
  </div>
</template>
<script>
export default {
  name: "search",
  props: ["searchShow"],
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
    return {
    
    };
  },
  computed: {},
  beforeDestroy() {},
  methods: {},
};
</script>