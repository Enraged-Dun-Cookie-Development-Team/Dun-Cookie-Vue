<template>
  <div class="background" :class="settings.getColorTheme()">
    <div id="app">
      <el-card class="box-card" shadow="never">
        <el-row
          type="flex" align="middle"
          justify="space-around"
        >
          <el-image class="img" :src="logo" />
          <div class="version">
            小刻食堂 V{{ currentVersion }}
          </div>
        </el-row>
        <el-divider>感谢</el-divider>
        玩了方舟已经两年了，身为开服玩家，我根本不知道方舟竟然能陪我走这么远。
        <br />
        在方舟之前，我并没玩过手游，那些遥远的名字，什么天美，米哈游，网易游戏也是只闻其声，不玩其游。
        那时候，手游对我来说只是一个名字，我并不知道为什么很多人会为此着迷，我也不知道为什么会有人在里面一掷千金。
        终于，在2019年5月15日，我在B服上下载了明日方舟。
        进入游戏后，因为没玩过其他手游，我对游戏内各种“繁杂”的系统不知所措，被各种引导页绕得头晕转向。
        在各种引导之后，我进入了新手抽卡页面，(毕竟这个按钮太大了，我一下就被这个按钮吸引了)出了我的第一个六星：星熊。
        在龙门近卫局的带领下，我披荆斩棘，一路走来。
        <br />
        而现在，我已近成为了一名咸鱼刀客塔，为了体验最优秀的方舟视觉和音效，买了人生中的最贵的平板，三星tabS7+。
        每天早上醒来第一件事，就是在基建收获996员工的福报，刷芯片本龙门币和万恶胶水
        <br />
        我是skip党，对剧情的了解只有谁是属于哪个阵营的，剧情也是看了就忘，但是鹰角的音乐是针不戳！
        音乐深入身心，一首《永冻症》绕梁三日，一首《Lullabye》催人泪下。
        渐渐地，我开始关注起了方舟的动态，期待新的干员的音乐，关注起了兔兔的微博，盼望新的表情包和周边。
        我开始了蹲饼。
        <br />
        前期的蹲饼真的很辛苦，各个渠道杂乱无章，出神入化的大佬PS让我不止被骗一次。
        因为是程序员，所以上班用手机的频率比用电脑的频率低得多，于是我萌生出了Chrome插件的想法。
        说干就干，今年3月3日，蹲饼1.0出身了。当时的功能单一到只能设置蹲饼频率，来源页只有B站的数据源，界面复古。
        <img src="https://img.nga.178.com/attachments/mon_202103/03/-klbw3Q16r-5qnhK2iT1kSae-iq.jpg" />
        他是我的第一个正式对外的项目，我怀着激动又害怕的心情发表到了<a href="https://ngabbs.com/read.php?tid=25757955">NGA</a>，
        但是没想到反响很大，里面有着对我的各种鼓励和支持。
        <br />
        2021年3月9日，对蹲饼是个有纪念意义的日子，蹲饼有了第二个亲爹（。
        lwt对我的帮助不止于帮我过图。还有帮我对程序的发布，测试，售后，维护等等各种繁杂的事情。
        从此，蹲饼的开发速度直线飙升。
        2021年4月20号，蹲饼的V2横空出世，用了全新的界面和架构，在各方面的建议下，加了无数新功能，快捷连接等等，蹲饼的源头也从B站微博蹲到了各种官网。
        2021年4月25号，我们与周年庆前夕发布了V2的正式版，可惜由于正值周年庆，帖子石沉大海。
        正当我泄气的时候，lwt发了一个帖子，从头到尾详细的介绍了蹲饼，然后帖子不出意料的火了，被我们帮助到的刀客塔越来越多。
        <br />
        现在，我们蹲饼用户已超过了3000人，每天列表被点击2000多次，造成我们服务器CDN流量大增。所以……
        <el-divider>捐助方式</el-divider>
      </el-card>
    </div>
  </div>
</template>

<script>
import Settings from '../common/Settings';
import { CURRENT_VERSION } from '../common/Constants';

