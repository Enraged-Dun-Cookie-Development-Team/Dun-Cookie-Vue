<template>
  <div class="wrapper" :data-id="item.id" @click="openUrl(item.jumpUrl)">
    <div class="wrapper-content"></div>
    <img v-if="showImage" v-lazy="item.coverImage" class="image-back" />
    <div class="content-card">
      <div class="record-area">
        <div class="record-area-record">
          <img v-lazy="item.coverImage" class="record-image" />
        </div>
        <img v-lazy="'assets/image/record.png'" class="record-image-back" />
      </div>
      <div class="record-info">
        {{ item.componentData.name }}
      </div>
      <div class="record-size">共{{ item.componentData.size }}首</div>
      <div class="record-btn">
        <i class="el-icon-d-arrow-right"></i>
        Go To Album
      </div>
    </div>
  </div>
</template>

<script>
// 用于NeteaseCloudMusicDataSource的特殊组件
import PlatformHelper from '../../../common/platform/PlatformHelper';
import Settings from '../../../common/Settings';
import { DataItem } from '../../../common/DataItem';

export default {
  name: 'NeteaseCloudMusicItem',
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
        PlatformHelper.Windows.createPopupWindow(url, 1400, 800);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.wrapper {
  position: relative;
  cursor: pointer;

  .image-back {
    top: 0;
    left: 0;
    width: 100%;
    height: 150px;
    filter: blur(70px) brightness(50%);
    object-fit: cover;
  }

  .content-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // 左边 图片大小在此控制

    .record-area {
      position: absolute;
      top: 15px;
      left: 50px;
      width: 120px;
      height: 120px;
      // 动画效果

      .record-area-record {
        position: absolute;
        left: 0;
        z-index: 2;
        overflow: hidden;
        height: 100%;
        transition: transform 0.5s ease, opacity 0.5s ease;
        transform: perspective(500px);

        .record-image {
          overflow: hidden;
          height: 100%;
        }

        &:after {
          content: '';
          position: absolute;
          top: -58%;
          left: -18%;
          width: 150%;
          height: 150%;
          background-image: linear-gradient(
            hsla(0, 0%, 100%, 0.2),
            hsla(0, 0%, 100%, 0.25) 48%,
            hsla(0, 0%, 100%, 0) 52%
          );
          transform: rotate(24deg);
          opacity: 0.5;
          transition: transform 0.5s ease, opacity 0.5s ease;
          pointer-events: none;
        }
      }

      .record-image-back {
        position: absolute;
        top: 5px;
        left: 35px;
        height: 110px;
        transition: all 0.5s;
      }
    }

    // 右边

    .record-info {
      position: absolute;
      top: 60px;
      right: 10px;
      padding: 10px 0;
      width: 380px;
      font-size: 1.8rem;
      font-family: Geometos, 'Sans-Regular', 'SourceHanSansCN-Regular', YaHei, serif;
      text-align: center;
      color: #fff;
      transition: all 0.5s;
    }

    .record-size {
      position: absolute;
      right: 330px;
      bottom: 17px;
      font-size: 1.2rem;
      font-family: Geometos, 'Sans-Regular', 'SourceHanSansCN-Regular', YaHei, serif;
      color: #fff;
      opacity: 0;
      transition: all 0.5s;
    }

    .record-btn {
      position: absolute;
      right: 15px;
      bottom: 15px;
      overflow: hidden;
      padding: 3px 5px;
      width: 18px;
      font-size: 1.2rem;
      font-family: Geometos, 'Sans-Regular', 'SourceHanSansCN-Regular', YaHei, serif;
      border: 1px solid #fff;
      border-radius: 4px;
      white-space: nowrap;
      color: #fff;
      transition: all 0.5s;
    }
  }

  &:hover {
    // 动画效果

    .record-area {
      .record-area-record {
        box-shadow: 0 7px 15px 4px rgb(0 0 0 / 30%);
        transform: perspective(500px) rotateX(8deg) scale(1.15);
      }

      .record-area-record:after {
        transform: perspective(500px) rotate(24deg) translateY(16%);
        opacity: 1;
      }

      .record-image-back {
        left: 60px;
        transform: rotateX(8deg) scale(1.15);
      }
    }

    .content-card {
      // 右边

      .record-info {
        top: 30px;
        right: -10px;
        font-size: 1.5rem;
        border-radius: 4px 0 0 4px;
        text-align: center;
        background: #454545;
      }

      .record-size {
        opacity: 1;
      }

      .record-btn {
        width: 170px;
      }
    }
  }
}
</style>
