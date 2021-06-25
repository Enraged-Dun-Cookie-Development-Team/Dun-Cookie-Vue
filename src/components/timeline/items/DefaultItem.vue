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
    <el-row v-if="showImage && setting.display.showImage && item.coverImage" class="margintb">
      <div :class="{'show-all': showAllImage.includes(item.coverImage)}"
           class="img-area"
           @click="changeShowAllImage(item.coverImage)">
        <div v-if="item.imageList && item.imageList.length > 1">
          <el-row :gutter="5">
            <el-col v-for="img in item.imageList" :key="img" :span="8">
              <img v-lazy="img" class="img"/>
            </el-col>
          </el-row>
        </div>
        <div v-else class="one-img">
          <img v-lazy="item.coverImage" class="img"/>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import {settings} from '../../../common/Settings';
import BrowserUtil from '../../../common/util/BrowserUtil';

export default {
  name: "DefaultItem",
  props: ["item", "showImage"],
  data() {
    return {
      setting: settings,
      showAllImage: [],
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
