<template>
  <div id="app">
    <div class="title-area">
      <div class="title">
        <a href="http://www.ceobecanteen.top/" target="_blank">
          <el-image class="img" :src="logo" />
        </a>
        <div class="name-area">小刻食堂倒计时模块</div>
      </div>
    </div>
    <div class="count-down-area">
      <el-card v-for="item in countDownList" :key="item.name" class="box-card">
        <count-down-flip-clock
          :name="item.name"
          :stop-time="item.stopTime"
          :selectable-range="item.selectableRange"
          :picker-time="item.pickerTime"
          @changeTime="changeTime(item, $event)"
          @endTime="endTime(item)"
        />
      </el-card>
    </div>
  </div>
</template>

<script>
import CountDown from '../common/sync/CountDownInfo';
import PlatformHelper from '@/common/platform/PlatformHelper';
import CountDownFlipClock from '../components/countdown/FlipClock';
import { countDown, MESSAGE_CHANGE_COUNTDOWN } from '../common/Constants';
import Settings from '../common/Settings';

export default {
  name: 'CountDownTime',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    CountDownFlipClock,
  },
  data() {
    return {
      logo: '',
      settings: Settings,
      form: {},
      countDownList: [],
    };
  },
  computed: {},
  mounted() {
    this.init();
    this.getAllCountDownLocalStorage();
  },
  methods: {
    init() {
      this.settings.doAfterInit((settings) => {
        this.logo = '../assets/image/' + settings.logo;
      });
    },

    start() {},

    changeTime(item, data) {
      let info = {
        ...item,
        ...data,
      };
      CountDown.addCountDownLocalStorage(info).then((_) => {
        PlatformHelper.Message.send(MESSAGE_CHANGE_COUNTDOWN);
      });
    },

    endTime(data) {
      CountDown.removeCountDown(data).then((_) => {
        PlatformHelper.Message.send(MESSAGE_CHANGE_COUNTDOWN);
      });
    },

    getAllCountDownLocalStorage() {
      CountDown.getCountDownLocalStorage().then((data) => {
        let array = [];
        if (data) {
          let info = [...JSON.parse(data).map((x) => x.data), ...countDown];
          info.forEach((item) => {
            if (!array.some((x) => x.name == item.name)) {
              array.push({
                ...item,
                pickerTime: new Date(item.pickerTime),
                stopTime: item.stopTime ? new Date(item.stopTime) : null,
              });
            }
          });
        } else {
          array = countDown;
        }
        this.countDownList = array.sort((x, y) => (x.index < y.index ? -1 : 1));
      });
    },
  },
};
</script>

<style lang="less" scoped>
@ceobeLightColor: #fcddab; //小刻食堂主题亮色浅色
@ceobeVeryLightColor: #fff7ec; //小刻食堂主题非常浅色
@ceobeColor: #ffba4b; //小刻食堂主题亮色
@ceobeDarkColor: #353535; // 小刻食堂主题暗色

@font-face {
  font-family: Geometos;
  src: url('../assets/font/Geometos.ttf');
}

.title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: @ceobeColor;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
    width: 500px;
    font-size: 40px;
    color: #fff;
    align-content: center;
    flex-wrap: nowrap;
    flex-direction: row;

    .img {
      height: 65px;
    }
  }
}

.count-down-area {
  display: flex;
  justify-content: space-around;
  margin: 30px 30px 0 30px;
  flex-direction: row;
  flex-wrap: wrap;

  .box-card {
    margin-bottom: 30px;
    min-width: 48%;
    height: 180px;
  }
}
</style>
