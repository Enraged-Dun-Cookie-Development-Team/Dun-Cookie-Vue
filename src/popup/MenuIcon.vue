<template>
  <div @click.stop="handleIconClick">
    <button ref="wrapperNav" class="nav">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</template>

<script>
export default {
    name: "MenuIcon",
    methods: {
        handleIconClick() {
            this.$emit("handleIconClick");
        },
    },
};
</script>

<style lang="less">
@import "../theme/theme.less";

.dark {
  .styleChange(dark);
}

.light {
  .styleChange(light);
}

.styleChange(@theme) {
  @ceobeColor: "ceobeColor-@{theme}"; //小刻食堂主题亮色
  @ceobeDarkColor: "ceobeDarkColor-@{theme}"; //小刻食堂主题暗色

  .menu-btn {
    width: 30px;
    height: 30px;
    transform: translate(-10%, 0%);

    .nav {
      width: 28px;
      height: 19px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      padding: 0px;
      background-color: transparent;
      border-style: none;
      outline: none;
      cursor: pointer;
    }
    .nav span {
      width: 100%;
      height: 3px;
      background-color: @@ceobeColor;
      display: block;
      position: absolute;
      border-radius: 1px;
      transition: all 0.5s ease;
    }
    .nav span:nth-child(1) {
      width: 4px;
      height: 4px;
      right: 1px;
      top: -1px;
      z-index: 1;
    }
    .nav span:nth-child(2) {
      width: calc(100% - 10px);
      left: 0px;
      top: 0px;
    }
    .nav span:nth-child(3) {
      right: 0px;
      top: 8px;
    }
    .nav span:nth-child(4) {
      right: 0px;
      top: 16px;
    }
    .nav:hover span:nth-child(1) {
      transform: translateY(-5px) scale(1.5);
    }
    &.menu-btn-open {
      .nav span:nth-child(1) {
        animation: span1 1.8s infinite cubic-bezier(0.8, 0.5, 0.2, 1.4);
        animation-delay: 0.4s;
      }

      @keyframes span1 {
        0% {
          transform: translate(3px, -5px) scale(1.3);
        }
        35% {
          transform: translate(3px, 23px) scale(1.3);
        }
        55% {
          transform: translate(-26px, 23px) scale(1.3);
        }
        75% {
          transform: translate(-26px, -5px) scale(1.3);
        }
        100% {
          transform: translate(3px, -5px) scale(1.3);
        }
      }

      .nav span:nth-child(2) {
        animation: span2 1s forwards cubic-bezier(0.8, 0.5, 0.2, 1.4);
        animation-delay: 0.1s;
      }
      @keyframes span2 {
        10% {
          transform: translateX(0px) rotate(0deg);
          width: 100%;
        }
        35% {
          transform: translate(-20px, 10px) rotate(90deg);
          width: 94%;
        }
        50% {
          transform: translate(0px, 8px) rotate(90deg);
        }
        55% {
          transform: translate(5px, 8px) rotate(100deg);
        }
        60% {
          transform: translate(-2px, 8px) rotate(85deg);
        }
        65% {
          transform: translate(0px, 8px) rotate(90deg);
        }
        100% {
          transform: translate(0px, 8px) rotate(45deg);
          width: 100%;
        }
      }
      .nav span:nth-child(3) {
        animation: span3 1s forwards cubic-bezier(0.8, 0.5, 0.2, 1.4);
        animation-delay: 0.2s;
      }

      @keyframes span3 {
        10% {
          transform: translateX(0px) rotate(0deg);
        }
        35% {
          transform: translate(20px, 0px) rotate(-90deg);
          width: 94%;
        }
        50% {
          transform: translate(0px, 0px) rotate(-90deg);
        }
        55% {
          transform: translate(5px, 0px) rotate(-80deg);
        }
        60% {
          transform: translate(2px, 0px) rotate(-100deg);
        }
        65% {
          transform: translate(0px, 0px) rotate(-90deg);
        }
        100% {
          transform: translate(0px, 0px) rotate(-45deg);
          width: 100%;
        }
      }
      .nav span:nth-child(4) {
        animation: span4 0.5s forwards cubic-bezier(0.8, 0.5, 0.2, 1.4);
        animation-delay: 0.3s;
      }

      @keyframes span4 {
        10% {
          transform: scale(1);
        }
        100% {
          transform: translateY(-20px);
          height: 138%;
          width: 100%;
          right: -1px;
          background-color: transparent;
          border: 1px solid @@ceobeColor;
        }
      }
    }

    .nav span:nth-child(1) {
      animation: span1_close 0.5s normal cubic-bezier(0.8, 0.5, 0.2, 1.4);
    }
    @keyframes span1_close {
      0% {
        transform: translate(-63px, 7px);
      }
      100% {
        transform: translate(0, 0);
      }
    }

    .nav span:nth-child(2) {
      animation: span2_close 0.5s forwards cubic-bezier(0.8, 0.5, 0.2, 1.4);
    }
    @keyframes span2_close {
      0% {
        transform: translate(0px, 8px) rotate(45deg);
        width: 100%;
      }
      100% {
        transform: translate(0, 0) rotate(0deg);
      }
    }

    .nav span:nth-child(3) {
      animation: span3_close 0.5s forwards cubic-bezier(0.8, 0.5, 0.2, 1.4);
    }
    @keyframes span3_close {
      0% {
        transform: translate(0px, 0px) rotate(-45deg);
      }
      100% {
        transform: translateX(0px) rotate(0deg);
      }
    }

    .nav span:nth-child(4) {
      animation: span4_close 0.5s forwards cubic-bezier(0.8, 0.5, 0.2, 1.4);
    }
    @keyframes span4_close {
      0% {
        transform: translateY(-20px);
        height: 138%;
        width: 100%;
        right: -1px;
        background-color: transparent;
        border: 1px solid @@ceobeColor;
      }
      100% {
        transform: scaleX(1);
      }
    }
  }
}
</style>
