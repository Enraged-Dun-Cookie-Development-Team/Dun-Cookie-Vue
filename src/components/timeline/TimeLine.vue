<template>
  <el-timeline :class="settings.display.windowMode ? 'window' : ''">
    <MyElTimelineItem
      v-for="(item, index) in cardlist"
      :key="index"
      :timestamp="item.timeForDisplay"
      placement="top"
      :icon-style="{'--icon': `url('${getDataSourceByName(item.dataSource).icon}')`}"
      :icon="'headImg'"
    >
      <el-card
        class="card"
        :class="[`font-size-${settings.display.fontSize}`, {'special-source': item.component}]"
        shadow="never"
      >
        <span>
          <el-button
            class="to-copy-btn"
            :class="{'special-source': item.componentData}"
            size="small"
            @click="copyData(item)"
            title="复制该条内容及链接"
            ><i class="el-icon-document-copy"></i
          ></el-button>
          <el-button
            v-if="!item.componentData"
            class="to-url-btn"
            size="small"
            title="前往该条内容"
            @click="openUrl(item.jumpUrl)"
            ><i class="el-icon-right"></i
          ></el-button>
          <span class="is-top-info" v-if="item.isTop">
            <span class="color-blue">【当前条目在{{getDataSourceByName(item.dataSource).title}}的时间线内为置顶状态】</span>
          </span>
        </span>
        <component :is="resolveComponent(item)" :item="item" :show-image="imgShow"></component>
      </el-card>
    </MyElTimelineItem>
  </el-timeline>
</template>

<script>
import BrowserUtil from '../../common/util/BrowserUtil';
import {CURRENT_VERSION} from '../../common/Constants';
import MyElTimelineItem from './MyTimeLineItem';
import DefaultItem from './items/DefaultItem';
import DataSourceUtil from '../../common/util/DataSourceUtil';
import Settings from '../../common/Settings';

export default {
  name: "TimeLine",
  components: {MyElTimelineItem},
  props: ["cardlist", "imgShow"],
  data() {
    return {
      settings: Settings
    };
  },
  mounted() {},
  methods: {
    openUrl: BrowserUtil.createTab,
    resolveComponent(item) {
      if (!item.componentData) {
        return DefaultItem;
      }
      return this.getDataSourceByName(item.dataSource).dataType;
    },
    getDataSourceByName(dataName) {
      return DataSourceUtil.getByName(dataName);
    },
    // 复制
    copyData(item) {
      this.$copyText(
        `${item.content.replace(
          /<br\/>/g,
          `
`
        )}   

${item.url}

数据由 小刻食堂${CURRENT_VERSION} 收集
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
  },
};
</script>
<style lang="less">
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
@import "../../theme/theme.less";

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
      // 需要特殊显示的数据源只提供复制按钮，跳转由数据源自行实现
      &.special-source {
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

    // 需要特殊显示的数据源
    &.special-source {
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
    &.window{
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
        &.headImg::before {
          border-radius: 10px;
          background: var(--icon) no-repeat center, @@bgColor;
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
