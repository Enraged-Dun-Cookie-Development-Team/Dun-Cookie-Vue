<template>
  <div class="M-Flipper" :class="[flipType, { go: isFlipping }]">
    <div class="digital front" :class="_textClass(frontTextFromData)"></div>
    <div class="digital back" :class="_textClass(backTextFromData)"></div>
  </div>
</template>

<script>
export default {
  name: 'Flipper',
  props: {
    max: {
      type: Number,
      default: 9,
    },
    text: {
      type: String,
      required: true,
    },
    // front paper text
    // 前牌文字
    frontText: {
      type: [Number, String],
      default: 0,
    },
    // back paper text
    // 后牌文字
    backText: {
      type: [Number, String],
      default: 1,
    },
    // flipping duration, please be consistent with the CSS animation-duration value.
    // 翻牌动画时间，与CSS中设置的animation-duration保持一致
    duration: {
      type: Number,
      default: 600,
    },
  },
  data() {
    return {
      isFlipping: false,
      flipType: 'down',
      frontTextFromData: 0,
      backTextFromData: 1,
    };
  },
  watch: {
    text() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  created() {
    this.frontTextFromData = this.frontText;
    this.backTextFromData = this.backText;
  },
  methods: {
    init() {
      let number = parseInt(this.text);
      let back = number + 1 > this.max ? 0 : number + 1;
      this.flipDown(back, number);
    },
    _textClass(number) {
      return 'number' + number;
    },
    _flip(type, front, back) {
      // 如果处于翻转中，则不执行
      if (this.isFlipping) {
        return false;
      }
      this.frontTextFromData = front;
      this.backTextFromData = back;
      // 根据传递过来的type设置翻转方向
      this.flipType = type;
      // 设置翻转状态为true
      this.isFlipping = true;
      setTimeout(() => {
        // 设置翻转状态为false
        this.isFlipping = false;
        this.frontTextFromData = back;
      }, this.duration);
    },
    // 下翻牌
    flipDown(front, back) {
      this._flip('down', front, back);
    },
    // 上翻牌
    flipUp(front, back) {
      this._flip('up', front, back);
    },
    // 设置前牌文字
    setFront(text) {
      this.frontTextFromData = text;
    },
    // 设置后牌文字
    setBack(text) {
      this.backTextFromData = text;
    },
  },
};
</script>

<style lang="less" scoped>
@ceobeLightColor: #fcddab; //小刻食堂主题亮色浅色
@ceobeVeryLightColor: #fff7ec; //小刻食堂主题非常浅色
@ceobeColor: #ffba4b; //小刻食堂主题亮色
@ceobeDarkColor: #353535; // 小刻食堂主题暗色

.M-Flipper {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 65px;
  font-size: 50px;
  font-family: 'Helvetica Neue';
  border: solid 1px @ceobeColor;
  border-radius: 10px;
  text-align: center;
  color: #fff;
  background: #fff;
  box-shadow: 0 0 6px rgba(71, 42, 4, 0.5);
  line-height: 65px;
}

.M-Flipper .digital:before,
.M-Flipper .digital:after {
  position: absolute;
  right: 0;
  left: 0;
  overflow: hidden;
  background: @ceobeColor;
  content: '';
  box-sizing: border-box;
}

.M-Flipper .digital:before {
  top: 0;
  bottom: 50%;
  border-bottom: solid 1px @ceobeLightColor;
  border-radius: 8px 8px 0 0;
}

.M-Flipper .digital:after {
  top: 50%;
  bottom: 0;
  border-radius: 0 0 8px 8px;
  line-height: 0;
}

/*向下翻*/

.M-Flipper.down .front:before {
  z-index: 3;
}

.M-Flipper.down .back:after {
  z-index: 2;
  transform-origin: 50% 0%;
  transform: perspective(160px) rotateX(180deg);
}

.M-Flipper.down .front:after,
.M-Flipper.down .back:before {
  z-index: 1;
}

.M-Flipper.down.go .front:before {
  transform-origin: 50% 100%;
  animation: frontFlipDown 0.6s ease-in-out both;
  box-shadow: 0 -2px 6px rgba(255, 255, 255, 0.3);
  backface-visibility: hidden;
}

.M-Flipper.down.go .back:after {
  animation: backFlipDown 0.6s ease-in-out both;
}

/*向上翻*/

.M-Flipper.up .front:after {
  z-index: 3;
}

.M-Flipper.up .back:before {
  z-index: 2;
  transform-origin: 50% 100%;
  transform: perspective(160px) rotateX(-180deg);
}

.M-Flipper.up .front:before,
.M-Flipper.up .back:after {
  z-index: 1;
}

.M-Flipper.up.go .front:after {
  transform-origin: 50% 0;
  animation: frontFlipUp 0.6s ease-in-out both;
  box-shadow: 0 2px 6px rgba(255, 255, 255, 0.3);
  backface-visibility: hidden;
}

.M-Flipper.up.go .back:before {
  animation: backFlipUp 0.6s ease-in-out both;
}

@keyframes frontFlipDown {
  0% {
    transform: perspective(160px) rotateX(0deg);
  }

  100% {
    transform: perspective(160px) rotateX(-180deg);
  }
}

@keyframes backFlipDown {
  0% {
    transform: perspective(160px) rotateX(180deg);
  }

  100% {
    transform: perspective(160px) rotateX(0deg);
  }
}

@keyframes frontFlipUp {
  0% {
    transform: perspective(160px) rotateX(0deg);
  }

  100% {
    transform: perspective(160px) rotateX(180deg);
  }
}

@keyframes backFlipUp {
  0% {
    transform: perspective(160px) rotateX(-180deg);
  }

  100% {
    transform: perspective(160px) rotateX(0deg);
  }
}

.M-Flipper .number0:before,
.M-Flipper .number0:after {
  content: '0';
}

.M-Flipper .number1:before,
.M-Flipper .number1:after {
  content: '1';
}

.M-Flipper .number2:before,
.M-Flipper .number2:after {
  content: '2';
}

.M-Flipper .number3:before,
.M-Flipper .number3:after {
  content: '3';
}

.M-Flipper .number4:before,
.M-Flipper .number4:after {
  content: '4';
}

.M-Flipper .number5:before,
.M-Flipper .number5:after {
  content: '5';
}

.M-Flipper .number6:before,
.M-Flipper .number6:after {
  content: '6';
}

.M-Flipper .number7:before,
.M-Flipper .number7:after {
  content: '7';
}

.M-Flipper .number8:before,
.M-Flipper .number8:after {
  content: '8';
}

.M-Flipper .number9:before,
.M-Flipper .number9:after {
  content: '9';
}
</style>
