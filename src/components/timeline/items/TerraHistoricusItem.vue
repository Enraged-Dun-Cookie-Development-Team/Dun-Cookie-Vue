<template>
  <div class="wrapper" :data-id="item.id">
    <div class="wrapper-content"></div>
    <img v-if="showImage" v-lazy="item.coverImage" class="image-back" />
    <div class="content-card">
      <div class="content-card-info">
        <img v-if="showImage" v-lazy="item.coverImage" class="content-card-image" />
        <div class="content-card-title">
          {{ item.componentData.name }}
        </div>
        <div class="content-card-introduction">
          {{ item.componentData.introduction }}
        </div>
        <div class="content-card-subtitle">
          {{ item.componentData.subtitle }}
        </div>
      </div>
      <div class="content-card-episodes">
        <span
          v-for="episodes in item.componentData.episodes"
          :key="episodes.cid"
          class="content-card-episodes-btn"
          @click="
            openUrl(`https://terra-historicus.hypergryph.com/comic/${item.componentData.cid}/episode/${episodes.cid}`)
          "
        >
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
import { DataItem } from '../../../common/DataItem';

export default {
  name: 'TerraHistoricusItem',
  props: { item: { type: DataItem, required: true }, showImage: Boolean },
  data() {
    return {
      settings: Settings,
    };
  },
  methods: {
    openUrl(url) {
      if (this.settings.feature.linkMax) {
        PlatformHelper.Windows.createMaxPopupWindow(url);
      } else {
        PlatformHelper.Windows.createPopupWindow(url, 900, 1000);
      }
    },
  },
};
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
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    padding: 2% 2%;
    width: 100%;
    height: 100%;

    .content-card-info {
      margin-top: 3%;
      width: 50%;

      .content-card-image {
        width: 300px;
        box-shadow: 0 0 16px 10px rgb(6 0 1 / 65%), 0 0 8px 2px #b0243b;
      }

      .content-card-title {
        font-size: 2rem;
        color: #fff;
        text-shadow: 0 0 1rem #000, 0 0 0.5rem #000, 0 0 0.25rem #000;
        letter-spacing: -0.1rem;
      }

      .content-card-introduction {
        margin-top: 3px;
        font-size: 0.7rem;
        color: #afaeae;
      }

      .content-card-subtitle {
        margin-top: 5px;
        font-size: 0.9rem;
        color: #fff;
      }
    }

    .content-card-episodes {
      overflow: auto;
      margin: 0 0 0 20px;
      width: 250px;
      max-height: 310px;

      .content-card-episodes-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 10px 0;
        padding: 3px 0;
        border: 1px solid #fff;
        border-radius: 4px;
        text-align: center;
        color: #fff;
        transition: background-color 0.5s;
        line-height: 1.2;
        cursor: pointer;

        &:hover {
          background-color: #b0243b;
        }
      }
    }
  }
}
</style>
