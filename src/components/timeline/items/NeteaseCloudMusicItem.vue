<template>
  <div
    class="wrapper" :data-id="item.id"
    @click="openUrl(item.jumpUrl)"
  >
    <div class="wrapper-content"></div>
    <img
      v-if="showImage" v-lazy="item.coverImage"
      class="image-back"
    />
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
      <div class="record-size">
        共{{ item.componentData.size }}首
      </div>
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

export default {
    name: "NeteaseCloudMusicItem",
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
                    .createPopupWindow(url, 1400, 800);
            }
        }
    }
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
    filter: blur(70px) brightness(50%);
    height: 150px;
    object-fit: cover;
  }

  .content-card {
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    // 左边 图片大小在此控制
    .record-area {
      position: absolute;
      height: 120px;
      top: 15px;
      left: 50px;
      width: 120px;
      // 动画效果
      .record-area-record {
        transform: perspective(500px);
        transition: transform 0.5s ease, opacity 0.5s ease;
        height: 100%;
        position: absolute;
        left: 0;
        z-index: 2;
        overflow: hidden;

        .record-image {
          height: 100%;
          overflow: hidden;
        }

        &:after {
          content: "";
          position: absolute;
          top: -58%;
          left: -18%;
          width: 150%;
          height: 150%;
          background-image: linear-gradient(hsla(0, 0%, 100%, 0.2),
          hsla(0, 0%, 100%, 0.25) 48%,
          hsla(0, 0%, 100%, 0) 52%);
          transform: rotate(24deg);
          opacity: 0.5;
          transition: transform 0.5s ease, opacity 0.5s ease;
          pointer-events: none;
        }
      }

      .record-image-back {
        position: absolute;
        top: 5px;
        height: 110px;
        transition: all 0.5s;
        left: 35px;
      }
    }

    // 右边
    .record-info {
      transition: all 0.5s;
      font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei, serif;
      font-size: 1.8rem;
      color: #fff;
      width: 380px;
      text-align: center;
      position: absolute;
      top: 60px;
      padding: 10px 0;
      right: 10px;
    }

    .record-size {
      transition: all 0.5s;
      position: absolute;
      bottom: 17px;
      right: 330px;
      font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei, serif;
      color: #fff;
      font-size: 1.2rem;
      opacity: 0;
    }

    .record-btn {
      transition: all 0.5s;
      font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei, serif;
      font-size: 1.2rem;
      right: 15px;
      position: absolute;
      bottom: 15px;
      color: #fff;
      border: 1px solid #fff;
      padding: 3px 5px;
      white-space: nowrap;
      width: 18px;
      overflow: hidden;
      border-radius: 4px;
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
        font-size: 1.5rem;
        background: #454545;
        text-align: center;
        top: 30px;
        right: -10px;
        border-radius: 4px 0 0 4px;
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
