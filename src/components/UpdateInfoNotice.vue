<template>
  <el-dialog
      :title="'小刻食堂 V'+updateInfo.v+' 翻新了什么？'"
      :modal-append-to-body="false"
      :visible.sync="showUpdateInfo"
      @closed="closeDialog"
      width="80%">
    <div class="update-info-area" v-html="updateInfo.description"></div>
  </el-dialog>
</template>

<script>
export default {
  name: "UpdateInfoNotice",
  props: ["updateInfo"],
  data() {
    return {
      showUpdateInfo: false,
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      setTimeout(() => {
        this.showUpdateInfo = true;
      }, 1000);
    }
  }
}
</script>