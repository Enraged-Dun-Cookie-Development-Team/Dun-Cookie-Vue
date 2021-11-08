<template>
  <div id="app">
      <el-button @click="start">

      </el-button>
  </div>
</template>

<script>
import CountDown from '../common/sync/CountDownInfo';

export default {
  name: "time",
  components: {},
  mounted() {
  },

  data() {
    return {
    };
  },
  computed: {},
  methods:{
    start(){
      CountDown.StartCountDown({
        time:new Date(),
        title:'fuck',
        remark:'remark'
      })
    }
  },

};
</script>

<style></style>

