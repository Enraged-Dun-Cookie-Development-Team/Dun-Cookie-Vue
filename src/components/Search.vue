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
    <div class="search-area-penguin-name" v-show="penguinShow">
      <div
        class="cursor: pointer;"
        @click="openUrl('https://penguin-stats.cn/')"
      >
        数据支持：企鹅物流
      </div>
      <div>
        <el-button
          class="type-button"
          type="primary"
          plain
          @click="changeSort()"
        >
          {{ this.sortType == 0 ? "按掉落百分比排序" : "按单件理智排序" }}
        </el-button>
      </div>
      <div>
        <el-switch
          v-model="showCloseStage"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
        显示/隐藏已关闭关卡
      </div>
    </div>
    <el-card class="search-area-penguin" :class="penguinShow ? 'show' : ''">
      <el-collapse
        v-model="activeNames"
        v-for="(item, index) in penguinSearchList"
        v-bind:key="item.itemId"
        @change="getPenguinDate(index)"
      >
        <el-collapse-item>
          <template slot="title">
            <span
              v-if="item.spriteCoord"
              class="search-area-penguin-penguin-title"
              :style="{
                'background-position': `-${45 * item.spriteCoord[0]}px -${
                  45 * item.spriteCoord[1]
                }px`,
              }"
            ></span>
            <span>{{ item.name }}</span>
          </template>
          <div v-if="item.loading">查找中……</div>
          <div class="info-card-area">
            <el-card
              class="info-card"
              v-show="(info.isOpen || showCloseStage) && sortType == 0"
              v-for="info in item.matrix_per"
              v-bind:key="info.stage.code"
            >
              <div
                class="info-card-title info-card-title-isOpen"
                :class="info.isOpen ? '' : 'info-card-title-close'"
                :title="info.isOpen ? '关卡开启中' : '关卡未开启'"
              >
                <span class="info-card-title-left" :title="info.stage.code">{{
                  info.stage.code
                }}</span>
                <span
                  class="info-card-title-right"
                  :title="info.zone.zoneName"
                  >{{ info.zone.zoneName }}</span
                >
              </div>
              <div class="info-card-body" v-show="!info.isGacha">
                <span title="单件掉率">{{ info.per }}%</span>
                <span title="单件期望理智">{{
                  info.cost == Infinity ? "" : info.cost
                }}</span>
                <span title="单件期望时间">{{
                  info.cost == Infinity ? "不建议本关卡" : info.time
                }}</span>
              </div>
            </el-card>
            <el-card
              class="info-card"
              v-show="(info.isOpen || showCloseStage) && sortType == 1"
              v-for="info in item.matrix_cost"
              v-bind:key="info.stage.code"
            >
              <div
                class="info-card-title info-card-title-isOpen"
                :class="info.isOpen ? '' : 'info-card-title-close'"
                :title="info.isOpen ? '关卡开启中' : '关卡未开启'"
              >
                <span class="info-card-title-left" :title="info.stage.code">{{
                  info.stage.code
                }}</span>
                <span
                  class="info-card-title-right"
                  :title="info.zone.zoneName"
                  >{{ info.zone.zoneName }}</span
                >
              </div>
              <div class="info-card-body" v-show="!info.isGacha">
                <span title="单件掉率">{{ info.per }}%</span>
                <span title="单件期望理智">{{
                  info.cost == Infinity ? "" : info.cost
                }}</span>
                <span title="单件期望时间">{{
                  info.cost == Infinity ? "不建议本关卡" : info.time
                }}</span>
              </div>
            </el-card>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>
<script>
import PenguinStatistics from "@/common/sync/PenguinStatisticsInfo";
import PlatformHelper from "@/common/platform/PlatformHelper";
import TimeUtil from "@/common/util/TimeUtil";

