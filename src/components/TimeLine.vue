<template>
  <div>
    <!-- <div class="search-area">？？</div> -->
    <el-timeline :class="setting.isWindow ? 'window' : ''">
      <el-timeline-item
        v-for="(item, index) in cardlist"
        :key="index"
        :timestamp="
          item.source == 2 || item.source == 5 || item.source == 7
            ? timespanToDay(item.time, 1)
            : timespanToDay(item.time)
        "
        placement="top"
        :icon="'headImg' + item.source"
      >
        <el-card
          class="card"
          :class="'font-size-' + setting.fontsize + ' soure-' + item.source"
          shadow="never"
        >
          <span>
            <el-button
              class="to-copy-btn"
              :class="item.source != 8 && item.source != 9 ? '' : 'rigth-zero'"
              size="small"
              @click="copyData(item)"
              title="复制该条内容及链接"
              ><i class="el-icon-document-copy"></i
            ></el-button>
            <el-button
              v-if="item.source != 8 && item.source != 9"
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
          </span>
          <!-- 泰拉记事社 -->
          <div v-if="item.source == 8" class="tlgw">
            <img v-if="imgShow" class="image-back" v-lazy="item.image" />
            <div class="content-card">
              <div class="content-card-info">
                <img
                  v-if="imgShow"
                  v-lazy="item.image"
                  class="content-card-image"
                />
                <div class="content-card-title">{{ item.name }}</div>
                <div class="content-card-introduction">
                  {{ item.html.introduction }}
                </div>
                <div class="content-card-subtitle">
                  {{ item.html.subtitle }}
                </div>
              </div>
              <div class="content-card-episodes">
                <span
                  v-for="episodes in item.html.episodes"
                  :key="episodes.cid"
                  class="content-card-episodes-btn"
                  @click="
                    openUrl(
                      `https://terra-historicus.hypergryph.com/comic/${item.html.cid}/episode/${episodes.cid}`
                    )
                  "
                  >{{ episodes.title }}</span
                >
              </div>
            </div>
          </div>
          <!-- 网易云音乐 -->
          <div
            v-else-if="item.source == 9"
            class="wyyyy"
            @click="openUrl(item.url)"
          >
            <img v-if="imgShow" class="image-back" v-lazy="item.image" />
            <div class="content-card">
              <div class="record-area">
                <div class="record-area-record">
                  <img class="record-image" v-lazy="item.image" />
                </div>
                <img
                  class="record-image-back"
                  v-lazy="'assets/image/record.png'"
                />
              </div>
              <div class="record-info">
                {{ item.name }}
              </div>
              <div class="record-size">共{{ item.size }}首</div>
              <div class="record-btn">
                <i class="el-icon-d-arrow-right"></i>
                Go To Album
              </div>
            </div>
          </div>
          <div v-else>
            <!-- 普通列 -->
            <div>
              <el-row>
                <div v-html="item.dynamicInfo"></div>
                <!-- 如果有转发 -->
                <el-card
                  v-if="item.retweeted"
                  class="card margintb"
                  shadow="never"
                >
                  转发至 @{{ item.retweeted.name }}:
                  <br />
                  <span v-html="item.retweeted.dynamicInfo"></span>
                </el-card>
              </el-row>
              <el-row
                v-if="imgShow && setting.imgshow && item.image"
                class="margintb"
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
                    class="multi-img"
                  >
                    <el-row :gutter="5">
                      <el-col
                        v-for="(img, index) in item.imageList"
                        :key="img"
                        :span="8"
                        class="multi-img-area"
                        ><img
                          v-lazy="img"
                          class="img"
                          :ref="item.id + '_' + index"
                        />
                        <!-- <span
                        class="img-btn img-copy-btn"
                        @click.stop="copyImg(item.id + '_' + index)"
                        ><i class="el-icon-document-copy"></i
                      ></span> -->
                        <span
                          class="img-btn img-look-btn"
                          @click.stop="
                            ViewImg(item, img, item.id + '_' + index)
                          "
                          ><i class="el-icon-view"></i
                        ></span>
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else class="one-img">
                    <img v-lazy="item.image" :ref="item.id" class="img" />
                    <!-- <span
                    class="img-btn img-copy-btn"
                    @click.stop="copyImg(item.id)"
                    ><i class="el-icon-document-copy"></i
                  ></span> -->
                    <span
                      class="img-btn img-look-btn"
                      @click.stop="ViewImg(item, item.image, item.id)"
                      ><i class="el-icon-view"></i
                    ></span>
                  </div>
                </div>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { timespanToDay } from "../assets/JS/common";
