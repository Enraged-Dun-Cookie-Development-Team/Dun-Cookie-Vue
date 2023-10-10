<template>
  <div id="app">
    <el-card class="box-card">
      <el-row type="flex" align="middle" justify="space-around">
        <div style="display: flex; align-items: center">
          <el-image class="img" :src="logo" />
          <span class="version">欢迎使用小刻食堂 V{{ currentVersion }}</span>
        </div>
      </el-row>
      <el-divider />
      <div class="info">
        <div class="info-title">小刻已经进入食堂找饼啦！</div>
        <div class="info-title">让我们和小刻一起等待自由的兔兔发饼吧！</div>
      </div>
      <el-divider />
      <div>
        如果有意见或建议或想法请在<a href="https://jq.qq.com/?_wv=1027&k=Vod1uO13">【蹲饼组】</a>反馈 (QQ群：362860473)
      </div>
      <el-divider />
      <div v-if="settings.agreeLicense">
        <el-button
          type="success"
          icon="el-icon-check"
          circle
          style="pointer-events: none; margin-right: 8px"
        ></el-button
        >您已同意小刻食堂用户协议！
      </div>
      <!-- 这里使用display而不是v-else来保证元素一定存在，这样才能方便检测是否完整阅读了协议(滚动条拉到底) -->
      <div :style="{ display: settings.agreeLicense ? 'none' : 'block' }">
        <p>阅读并同意用户协议才能启动蹲饼哦！</p>
        <div
          style="
            overflow-y: scroll;
            padding: 0 0.5rem 0 1rem;
            height: 400px;
            font-size: 1rem;
            border: 2px solid #eff;
            border-radius: 2%;
            background-color: #eee;
          "
        >
          <h3>《产品声明》</h3>
          <p>本产品为非商业化产品，除捐助用于服务器运行资金外无任何收益。</p>
          <p>本产品仅供学习交流使用。</p>
          <p>
            本产品相关内容（文字、图片、音视频等）均来源于/转自第三方，平台转载相关内容不视为对于相关内容、观点的认可，亦不视为对于相关内容的真实性、准确性、完整性、合法性做出任何承诺。相关内容的真实合法性由内容发布者自行承担，本平台不承担相关法律责任。本平台已明确提示内容来源，如相关内容侵犯了您的合法权益，您亦需联系发布源进行处理。
          </p>
          <p>
            来自于第三方网站的链接，系由平台根据您的搜索需求或为向您提供便利而提供或设置，外部链接指向的不由本平台实际控制的任何网页上的内容，本平台不承担任何责任。您可能从该第三方网站上获得资讯及享用服务，本平台网无法控制第三方提供的内容、服务的质量、安全或合法性、信息的真实性或准确性。您应自行谨慎判断确定，并自行承担因此产生的责任与损失。除非本平台另有明确规定，若您对于第三方网站或链接有任何异议，您应联系第三方网站的内容或链接提供者处理。
          </p>
          <p>如若侵犯第三方权益，请您及时与我们联系，我们将立刻整改。</p>
          <br />
          <h3>《用户守则》</h3>
          <p>
            欢迎使用由小刻食堂开发团队（以下简称「开发组」）开发的「小刻食堂」系列。在您使用本框架之前，请仔细阅读并完全理解本声明。一旦您开始使用小刻食堂，即表示您同意遵守本声明中的所有条款和条件。
          </p>
          <p><strong>使用目的：</strong></p>
          <p style="text-indent: 2em">
            小刻食堂是一个免费开源的软件项目，旨在为用户提供抓取B站、微博、明日方舟通讯组等API数据的功能，并提供多种实用功能，如实时饼消息通知、快速跳转链接、饼内容分享、详细内容查看、饼内容图片生成、理智回复时间计算等。
          </p>
          <p><strong>合法合理使用：</strong></p>
          <p style="text-indent: 2em">
            您承诺以合法、合理的方式使用小刻食堂，不得将其用于任何违法、侵权或其他恶意行为，也不得将其应用于违反当地法律法规的Web平台。
          </p>
          <p><strong>免责声明：</strong></p>
          <p style="text-indent: 2em">
            开发组对于因使用小刻食堂而引起的任何意外、疏忽、合同损害、诽谤、版权或知识产权侵权以及由此产生的损失（包括但不限于直接、间接、附带或衍生的损失等）不承担任何法律责任。
          </p>
          <p><strong>风险承担：</strong></p>
          <p style="text-indent: 2em">
            用户明确同意，使用小刻食堂所存在的风险和后果将完全由用户自行承担，开发组不承担任何法律责任。
          </p>
          <p><strong>合法发布和使用：</strong></p>
          <p style="text-indent: 2em">
            用户在遵守本声明的前提下，可在《GPLv3
            开源许可证》所允许的范围内合法地发布、传播和使用小刻食堂。对于因违反本声明或法律法规造成的法律责任（包括但不限于民事赔偿和刑事责任），将由违约者自行承担。
          </p>
          <p><strong>知识产权：</strong></p>
          <p style="text-indent: 2em">
            小刻食堂及其相关产品享有开发组的知识产权保护，包括但不限于商标权、专利权、著作权、商业秘密等，受相关法律法规保护。
          </p>
          <p><strong>条款变更：</strong></p>
          <p style="text-indent: 2em">
            开发组有权随时单方面修改本声明条款及附件内容，并通过消息推送、网页公告等方式进行公布。变更后的条款在公布后立即生效，用户继续使用即表示您已充分阅读、理解并接受修改后的声明内容。
          </p>
          <br />
          <p ref="readLicenseDetect">
            请在使用小刻食堂之前仔细阅读并理解本声明。如果您有任何疑问，请咨询相关法律专业人士。感谢您的合作与支持！
          </p>
          <p>小刻食堂开发团队</p>
        </div>
        <el-tooltip
          class="item"
          effect="dark"
          content="需要先完整阅读协议才能同意哦！"
          placement="top"
          :disabled="alreadyReadLicense"
        >
          <el-button
            ref="agreeProtocolButton"
            type="primary"
            round
            :disabled="!alreadyReadLicense"
            @click="agreeProtocol()"
            >同意协议</el-button
          >
        </el-tooltip>
      </div>
      <el-divider />
      <div>你可以点击图标查看蹲饼列表</div>
      <el-divider />
      <el-collapse v-model="activeNames">
        <el-collapse-item title="可以点击这里查看把蹲饼置顶在浏览器上的方法~" name="1">
          <div class="blue">点击展开全部插件列表</div>
          <img src="/assets/welcome/1.jpg" />
          <br />
          <div class="blue">将置顶按钮激活</div>
          <img src="/assets/welcome/2.jpg" />
          <img src="/assets/welcome/3.jpg" />
          <br />
          <div class="blue">开始看饼</div>
          <img src="/assets/welcome/4.jpg" />
        </el-collapse-item>
      </el-collapse>
      <el-divider />
      <div v-if="settings.feature.options">
        现在可以点击
        <el-button size="mini" @click="toSetting"> 设置 </el-button>
        进入设置来调整蹲饼器
      </div>
      <el-divider />
      <div>
        现在可以点击
        <el-button size="mini" @click="toGithub"> Github </el-button>
        查看项目源码。
        <span style="color: #23ade5">欢迎点star哦</span>
      </div>
      <el-divider />
      <Feedback />
    </el-card>
  </div>