export default {
  name: "search",
  props: ["searchShow"],
  components: {},
  created() {},
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
      this.$emit("searchTextChange", value);
    },
  },
  data() {
    return {
      searchText: "",
      penguinShow: false,
      activeNames: "",
      penguinSearchList: [],
      penguin: {},
      showCloseStage: false,
      sortType: 0,
    };
  },
  computed: {},
  beforeDestroy() {},
  methods: {
    openUrl: PlatformHelper.Tabs.create,
    init() {
      PenguinStatistics.GetItems().then((penguinStatisticsInfo) => {
        this.penguin = penguinStatisticsInfo;
      });
    },
    clearText() {
      this.searchText = null;
    },
    loadPenguin(text) {
      if (text && text.split("@@").length > 1) {
        this.penguinShow = true;
        this.activeNames = "";
        this.penguinSearchList = PenguinStatistics.GetItemByText(
          text.split("@@")[1]
        );
      } else {
        this.penguinShow = false;
        this.penguinSearchList = [];
      }
    },
    getPenguinDate(index) {
      let item = this.penguinSearchList[index];
      if (item.matrix_per && item.matrix_cost) {
        return;
      }
      item.loading = true;
      PenguinStatistics.GetItemInfo(item.itemId).then((data) => {
        let matrix = JSON.parse(data).matrix;
        matrix.forEach((item) => {
          let stage = PenguinStatistics.GetStageInfo(item.stageId);
          let zone = PenguinStatistics.GetZonesInfo(stage.zoneId);
          item.stage = stage;
          item.zone = zone;
          item.per = Math.round((item.quantity / item.times) * 10000) / 100.0;
          let p = item.quantity / item.times;
          item.cost = Math.round((stage.apCost / p) * 100) / 100.0;
          item.time = TimeUtil.secondToDate(stage.minClearTime / 1000 / p);
          item.isGacha = !stage.minClearTime || (stage.isGacha ? true : false);
          item.isOpen = zone.existence.CN.hasOwnProperty("closeTime")
            ? new Date().getTime() >= zone.existence.CN.openTime &&
              new Date().getTime() <= zone.existence.CN.closeTime
            : true;
        });
        let matrix_per = JSON.parse(JSON.stringify(matrix));
        let matrix_cost = JSON.parse(JSON.stringify(matrix));
        matrix_per
          .sort((x, y) => {
            return y.per - x.per;
          })
          .sort((x, y) => {
            if (y.isGacha && !x.isGacha) return -1;
          });
        matrix_cost
          .sort((x, y) => {
            return (y.cost != '' && y.cost != null) - (x.cost != '' && x.cost != null) || x.cost - y.cost;
          })
          .sort((x, y) => {
            if (y.isGacha && !x.isGacha) return -1;
          });
        this.$set(item, "matrix_per", matrix_per);
        this.$set(item, "matrix_cost", matrix_cost);
        this.$set(item, "loading", false);
        console.log(item);
      });
    },
    changeSort() {
      if (this.sortType == 0) {
        this.sortType = 1;
      } else {
        this.sortType = 0;
      }
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

.search-area-penguin-penguin-title {
  margin-right: 10px;
  height: 45px;
  width: 45px;
  background-size: 270px 720px;
  background-image: url("https://penguin-stats.s3.amazonaws.com/sprite/sprite.202109171627.small.png");
}

.search-area-penguin-name {
  bottom: 10px;
  width: 100%;
  position: absolute;
  text-align: center;
  display: flex;
  justify-content: space-around;
  .type-button {
    padding: 1px 15px;
    width: 150px;
  }
}

.search-area-penguin {
  width: 90%;
  left: 5%;
  position: fixed;
  top: -180px;
  z-index: 11;
  max-height: 62vh;
  overflow: scroll;

  &.show {
    top: 180px;
    opacity: 1;
  }

  .info-card-area {
    user-select: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px;

    .info-card {
      min-width: 30%;
      margin: 5px;
      flex: 1;

      .info-card-title,
      .info-card-body {
        display: flex;
        justify-content: space-between;
        position: relative;

        &.info-card-title-isOpen::after {
          position: absolute;
          content: " ";
          top: -30px;
          right: -30px;
          border: 17px transparent solid;
          border-color: transparent transparent transparent #23ade5;
          transform: rotate(310deg);
        }

        &.info-card-title-close::after {
          border-color: transparent transparent transparent red;
        }

        .info-card-title-left {
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .info-card-title-right {
          text-align: right;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
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
