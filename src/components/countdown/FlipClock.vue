<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div id="app">
    <div class="title" @dblclick="stopCountDown">
      {{ name }}
    </div>
    <div v-if="showTime" class="flip-clock" title="双击标题停止倒计时">
      <Flipper :text="hourList[0]" :max="9" />
      <Flipper :text="hourList[1]" :max="9" />
      <em>小时</em>
      <Flipper :text="minutesList[0]" :max="6" />
      <Flipper :text="minutesList[1]" :max="9" />
      <em>分钟</em>
      <Flipper :text="secondsList[0]" :max="6" />
      <Flipper :text="secondsList[1]" :max="9" />
      <em>秒</em>
    </div>
    <div v-else class="end-flip-clock">
      <div class="info">计时已停止，选择时间后将开启倒计时</div>
      <el-time-picker
        v-model="pickerTime"
        :clearable="false"
        :picker-options="{
          selectableRange,
        }"
        placeholder="剩余时间"
        @blur="changeEndTime"
      />
    </div>
  </div>
</template>

<script>
import Flipper from './Flipper';

export default {
  name: 'FlipClock',

  components: {
    Flipper,
  },
  // 名字/终点时间点/时间范围/默认时间点
  props: {
    name: {
      type: String,
      required: true,
    },
    stopTime: {
      type: String,
      required: true,
    },
    selectableRange: {
      type: String,
      required: true,
    },
    pickerTime: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      timer: null,
      hourList: [],
      minutesList: [],
      secondsList: [],
      setIntervalId: null,
      showTime: true,
      stopTimeComponents: null,
    };
  },
  mounted() {
    this.stopTimeComponents = this.stopTime;
    this.start();
  },
  methods: {
    stopCountDown() {
      if (this.setIntervalId != null) {
        clearInterval(this.setIntervalId);
        this.setIntervalId = null;
        this.showTime = false;
        this.$emit('endTime');
      }
    },
    // 初始化数字
    start() {
      if (!this.stopTimeComponents || new Date(this.stopTimeComponents) <= new Date()) {
        this.showTime = false;
        this.$emit('endTime', this.name);
        return;
      }
      let stop = this.stopTimeComponents
        ? new Date(this.stopTimeComponents).getTime()
        : new Date().setSeconds(new Date().getSeconds() + 2);
      this.$emit('changeTime', {
        stopTime: this.stopTimeComponents,
      });
      this.setIntervalId = setInterval(() => {
        let now = new Date().getTime();
        let usedTime = stop - now;
        //计算出小时数
        let hours = Math.floor(usedTime / (3600 * 1000));
        let hoursStr = this.padLeftZero(hours);
        //计算相差分钟数    //计算小时数后剩余的毫秒数
        let leave1 = usedTime % (3600 * 1000);
        let minutes = Math.floor(leave1 / (60 * 1000));
        let minutesStr = this.padLeftZero(minutes);

        let leave2 = leave1 % (60 * 1000); //计算分钟数后剩余的毫秒数
        let seconds = Math.round(leave2 / 1000);
        let secondsStr = this.padLeftZero(seconds);

        this.hourList = hoursStr.split('');
        this.minutesList = minutesStr.split('');
        this.secondsList = secondsStr.split('');

        if (hours <= 0 && minutes <= 0 && seconds <= 0) {
          clearInterval(this.setIntervalId);
          this.setIntervalId = null;
          this.showTime = false;
          this.$emit('endTime');
        }
      }, 1000);
    },
    // 日期时间补零
    padLeftZero(str) {
      return ('00' + str).substr(str.toString().length);
    },
    changeEndTime() {
      let time = new Date();
      time.setHours(time.getHours() + this.pickerTime.getHours());
      time.setMinutes(time.getMinutes() + this.pickerTime.getMinutes());
      time.setSeconds(time.getSeconds() + this.pickerTime.getSeconds());
      this.stopTimeComponents = time;
      this.showTime = true;
      this.start();
    },
  },
};
</script>

<style lang="less" scoped>
@ceobeLightColor: #fcddab; //小刻食堂主题亮色浅色
@ceobeVeryLightColor: #fff7ec; //小刻食堂主题非常浅色
@ceobeColor: #ffba4b; //小刻食堂主题亮色
@ceobeDarkColor: #353535; // 小刻食堂主题暗色

* {
  margin: 0;
  padding: 0;
}

#app {
  position: relative;
  user-select: none;

  .title {
    position: relative;
    margin-bottom: 10px;
    padding-bottom: 10px;
    width: 100%;
    font-size: 34px;
    text-align: center;
    color: @ceobeColor;

    &::after {
      position: absolute;
      bottom: 0;
      left: calc(50% - 100px);
      z-index: 0;
      width: 200px;
      height: 2px;
      border-radius: 50%;
      background: linear-gradient(90deg, #fff, @ceobeColor, #fff);
      transition: all 0.5s;
      content: '';
    }
  }

  .flip-clock {
    margin-top: 20px;
    width: 100%;
    text-align: center;
    user-select: none;

    .M-Flipper {
      margin: 0 6px;
    }

    em {
      display: inline-block;
      margin-right: 15px;
      margin-left: 0;
      height: 10px;
      font-size: 20px;
      color: @ceobeLightColor;
      line-height: 115px;
      font-style: normal;
      vertical-align: top;
    }
  }

  .end-flip-clock {
    width: 100%;
    font-size: 16px;
    text-align: center;

    .info {
      margin-top: 20px;
      margin-bottom: 10px;
    }
  }
}
</style>
