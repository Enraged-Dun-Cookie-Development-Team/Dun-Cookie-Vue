<template>
  <div class="wrapper" :data-id="item.id">
    <span class="wrapper-content"></span>
    <img v-if="showImage" v-lazy="item.coverImage" class="image-back"/>
    <div class="content-card">
      <div class="content-card-info">
        <img v-if="showImage" v-lazy="item.coverImage" class="content-card-image"/>
        <div class="content-card-title">{{ item.componentData.name }}</div>
        <div class="content-card-introduction">
          {{ item.componentData.introduction }}
        </div>
        <div class="content-card-subtitle">
          {{ item.componentData.subtitle }}
        </div>
      </div>
      <div class="content-card-episodes">
        <span v-for="episodes in item.componentData.episodes"
              :key="episodes.cid"
              class="content-card-episodes-btn"
              @click="openUrl(`https://terra-historicus.hypergryph.com/comic/${item.componentData.cid}/episode/${episodes.cid}`)">
          {{ episodes.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
// 用于TerraHistoricusDataSource的特殊组件
import PlatformHelper from '../../../common/platform/PlatformHelper';
import Settings from '../../../common/Settings';

export default {
  name: "TerraHistoricusItem",
  props: ["item", "showImage"],
  data() {
    return {
      settings: Settings,
    };
  },
  methods: {
    openUrl(url) {
      if(this.settings.feature.linkMax) {
        PlatformHelper.Windows
          .createMaxPopupWindow(url);
      } else {
        PlatformHelper.Windows
          .createPopupWindow(url, 900, 1000);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  position: relative;

  .image-back {
    top: 0;
    left: 0;
    width: 100%;
    filter: blur(5px) brightness(50%);
  }

  .content-card {
    display: flex;
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    padding: 2% 2%;

    .content-card-info {
      margin-top: 3%;
      width: 50%;

      .content-card-image {
        width: 300px;
        box-shadow: 0 0 16px 10px rgb(6 0 1 / 65%), 0 0 8px 2px #b0243b;
      }

      .content-card-title {
        color: #fff;
        font-size: 2rem;
        letter-spacing: -0.1rem;
        text-shadow: 0 0 1rem #000, 0 0 0.5rem #000, 0 0 0.25rem #000;
      }

      .content-card-introduction {
        margin-top: 3px;
        font-size: 0.7rem;
        color: #afaeae;
      }

      .content-card-subtitle {
        margin-top: 5px;
        color: #fff;
        font-size: 0.9rem;
      }
    }

    .content-card-episodes {
      width: 250px;
      margin: 0 0 0 20px;
      max-height: 310px;
      overflow: auto;

      .content-card-episodes-btn {
        text-align:center;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #fff;
        border-radius: 4px;
        line-height: 1.2;
        color: #fff;
        transition: background-color 0.5s;
        cursor: pointer;
        margin: 10px 0;
        padding: 3px 0;

        &:hover {
          background-color: #b0243b;
        }
      }
    }
  }
}
</style>
