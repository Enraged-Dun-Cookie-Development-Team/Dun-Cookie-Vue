<template>
  <div id="app">
    <div class="title-area">
            <div class="title">
              <a href="http://www.ceobecanteen.top/" target="_blank">
                <el-image class="img" src="../assets/image/icon.png"></el-image>
              </a>
              <div class="name-area">
                小刻食堂倒计时模块
              </div>
            </div>
    </div>
    <div class="count-down-area">
      <el-card class="box-card" :key="item.name" v-for="(item) in countDownList">
        <count-down-flip-clock
            @changeTime="changeTime(item,$event)"
            @endTime="endTime(item)"
            :name="item.name"
            :stopTime="item.stopTime"
            :selectableRange="item.selectableRange"
            :pickerTime="item.pickerTime"></count-down-flip-clock>
      </el-card>
    </div>
  </div>
</template>

<script>
import CountDown from '../common/sync/CountDownInfo';
import PlatformHelper from "@/common/platform/PlatformHelper";
import TimeUtil from "@/common/util/TimeUtil";
import CountDownFlipClock from "../components/countdown/FlipClock";
import {countDown} from "../common/Constants";

export default {
  name: "countDownTime",
  components: {
    // eslint-disable-next-line vue/no-unused-components
    CountDownFlipClock
  },
  mounted() {
    this.getAllCountDownLocalStorage();
  },
  data() {
    return {
      form: {},
      countDownList: []
    };
  },
  computed: {},
  methods: {
    start() {

    },

    changeTime(item, data) {
      let info = {
        ...item,
        ...data
      }
      CountDown.addCountDownLocalStorage(info)
    },
    endTime(data){
      CountDown.removeCountDown(data)
    },

    getAllCountDownLocalStorage() {
      CountDown.getCountDownLocalStorage().then(data => {
        let array = [];
        if (data) {
          let info = [...JSON.parse(data).map(x => x.data), ...countDown];
          info.forEach(item => {
            if (!array.some(x => x.name == item.name)) {
              array.push({
                ...item,
                pickerTime: new Date(item.pickerTime),
                stopTime: item.stopTime ? new Date(item.stopTime) : null
              });
            }
          })
        } else {
          array = countDown;
        }
        this.countDownList = array.sort((x, y) => x.index < y.index ? -1 : 1);
      })
    },

  },

};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: Geometos;
  src: url('../assets/font/Geometos.ttf');
}

.title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #23ade5;

  .title {
    margin: 10px;
    display: flex;
    align-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    font-size: 40px;
    width: 500px;
    color: #ffffff;
    justify-content: space-between;

    .img {
      height: 65px;
    }
  }

}

.count-down-area {
  margin: 30px 30px 0 30px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;

  .box-card {
    height: 180px;
    min-width: 48%;
    margin-bottom: 30px;
  }
}
</style>