export default {
    name: "App",
    data() {
        return {
            logo: "",
            currentVersion: CURRENT_VERSION,
            settings: Settings,
        };
    },
    computed: {
    },
    watch: {},
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.settings.doAfterInit((settings) => {
                this.logo = "/assets/image/" + settings.logo;
            });
        },
    },
};
</script>

<style lang="less" scoped>
@import "../theme/theme.less";

.styleChange(@theme) {
  @bgColor: "bgColor-@{theme}"; // 背景颜色
  @content: "content-@{theme}"; // 文本颜色
  @timeline: "timeline-@{theme}"; // 时间线颜色和时间线border颜色
  @subTitle: "subTitle-@{theme}"; // 小标题颜色
  @btnBorder: "btnBorder-@{theme}"; // 按钮边框颜色和一些小线条
  @setLarge: "setLarge-@{theme}"; // 设置标题颜色
  @setSmall: "setSmall-@{theme}"; // 设置文本颜色
  @shadow: "shadow-@{theme}"; // 卡片的阴影
  @hover: "hover-@{theme}"; // 按钮hover颜色
  @numberInput: "numberInput-@{theme}"; //设置页面加减按钮

  #app {
    /deep/ a {
      color: @@content!important;
    }

    width: 600px;
    min-width: 600px;
    margin: auto;
    // .is-always-shadow {
    //   box-shadow: 0 2px 12px 0 @@shadow;
    // }
    .box-card {
      background-color: @@bgColor;
      border: @@btnBorder 1px solid;

      .el-divider {
        background-color: @@btnBorder;
      }
      .img {
        width: 50px;
      }
      .version {
        font-size: 1.5rem;
        color: @@setLarge;
      }
      .info {
        text-align: center;
        .info-title {
          font-size: 1.3rem;
          color: @@setLarge;
        }
        .info-time {
          font-size: 0.8rem;
          color: #aaa;
          margin: 10px 0;
        }
      }
      .el-tabs--border-card {
        border: @@btnBorder 1px solid;
        box-shadow: none;

        /deep/.el-tabs__header {
          background-color: @@numberInput;
          border-bottom: 1px solid @@btnBorder;
        }
        /deep/.el-tabs__item {
          color: @@subTitle;
        }
        /deep/.el-tabs__item.is-active {
          background-color: @@bgColor;
          border-right-color: @@btnBorder;
          border-left-color: @@btnBorder;
        }
        /deep/.el-tabs__content {
          background-color: @@bgColor;
        }
      }

      /deep/.el-input-number.is-controls-right .el-input-number__increase {
        border-bottom: 1px solid @@btnBorder;
      }
      /deep/.el-input-number__increase,
      /deep/.el-input-number__decrease {
        background-color: @@numberInput;
        border-left: @@btnBorder 1px solid;
        color: @@setSmall;
      }
      /deep/.el-input-number__increase:hover + .el-input > .el-input__inner,
      /deep/.el-input-number__decrease:hover
        + .el-input-number__increase
        + .el-input
        > .el-input__inner {
        border: #409eff 1px solid;
      }
      /deep/.el-input__inner {
        background-color: @@bgColor;
        color: @@setLarge;
        border: @@btnBorder 1px solid;
      }
      /deep/.el-input__inner:focus {
        border-color: #409eff;
      }
      /deep/.el-form-item__label,
      /deep/.el-radio,
      /deep/.el-checkbox {
        color: @@setSmall;
      }
      .lowfrequency-time-picker {
        width: 100%;
      }
      .el-radio__input.is-checked + .el-radio__label {
        color: #409eff;
      }
      .btn-area {
        width: 100%;
        text-align: center;
        margin-top: 10px;
      }

      .checkbox-area {
        display: flex;
        align-items: center;
        .iconimg {
          margin-right: 5px;
          width: 16px;
        }
      }
      /deep/.footer {
        color: @@setLarge;
      }
    }
  }
  .white {
    background-color: #fff;
  }
}

.background {
  transition: background 0.5s;
  height: calc(100vh - 16px);
  overflow: auto;
}

.dark {
  .styleChange(dark);
  margin: -8px;
  background-color: #22272e;
  border: #22272e 8px solid;
}

.light {
  .styleChange(light);
}
</style>
