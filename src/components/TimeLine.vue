<template>
  <el-timeline>
    <el-timeline-item
      v-for="(item, index) in cardlist"
      :key="index"
      :timestamp="timespanToDay(item.time)"
      placement="top"
      :icon="'headImg' + item.source"
    >
      <el-card class="card" :class="'font-size-' + setting.fontsize">
        <div>
          <el-button
            class="to-copy-btn"
            size="small"
            @click="copyData(item)"
            title="复制该条内容及链接"
            ><i class="el-icon-document-copy"></i
          ></el-button>
          <el-button
            class="to-url-btn"
            size="small"
            title="前往该条内容"
            @click="openUrl(item.url)"
            ><i class="el-icon-right"></i
          ></el-button>
          <span class="is-top-info" v-if="item.isTop">
            <span class="color-blue"
              >【当前条目在微博的时间线内为置顶状态】</span
            >
          </span>
          <el-row
            type="flex"
            justify="space-between"
            align="middle"
            class="margintb"
          >
          </el-row>
          <div :ref="'index_' + index">
            <el-row class="margintb">
              <div v-html="item.dynamicInfo"></div>
            </el-row>

            <transition name="el-fade-in-linear">
              <el-row
                class="margintb"
                v-if="imgShow && setting.imgshow && item.image"
              >
                <div
                  class="img-area"
                  @click="changeShowAllImage(item.image)"
                  :class="showAllImage.includes(item.image) ? 'show-all' : ''"
                >
                  <div
                    v-if="
                      item.imageList != undefined && item.imageList.length > 1
                    "
                  >
                    <el-row :gutter="5">
                      <el-col v-for="img in item.imageList" :key="img" :span="8"
                        ><img :src="img" class="img" />
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else>
                    <img :src="item.image" class="img" />
                  </div>
                </div>
              </el-row>
            </transition>
          </div>
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>

<script>
import { timespanToDay } from "../assets/JS/common";
export default {
  name: "TimeLine",
  props: ["cardlist", "setting", "saveInfo"],
  data() {
    return {
      showAllImage: [],
      imgShow: false,
    };
  },
  mounted() {
    // 图片卡 先加载dom后加载图片内容
    setTimeout(() => {
      this.imgShow = true;
    }, 2000);
  },
  methods: {
    timespanToDay,
    // 复制
    copyData(item) {
      this.$copyText(
        `${item.dynamicInfo.replace(
          /<br\/>/g,
          `
`
        )}   

${item.url}

数据由 蹲饼${this.saveInfo.version} 收集`
      ).then(
        (e) => {
          this.$message({
            offset: 50,
            center: true,
            message: "复制成功",
            type: "success",
          });
        },
        (e) => {
          this.$message({
            offset: 50,
            center: true,
            message: "复制失败",
            type: "error",
          });
        }
      );
    },
    openUrl(url) {
      chrome.tabs.create({ url: url });
    },
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
  },
};
</script>
<style lang="less" >
@import "../theme/theme.less";

.styleChange(@theme) {
  @bgColor: "bgColor-@{theme}"; // 背景颜色
  @content: "content-@{theme}"; // 文本颜色
  @timeline: "timeline-@{theme}"; // 时间线颜色和时间线border颜色
  @subTitle: "subTitle-@{theme}"; // 小标题颜色
  @btnBorder: "btnBorder-@{theme}"; // 按钮边框颜色和一些小线条
  @setBtnBorder: "setBtnBorder-@{theme}";
  @btnBg: "btnBg-@{theme}"; // 按钮内部颜色
  @setLarge: "setLarge-@{theme}"; // 设置标题颜色
  @shadow: "shadow-@{theme}"; // 卡片的阴影
  @hover: "hover-@{theme}"; // 按钮hover颜色

  a {
    color: @@content!important;
  }
  .color-blue {
    color: #23ade5;
  }

  .card {
    width: 600px;
    margin: 10px 0;
    background-color: @@bgColor;
    border: @@timeline solid 1px;
    color: @@content;

    &.font-size--1 {
      font-size: 0.7rem;
    }
    &.font-size-0 {
      font-size: 1rem;
    }
    &.font-size-1 {
      font-size: 1.2rem;
    }
    &.font-size-2 {
      font-size: 1.5rem;
    }

    .margintb {
      margin: 0 0 10px 0;
    }
    .img-area {
      width: 100%;
      height: 150px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
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

    .time {
      margin-left: 10px;
      color: #23ade5;
    }
    .head-img {
      width: 20px;
    }
    .to-url-btn {
      position: absolute;
      top: -8px;
      right: 0;
      background-color: @@bgColor;
      color: @@content;
      border: @@btnBorder 1px solid;
    }
    .to-url-btn:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: @@hover;
    }
    .to-copy-btn {
      position: absolute;
      top: -8px;
      right: 50px;
      background-color: @@bgColor;
      color: @@content;
      border: @@btnBorder 1px solid;
    }
    .to-copy-btn:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: @@hover;
    }
    .is-top-info {
      position: absolute;
      top: 0px;
      left: 220px;
    }
  }

  .el-card__body {
    padding: 0 20px;
  }

  .info-card {
    padding: 3px;
    margin: 0px 20px;
    background-color: @@bgColor;
    border: @@timeline solid 1px;
    color: @@content;
    &.isnew {
      margin-bottom: 10px;
      cursor: pointer;
      text-align: center;
    }
    &.online-speak {
      .el-card__body {
        padding: 0;
      }
    }
    .el-carousel__button {
      background-color: #23ade5;
    }
  }
  // 更改卡片阴影
  .is-always-shadow {
    box-shadow: 0 2px 12px 0 @@shadow;
  }

  .el-timeline {
    padding-left: 25px;
    overflow: auto;
    padding-top: 20px;
    padding-right: 20px;
    height: 420px;
    margin-top: 10px;
    // position: relative;
    // &::before {
    //   content: " ";
    //   position: absolute;
    //   top: 0px;
    //   width: 100%;
    //   left: 0;
    //   height: 10px;
    //   background: linear-gradient(180deg, @@bgColor 30%, transparent);
    // }
    .el-timeline-item__tail {
      border-left: 2px solid @@timeline;
    }
    .el-timeline-item__timestamp {
      color: @@subTitle;
      margin-left: 20px;
      margin-bottom: 15px;
      font-size: 1rem;
    }
    .el-timeline-item__node {
      background: none;
      .el-timeline-item__icon {
        position: relative;
        &::before {
          content: " ";
          position: absolute;
          top: -12px;
          left: -18px;
          width: 36px;
          height: 36px;
        }
        &.headImg0::before {
          background: url("/assets/image/bili.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg1::before {
          background: url("/assets/image/weibo.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg2::before {
          border-radius: 10px;
          background: url("/assets/image/txz.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg3::before {
          border-radius: 10px;
          background: url("/assets/image/cho3.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg4::before {
          border-radius: 10px;
          background: url("/assets/image/ys3.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg5::before {
          background: url("/assets/image/sr.ico") no-repeat center, #fff;
          background-size: cover;
        }
        &.headImg6::before {
          border-radius: 10px;
          background: url("/assets/image/tl.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg7::before {
          border-radius: 10px;
          background: url("/assets/image/mrfz.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
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