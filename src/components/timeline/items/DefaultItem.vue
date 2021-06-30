<template>
  <div>
    <el-row>
      <div v-html="item.content"></div>
      <!-- 如果有转发 -->
      <el-card v-if="item.retweeted" class="card margintb" shadow="never">
        转发至 @{{ item.retweeted.name }}:
        <br/>
        <span v-html="item.retweeted.content"></span>
      </el-card>
    </el-row>
    <el-row v-if="showImage && settings.display.showImage && item.coverImage" class="margintb">
      <div :class="{'show-all': showAllImage.includes(item.coverImage)}"
           class="img-area"
           @click="changeShowAllImage(item.coverImage)">
        <div v-if="item.imageList && item.imageList.length > 1" class="multi-img">
          <el-row :gutter="5">
            <el-col v-for="(img, index) in item.imageList" :key="img" :span="8">
              <img :ref="item.id + '_' + index" v-lazy="img" class="img"/>
              <span class="img-btn img-look-btn"
                    @click.stop="ViewImg(item, img, item.id + '_' + index)"
              >
                <i class="el-icon-view"></i>
              </span>
            </el-col>
          </el-row>
        </div>
        <div v-else class="one-img">
          <img :ref="item.id" v-lazy="item.coverImage" class="img"/>
          <span
              class="img-btn img-look-btn"
              @click.stop="ViewImg(item, item.coverImage, item.id)"
          >
            <i class="el-icon-view"></i>
          </span>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import Settings from '../../../common/Settings';
import BrowserUtil from '../../../common/util/BrowserUtil';

export default {
  name: "DefaultItem",
  props: ["item", "showImage"],
  data() {
    return {
      settings: Settings,
      showAllImage: [],
      windowTabId: null,
    };
  },
  methods: {
    openUrl: BrowserUtil.createTab,
    // 图片收起展示
    changeShowAllImage(img) {
      if (this.showAllImage.includes(img)) {
        this.showAllImage.splice(
            this.showAllImage.findIndex((x) => x == img),
            1
        );
      } else {
        this.showAllImage.push(img);
      }
    },
    ViewImg(item, img, refName) {
      // 舍弃 会把列表关闭
      // chrome.tabs.create(
      //   {
      //     url: chrome.extension.getURL("viewImg.html"),
      //     active: true,
      //   },
      //   function (_tab) {
      //    setTimeout(() => {
      //       chrome.tabs.sendMessage(_tab.id, {
      //       message: "some custom message",
      //       arg: "some arg",
      //     });
      //    }, 1000);
      //   }
      // );
      // 直接打开 我也不知道为什么要加上这个神奇的数字 但是还是有缝隙
      let ref = this.$refs[refName];
      if (Array.isArray(ref)) {
        ref = ref[0];
      }
      let width = ref.naturalWidth + 32 || 1100;
      let height = ref.naturalHeight + 67 || 750;
      if (this.windowTabId != null) {
        chrome.windows.remove(this.windowTabId, () => {
          // 避免报错
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
          }
        });
      }
      chrome.windows.create(
          {
            url: chrome.extension.getURL("viewImg.html"),
            type: "panel",
            width: width,
            height: height,
          },
          (window) => {
            this.windowTabId = window.id;
            setTimeout(() => {
              chrome.runtime.sendMessage({
                info: "tab",
                item: item,
                img: img,
                winId: window.id,
              });
            }, 1000);
          }
      );
    },
  }
}
</script>

<style lang="less" scoped>
@import "../../../theme/theme.less";

.styleChange(@theme) {
  @bgColor: "bgColor-@{theme}"; // 背景颜色

  .margintb {
    margin: 10px 0 0 0;
  }

  .img-area {
    width: 100%;
    height: 150px;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    .one-img {
      max-width: 700px;
      width: 100%;
      margin: auto;
    }

    .img {
      border-radius: 4px;
      width: 100%;
    }

    &::before {
      content: " ";
      position: absolute;
      bottom: 0;
      height: 50px;
      width: 100%;
      background: linear-gradient(0, @@bgColor, transparent);
      z-index: 1;
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