export default {
  name: "TimeLine",
  props: ["cardlist", "setting", "saveInfo", "imgShow"],
  data() {
    return {
      showAllImage: [],
      windowTabId: null,
      // imgShow: false,
    };
  },
  mounted() {},
  methods: {
    timespanToDay,

    copyImg(refName) {
      let width = this.$refs[refName][0].naturalWidth;
      let height = this.$refs[refName][0].naturalHeight;
      let img = this.$refs[refName][0];
      try {
        console.log("图片已被复制！");
      } catch (err) {
        console.error(err.name, err.message);
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
      let width = this.$refs[refName][0].naturalWidth + 32 || 1100;
      let height = this.$refs[refName][0].naturalHeight + 67 || 750;
      if (this.windowTabId != null) {
        chrome.windows.remove(this.windowTabId);
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
          }, 500);
        }
      );
    },
    // 复制文本
    copyData(item) {
      this.$copyText(
        `${item.dynamicInfo.replace(
          /<br\/>/g,
          `
`
        )}   

${item.url}

数据由 小刻食堂${this.saveInfo.version} 收集
工具链接：https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue`
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
// 图片加载中
img[lazy="loading"] {
  -webkit-animation: loading 1s linear 1s 5 alternate;
  animation: loading 1s linear infinite;
}

img[lazy="error"] {
  filter: brightness(20%);
}

@keyframes loading {
  from {
    filter: brightness(20%);
  }
  50% {
    filter: brightness(90%);
  }
  to {
    filter: brightness(20%);
  }
}
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
    width: 100%;
    background-color: @@bgColor;
    border: @@timeline solid 1px;
    color: @@content;

    // .retweeted  {
    //   background-color: @@bgColor;
    //   border: @@timeline solid 1px;
    //   color: @@content;
    // }

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
      margin: 10px 0 0 0;
    }
    .img-area {
      width: 100%;
      height: 150px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      .multi-img {
        max-width: 700px;
        width: 100%;
        margin: auto;
        .multi-img-area {
          position: relative;
        }
      }
      .one-img {
        max-width: 700px;
        width: 100%;
        margin: auto;
        position: relative;
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
        border-radius: 4px;
        width: 100%;
      }
      // 图片操作按钮
      .img-btn {
        position: absolute;
        z-index: 1;
        right: 6px;
        top: 2px;
        width: 26px;
        height: 20px;
        text-align: center;
        background: #fff;
        line-height: 16px;
        border-radius: 3px;
        i {
          font-size: 12px;
        }
      }
      .img-copy-btn {
        right: 36px;
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
      &.rigth-zero {
        right: 0;
      }
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

    // 罗德岛泰拉记事簿 网易云音乐
    &.soure-8,
    &.soure-9 {
      .el-card__body {
        padding: 0 !important;
      }
    }
  }

  .el-card__body {
    padding: 10px;
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
  .el-timeline {
    padding-left: 25px;
    overflow: auto;
    padding-top: 20px;
    padding-right: 20px;
    height: 420px;
    margin-top: 10px;
    &.window {
      height: calc(100vh - 179px);
    }
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
          background: url("/assets/image/cho3Weibo.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg4::before {
          border-radius: 10px;
          background: url("/assets/image/ys3Weibo.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg5::before {
          background: url("/assets/image/sr.ico") no-repeat center, #fff;
          background-size: cover;
        }
        &.headImg6::before {
          border-radius: 10px;
          background: url("/assets/image/tlWeibo.jpg") no-repeat center,
            @@bgColor;
          background-size: cover;
        }
        &.headImg7::before {
          border-radius: 10px;
          background: url("/assets/image/mrfz.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg8::before {
          border-radius: 10px;
          background: url("/assets/image/tl.jpg") no-repeat center, @@bgColor;
          background-size: cover;
        }
        &.headImg9::before {
          border-radius: 10px;
          background: url("/assets/image/wyyyy.ico") no-repeat center, @@bgColor;
          background-size: cover;
        }
      }
    }
  }

  // 泰拉官网单独使用样式
  .tlgw {
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
      padding: 2% 4%;
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
        width: 240px;
        margin: 0 0 0 20px;
        max-height: 310px;
        overflow: auto;
        .content-card-episodes-btn {
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

  // 网易云音乐单独使用样式
  .wyyyy {
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
          left: 0;
          top: 5px;
          height: 110px;
          transition: all 0.5s;
          left: 35px;
        }
      }
      // 右边
      .record-info {
        transition: all 0.5s;
        font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei;
        font-size: 1.8rem;
        color: #fff;
        width: 380px;
        text-align: center;
        right: 0;
        position: absolute;
        top: 60px;
        padding: 10px 0;
      }
      .record-size {
        transition: all 0.5s;
        position: absolute;
        bottom: 17px;
        right: 330px;
        font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei;
        color: #fff;
        font-size: 1.2rem;
        opacity: 0;
      }
      .record-btn {
        transition: all 0.5s;
        font-family: Geometos, "Sans-Regular", "SourceHanSansCN-Regular", YaHei;
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
          border-radius: 4px;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
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
}

.dark {
  .styleChange(dark);
}

.light {
  .styleChange(light);
}

.search-area {
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 11;
}
</style>