</template>

<script>
import Feedback from '../components/Feedback';
import { CURRENT_VERSION, PAGE_GITHUB_REPO, PAGE_OPTIONS } from '../common/Constants';
import Settings from '../common/Settings';
import PlatformHelper from '../common/platform/PlatformHelper';

const licenseVersion = 'v1';

export default {
  name: 'Welcome',
  components: { Feedback },

  data() {
    return {
      logo: '',
      currentVersion: CURRENT_VERSION,
      settings: Settings,
      alreadyReadLicense: false,
      activeNames: [1],
    };
  },
  computed: {},
  mounted() {
    this.init();
    const itemObserver = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        this.alreadyReadLicense = true;
        itemObserver.disconnect();
      }
    });
    itemObserver.observe(this.$refs.readLicenseDetect);
  },
  methods: {
    init() {
      this.settings.doAfterInit((settings) => {
        this.logo = '/assets/image/' + settings.logo;
      });
    },
    toSetting() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_OPTIONS);
    },
    toGithub() {
      PlatformHelper.Tabs.create(PAGE_GITHUB_REPO);
    },
    agreeProtocol() {
      // 同意协议启动蹲饼
      this.$refs.agreeProtocolButton.$attrs.loading = 'true';
      this.settings.agreeLicense = licenseVersion;
      this.settings.open = true;
      this.settings.saveSettings().then(() => {
        this.$message({
          center: true,
          message: "已开启蹲饼('▽'〃)",
          type: 'success',
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  margin: auto;
  max-width: 800px;
  font-size: 1rem;

  .img {
    width: 50px;
  }

  .blue {
    font-size: 1.2rem;
    color: #23ade5;
  }

  .version {
    font-size: 1.5rem;
  }

  .info {
    text-align: center;

    .info-title {
      font-size: 1.3rem;
    }

    .info-time {
      margin: 10px 0;
      font-size: 0.8rem;
      color: #aaa;
    }
  }

  .btn-area {
    width: 100%;
    text-align: right;
  }

  .checkbox-area {
    display: flex;
    align-items: center;

    .iconimg {
      margin-right: 5px;
      width: 16px;
    }
  }

  :deep(.el-collapse) {
    border-top: 0;
    border-bottom: 0;
  }

  :deep(.el-collapse-item__header) {
    border-bottom: 0;
  }
}
</style>
