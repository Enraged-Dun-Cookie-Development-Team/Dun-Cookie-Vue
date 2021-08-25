<template>
  <div>
    <div class="wrapper" @click.stop="handleIconClick">
      <button class="nav" ref="wrapperNav">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

  </div>
</template>

<script>
export default {
  name: "MenuIcon",
  methods: {
    handleIconClick() {
      this.$emit("handleIconClick");
      this.$refs['wrapperNav'].classList.toggle('open');
    }
  }
}
</script>

<style scoped>

.wrapper {
  width: 100px;
  height: 100px;
  position: absolute;
  right: 0;
  top: 0;
  transform: scale(0.4);
  transform-origin: right top;
}

.nav {
  width: 64px;
  height: 45px;
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
  height: 5px;
  background-color: #23ade5;
  display: block;
  position: absolute;
  border-radius: 2px;
  transition: all .5s ease;
}

.nav span:nth-child(1) {
  width: 5px;
  height: 5px;
  right: 0px;
  top: 0px;
  z-index: 1;
}

.nav span:nth-child(2) {
  width: calc(100% - 10px);
  left: 0px;
  top: 0px;
}

.nav span:nth-child(3) {
  right: 0px;
  top: 20px;
}

.nav span:nth-child(4) {
  right: 0px;
  top: 40px;
}

.nav:hover span:nth-child(1) {
  transform: translateY(-7px) scale(1.5);

}

.nav.open span:nth-child(1) {
  animation: span1 1.8s infinite cubic-bezier(.8, .5, .2, 1.4);
  animation-delay: .4s;
}

@keyframes span1 {
  0% {
    transform: translate(3px, -7px) scale(1.3);
  }
  35% {
    transform: translate(3px, 54px) scale(1.3);
  }
  55% {
    transform: translate(-63px, 54px) scale(1.3);
  }
  75% {
    transform: translate(-63px, -7px) scale(1.3);
  }
  100% {
    transform: translate(3px, -7px) scale(1.3);
  }
}

.nav.open span:nth-child(2) {
  animation: span2 1s forwards cubic-bezier(.8, .5, .2, 1.4);
  animation-delay: .1s;
}

@keyframes span2 {
  10% {
    transform: translateX(0px) rotate(0deg);
    width: 100%;
  }
  35% {
    transform: translate(-28px, 23px) rotate(90deg);
    width: 94%;
  }
  50% {
    transform: translate(0px, 23px) rotate(90deg);
  }
  55% {
    transform: translate(5px, 23px) rotate(100deg);
  }
  60% {
    transform: translate(-2px, 23px) rotate(85deg);
  }
  65% {
    transform: translate(0px, 23px) rotate(90deg);
  }
  100% {
    transform: translate(0px, 23px) rotate(45deg);
    width: 100%;
  }
}

.nav.open span:nth-child(3) {
  animation: span3 1s forwards cubic-bezier(.8, .5, .2, 1.4);
  animation-delay: .2s;
}

@keyframes span3 {
  10% {
    transform: translateX(0px) rotate(0deg);
  }
  35% {
    transform: translate(28px, 4px) rotate(-90deg);
    width: 94%;
  }
  50% {
    transform: translate(0px, 4px) rotate(-90deg);
  }
  55% {
    transform: translate(5px, 4px) rotate(-80deg);
  }
  60% {
    transform: translate(2px, 4px) rotate(-100deg);
  }
  65% {
    transform: translate(0px, 4px) rotate(-90deg);
  }
  100% {
    transform: translate(0px, 4px) rotate(-45deg);
    width: 100%;
  }
}

.nav.open span:nth-child(4) {
  animation: span4 .5s forwards cubic-bezier(.8, .5, .2, 1.4);
  animation-delay: .3s;
}

@keyframes span4 {
  10% {
    transform: scale(1);
  }
  100% {
    transform: translateY(-45px);
    height: 133%;
    width: 100%;
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, .3);
  }
}

.nav span:nth-child(1) {
  animation: span1_close .5s normal cubic-bezier(.8, .5, .2, 1.4);
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
  animation: span2_close .5s forwards cubic-bezier(.8, .5, .2, 1.4);
}

@keyframes span2_close {
  0% {
    transform: translate(0px, 23px) rotate(45deg);
    width: 100%;
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

.nav span:nth-child(3) {
  animation: span3_close .5s forwards cubic-bezier(.8, .5, .2, 1.4);
}

@keyframes span3_close {
  0% {
    transform: translate(0px, 4px) rotate(-45deg);
  }
  100% {
    transform: translateX(0px) rotate(0deg);
  }
}

.nav span:nth-child(4) {
  animation: span4_close .5s forwards cubic-bezier(.8, .5, .2, 1.4);
}

@keyframes span4_close {
  0% {
    transform: translateY(-45px);
    height: 133%;
    width: 100%;
    background-color: transparent;
    border: 1px solid rgba(35, 173, 229, .3);
  }
  100% {
    transform: scaleX(1);
  }
}

@keyframes youtubeAnim {
  0%, 100% {
    color: #c9110f;
  }
  50% {
    color: #ff0000;
  }
}

/* footer  */
</style>
