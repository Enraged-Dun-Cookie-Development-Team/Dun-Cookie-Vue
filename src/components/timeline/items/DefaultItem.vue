<template>
  <div ref="item" class="wrapper" :data-id="item.id">
    <el-row>
      <div class="wrapper-content">
        <span v-html="item.content"></span>
        <!-- 如果有转发 -->
        <br />
        <div v-if="item.retweeted" class="margintb card card-retweeted">
          转发自 @{{ item.retweeted.name }}:
          <br />
          <span v-html="item.retweeted.content"></span>
        </div>
      </div>
    </el-row>
    <el-row v-if="showImage && settings.display.showImage && item.coverImage" class="margintb">
      <div :class="{ 'show-all': expandImageArea }" class="img-area" @click="changeExpandImageArea()">
        <div v-if="item.imageList && item.imageList.length > 1" class="multi-img">
          <div v-for="(img, index) in item.imageList" :key="img" class="multi-img-area">
            <img :ref="item.id + '_' + index" v-lazy="img" class="img" />
            <span class="img-btn img-look-btn" @click.stop="ViewImg(item, img, item.id + '_' + index)">
              <i class="el-icon-view"></i>
            </span>
          </div>
        </div>
        <div v-else class="one-img">
          <img :ref="item.id" v-lazy="item.coverImage" class="img" />
          <span class="img-btn img-look-btn" @click.stop="ViewImg(item, item.coverImage, item.id)">
            <i class="el-icon-view"></i>
          </span>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import Settings from '../../../common/Settings';
import PlatformHelper from '../../../common/platform/PlatformHelper';
import { CookieItem } from '../../../common/CookieItem';

export const elementVisibleInPercent = (element) => {
  return new Promise((resolve, reject) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        resolve(Math.floor(entry.intersectionRatio * 100));
        clearTimeout(timeout);
        observer.disconnect();
      });
    });

    observer.observe(element);
    // Probably not needed, but in case something goes wrong.
    const timeout = setTimeout(() => {
      reject();
    }, 500);
  });
};

export default {
  name: 'DefaultItem',
  props: { item: { type: CookieItem, required: true }, showImage: Boolean },
  data() {
    return {
      settings: Settings,
      expandImageArea: false,
      windowTabId: null,
    };
  },
  methods: {
    openUrl: PlatformHelper.Tabs.create,
    // 图片收起展示
    changeExpandImageArea() {
      this.expandImageArea = !this.expandImageArea;
      if (!this.expandImageArea) {
        this.$nextTick(() => {
          elementVisibleInPercent(this.$refs.item)
            .then((percent) => {
              if (percent < 30) {
                this.$refs.item.scrollIntoView(false);
              }
            })
            .catch(() => {});
        });
      }
    },
    ViewImg(item, img, refName) {
      // 直接打开 我也不知道为什么要加上这个神奇的数字 希望在非Chrome能兼容
      let ref = this.$refs[refName];
      if (Array.isArray(ref)) {
        ref = ref[0];
      }
      let width = ref.naturalWidth + 31 > window.screen.width ? window.screen.width : ref.naturalWidth + 31;
      let height =
        ref.naturalHeight + 39 > window.screen.height - 50 ? window.screen.height - 50 : ref.naturalHeight + 39;

      this.saveWindowInfoAndOpenWindow({ item, img }, { width, height });
    },
    async saveWindowInfoAndOpenWindow(info, size) {
      let windowTabId = await PlatformHelper.Storage.getLocalStorage('windowTabId');
      if (windowTabId != undefined && windowTabId != 0) {
        let allWindow = await PlatformHelper.Windows.getAllWindow();
        if (allWindow.findIndex((x) => x.id == windowTabId) > 0) {
          await PlatformHelper.Windows.remove(windowTabId);
        }
        await PlatformHelper.Storage.saveLocalStorage('windowTabId', 0);
      }

      let window = await PlatformHelper.Windows.createPopupWindow(
        PlatformHelper.Extension.getURL('viewImg.html'),
        size.width,
        size.height
      );
      await PlatformHelper.Storage.saveLocalStorage('windowTabId', window.id);
      await PlatformHelper.Storage.saveLocalStorage('imageList', info.item.imageList);
      await PlatformHelper.Storage.saveLocalStorage('imgNow', info.img);
    },
  },
};
</script>

<style lang="less" scoped>
@import '../../../theme/theme.less';

.styleChange(@theme) {
  @bgColor: 'bgColor-@{theme}'; // 背景颜色

  .margintb {
    margin: 10px 0 0 0;
  }

  .wrapper-content {
    white-space: break-spaces;
  }

  .card-retweeted {
    padding: 10px;
    width: auto;
    border-radius: 3px;
  }

  .img-area {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 150px;
    cursor: pointer;

    .multi-img {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: auto;
      width: 100%;
      max-width: 700px;
      flex-wrap: wrap;
      flex-direction: row;

      .multi-img-area {
        position: relative;
        width: 33%;
        max-width: 33%;
      }
    }

    .one-img {
      position: relative;
      margin: auto;
      width: 100%;
      max-width: 700px;
    }

    .multi-img-area,
    .one-img {
      .img-btn {
        opacity: 0;
        transition: 0.5s opacity;
      }

      &:hover {
        .img-btn {
          opacity: 1;
        }
      }
    }

    .img {
      width: 100%;
      border-radius: 4px;
    }

    // 图片操作按钮

    .img-btn {
      position: absolute;
      top: 2px;
      right: 6px;
      z-index: 1;
      width: 26px;
      height: 20px;
      border-radius: 3px;
      text-align: center;
      background: #fff;
      line-height: 16px;

      i {
        font-size: 12px;
      }
    }

    .img-copy-btn {
      right: 36px;
    }

    &::before {
      position: absolute;
      bottom: 0;
      z-index: 1;
      width: 100%;
      height: 50px;
      background: linear-gradient(0deg, @@bgColor, transparent);
      content: ' ';
    }

    &.show-all {
      height: 100%;

      &::before {
        height: 0;
      }
    }
  }
}

.dark {
  .styleChange(dark);
}

.light {
  .styleChange(light);
}
</style>
