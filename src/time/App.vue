<template>
  <div id="app">
    <div class="title-area">
      <div class="title">
<!--        <a href="http://www.ceobecanteen.top/" target="_blank">-->
<!--          <el-image class="img" src="../assets/image/icon.png"></el-image>-->
<!--        </a>-->
<!--        <div class="name-area">-->
<!--          小刻食堂倒计时模块-->
<!--        </div>-->
      </div>
      <el-card class="card-form">
        <el-input v-model="form.title" width="300px"  maxlength="15" placeholder="倒计时名称"></el-input>
        <div class="row-two">
          <el-time-picker
              clearable
              value-format="HH:mm:ss"
              v-model="form.time"
              :default-value="new Date('1970-01-01 00:00:00')"
              placeholder="倒计时时长">
          </el-time-picker>
          <el-button @click="start">
            添加
          </el-button>
        </div>
      </el-card>
    </div>

    <el-divider></el-divider>
    <div class="card-area countdown-area">
      <el-card :key="item.id" class="card" v-for="(item) in countDownList" :class="item.isClose?'is-close':''">
        <div class="close" @click="removeCountDown(item)"><i class="el-icon-circle-close"></i></div>
        <div class="title">{{item.name}}</div>
        <div class="start-time">Start time : {{stringToFormat(item.data.startTime)}}</div>
        <div class="end-time">Ending time : {{stringToFormat(item.data.endTime)}}</div>
        <div class="clock-area">
          <flip-countdown :showDays="false" :deadline="stringToFormat(item.data.endTime)" @timeElapsed="timeElapsedHandler(item)"></flip-countdown>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import CountDown from '../common/sync/CountDownInfo';
import PlatformHelper from "@/common/platform/PlatformHelper";
import TimeUtil from "@/common/util/TimeUtil";
import FlipCountdown from 'vue2-flip-countdown'
export default {
  name: "time",
  components: {
    FlipCountdown
  },
  mounted() {
    this.getAllCountDownLocalStorage();
  },
  data() {
    return {
      form:{},
      countDownList:[],
    };
  },
  computed: {},
  methods:{
    start(){
      let addTime = this.form.time.split(':')
      let endTime = TimeUtil.dateAddTime(addTime[0],addTime[1],addTime[2]);
      let countDm = {
        startTime:new Date(),
        endTime,
        title:this.form.title,
      }
      CountDown.StartCountDown({
        ...countDm,
        remark:`将于${TimeUtil.format(endTime,'MM-dd hh:mm')}进行提醒`
      }).then(_=>{
        this.getAllCountDownLocalStorage();
        this.form = {};
      })
    },

    removeCountDown(item){
      CountDown.removeCountDown(item).then(_=>{
        this.$notify({
          title: `已删除 ${item.name}`,
          duration: 3000
        });
        this.getAllCountDownLocalStorage();
      })
    },

    getAllCountDownLocalStorage(){
      CountDown.getCountDownLocalStorage().then(data=>{
        this.countDownList = JSON.parse(data).map(item => {
          return {
            ...item,
            isClose: TimeUtil.calcDiff(item.data.endTime) == '' ? true : false,
            id: parseInt(Math.random() * 10000)
          }
        })
      })
    },

    stringToFormat(time){
      return TimeUtil.format(time,'yyyy-MM-dd hh:mm:ss')
    },

    timeElapsedHandler(item){
      let index = this.countDownList.findIndex(x=>x.name == item.name);
      this.countDownList[index].isClose = true;
    }
  },

};
</script>

<style lang="less" scoped>
@font-face {
  font-family: Geometos;
  src: url('../assets/font/Geometos.ttf');
}

.title-area{
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #23ade5;
  .title{
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
    .img{
      height: 100px;
    }
  }
  .card-form{
    width: 500px;
    margin: 10px;
    .row-two{
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.countdown-area{
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  .card{
    margin: 10px 0;
    width: 32%;
    height: 200px;
    max-height: 200px;
    overflow: auto;
    position: relative;
    transition: all 0.5s;
    &:hover{
      .close{
        opacity: 1;
      }
    }
    &.is-close{
      background: #ff9c9c;
      .title,.start-time,.end-time{
        color: #ffffff;
      }
    }
    .title,.start-time,.end-time{
      font-family: Geometos,'YaHei';
      position: absolute;
      top: 10px;
      left: 0;
      font-size: 30px;
      color: #666666;
      user-select: none;
      font-weight: 100;
      width: 100%;
      text-align: center;
    }
    .start-time,.end-time{
      top: 50px;
      font-size: 16px;
    }
    .end-time{
      top: 70px;
    }

    .clock-area{
      position: absolute;
      width: 100%;
      left: 0;
      top: 100px;
    }
    .close{
      transition: all 0.5s;
      opacity: 0;
      position: absolute;
      right: 10px;
      top: 10px;
      cursor: pointer;
      font-size: 22px;
      z-index: 9;
    }
  }
}
</style>
<style lang="less">
.countdown-area{
  .clock-area{
    position: absolute;
    width: 100%;
    left: 0;
    top: 90px;
    user-select: none;
    .flip-clock__slot{
      font-family: Geometos;
      font-size: 14px;
    }
    .flip-card__top,
    .flip-card__bottom,
    .flip-card__back-bottom,
    .flip-card__back::before{
      color: #FFFFFF;
    }
  }
}
</style>

