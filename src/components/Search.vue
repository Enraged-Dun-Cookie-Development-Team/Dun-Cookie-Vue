<template>
  <div>
    <div class="search-area" :class="searchShow ? 'show' : ''">
      <input
          type="text"
          class="input-border"
          v-model="searchText"
          placeholder="输入两次@查找企鹅物流数据"
          ref="searchText"
      />
    </div>
    <div class="search-area-penguin-name" v-show="penguinShow" @click="openUrl('https://penguin-stats.cn/')">
      【数据支持：企鹅物流】
    </div>
    <el-card class="search-area-penguin" :class="penguinShow ? 'show' : ''">
      <el-collapse v-model="activeNames" v-for="(item,index) in penguinSearchList" @change="getPenguinDate(index)">
        <el-collapse-item :title="item.name">
          <div v-if="item.loading">查找中……</div>
          <div v-if="!item.matrix">没有相关数据</div>
          <div v-else>
           <el-card v-for="info in item.matrix">
             <div><span>{{item.stage.code}}</span><span>{{item/per}}%</span></div>
             <div><span>期望理智：{{item.cost}}</span><span>期望时间：{{item.time}}</span></div>
           </el-card>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>
<script>


import PenguinStatistics from "@/common/sync/PenguinStatisticsInfo";
import PlatformHelper from '@/common/platform/PlatformHelper';
import TimeUtil from "@/common/util/TimeUtil";

;

export default {
  name: "search",
  props: ["searchShow"],
  components: {},
  created() {
  },
  mounted() {
    this.init();
  },
  watch: {
    searchShow(value) {
      if (value) {
        this.$refs.searchText.focus();
      } else {
        this.$refs.searchText.blur();
      }
    },
    searchText(value) {
      this.loadPenguin(value);
      this.$emit('searchTextChange', value);
    },
  },
  data() {
    return {
      searchText: "",
      penguinShow: false,
      activeNames: "",
      penguinSearchList: [],
      penguin: {}
    };
  },
  computed: {},
  beforeDestroy() {
  },
  methods: {
    openUrl: PlatformHelper.Tabs.create,
    init() {
      PenguinStatistics.GetItems().then(penguinStatisticsInfo => {
        this.penguin = penguinStatisticsInfo;
      })
    },
    clearText() {
      this.searchText = null;
    },
    loadPenguin(text) {
      if (text && text.split('@@').length > 1) {
        this.penguinShow = true;
        this.activeNames = "";
        this.penguinSearchList = PenguinStatistics.GetItemByText(text.split('@@')[1]);
      } else {
        this.penguinShow = false;
        this.penguinSearchList = [];
      }
    },
    getPenguinDate(index) {
      let item = this.penguinSearchList[index];
      if (item.matrix) {
        return;
      }
      item.loading = true;
      PenguinStatistics.GetItemInfo(item.itemId).then(data => {
        let matrix = JSON.parse(data)?.matrix;
        matrix.forEach(item => {
          let stage = PenguinStatistics.GetStageInfo(item.stageId);
          let zone = PenguinStatistics.GetZonesInfo(stage.zoneId);
          item.stage = stage;
          item.zone = zone;
          item.per = Math.round(item.quantity / item.times * 10000) / 100.00
          let p = item.quantity / item.times;
          item.cost = Math.ceil(stage.apCost / p);
          item.time = TimeUtil.secondToDate((stage.minClearTime / 1000) / p);
          item.isGacha = stage.isGacha ? true : false;
        })
        matrix.sort((x, y) => x.p > y.p ? -1 : 1);
        this.$set(item, 'matrix', matrix);
        this.$set(item, 'loading', false);
      });
    }
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

.search-area-penguin-name {
  bottom: 10px;
  width: 100%;
  position: absolute;
  text-align: center;
  opacity: 0.3;
  cursor: pointer;
}

.search-area-penguin {
  width: 90%;
  left: 5%;
  position: fixed;
  top: -180px;
  z-index: 11;
  max-height: 75%;
  overflow: scroll;

  &.show {
    top: 180px;
    opacity: 1;
  }

  .matrix-tag {
    margin: 0 5px 5px 0;
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
