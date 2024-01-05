<template>
  <div :class="settings.getColorTheme()">
    <div id="app">
      <!-- 理智计算 -->
      <el-drawer :visible.sync="toolDrawer" :show-close="false" direction="ttb" size="180px">
        <el-divider content-position="left"> 理智计算提醒 </el-divider>
        <el-form
          size="mini"
          class="sane-calculator"
          label-position="right"
          :inline="true"
          label-width="150px"
          style="text-align: center"
        >
          <el-form-item label="当前理智">
            <el-input-number
              ref="saneEdit"
              v-model="currentSan"
              :min="0"
              :max="settings.san.maxValue"
              label="输入当前理智"
            />
          </el-form-item>
          <el-form-item label="理智满后是否推送">
            <el-switch v-model="settings.san.noticeWhenFull" class="san-push" @change="settings.saveSettings()" />
          </el-form-item>
          <el-form-item>
            <el-button @click="saveSan"> 开始计算 </el-button>
          </el-form-item>
        </el-form>
        <div
          class="mention"
          style="
            margin-top: 16px;
            text-align: center;

            opacity: 0.4;
          "
        ></div>
      </el-drawer>
      <!-- 菜单 -->
      <el-drawer
        :visible.sync="drawer"
        :show-close="false"
        :direction="settings.display.windowMode ? 'rtl' : 'ttb'"
        size="520px"
      >
        <div class="edit-layout">
          <span>打开编辑模式</span>
          <el-switch v-model="isEdit"></el-switch>
        </div>

        <el-divider content-position="left"> 饼的发源地 </el-divider>
        <div
          ref="drawerBtnArea"
          class="drawer-btn-area drawer-btn-area-origin"
          :class="{ 'drawer-btn-area-scroll': isOriginScroll }"
        >
          <el-tooltip
            v-for="(item, index) in quickJump.source"
            :key="index"
            ref="dragEntitySourceEl"
            :content="item.nickname"
            placement="top"
            class="drag-entity"
          >
            <el-button v-if="isEdit && item.isActivated" size="small">
              <img
                class="btn-icon radius"
                :src="item.avatar"
                draggable="false"
                @mousedown="move($event, item, index, 'source')"
              />
              <div class="edit-icon" @click="deleteSource(item, index, quickJump.source)">
                <i class="el-icon-error"></i>
              </div>
            </el-button>
            <el-button v-else-if="isEdit && !item.isActivated" size="small" class="not-activated">
              <img class="btn-icon radius" :src="item.avatar" />
              <div class="edit-icon" @click="addSource(item, index, quickJump.source)">
                <i class="el-icon-circle-plus"></i>
              </div>
            </el-button>
            <el-button v-else-if="item.isActivated" size="small" @click="openUrl(item.jump_url)">
              <img class="btn-icon radius" :src="item.avatar" />
            </el-button>
          </el-tooltip>
        </div>
        <el-divider content-position="left"> 快捷工具 </el-divider>
        <div
          ref="toolPlatformEl"
          class="drawer-btn-area drawer-btn-area-origin"
          :class="{ 'drawer-btn-area-scroll': isToolScroll }"
        >
          <el-tooltip
            v-for="(item, index) in quickJump.tool"
            :key="index"
            ref="dragEntityToolEl"
            :content="item.nickname"
            placement="top"
            class="drag-entity"
          >
            <el-button v-if="isEdit && item.isActivated" size="small">
              <img
                class="btn-icon radius"
                :src="item.avatar"
                draggable="false"
                @mousedown="move($event, item, index, 'tool')"
              />
              <div class="edit-icon" @click="deleteSource(item, index, quickJump.tool)">
                <i class="el-icon-error"></i>
              </div>
            </el-button>
            <el-button v-else-if="isEdit && !item.isActivated" size="small" class="not-activated">
              <img class="btn-icon radius" :src="item.avatar" />
              <div class="edit-icon" @click="addSource(item, index, quickJump.tool)">
                <i class="el-icon-circle-plus"></i>
              </div>
            </el-button>
            <el-button v-else-if="item.isActivated" size="small" @click="openUrl(item.jump_url)">
              <img class="btn-icon radius" :src="item.avatar" />
            </el-button>
          </el-tooltip>
        </div>
        <el-divider v-if="quickJump.url" content-position="left"> 快捷链接 </el-divider>
        <div ref="drawerBtnAreaQuickJump" class="drawer-btn-area-quickJump">
          <el-tooltip v-for="(item, index) in quickJump.url" :key="index" :content="item.title" placement="top">
            <div class="quickJump-img-area" style="vertical-align: middle; display: table-cell">
              <img
                v-if="LazyLoaded"
                v-lazy="item.cover_img"
                class="btn-icon radius"
                @click="openUrl(item.video_link)"
              />
              <div class="author">
                <p>{{ item.author }}</p>
              </div>
            </div>
          </el-tooltip>
        </div>
        <el-divider content-position="left"> 调整蹲饼器 </el-divider>
        <el-row class="menu-button-area" type="flex" justify="center">
          <el-button type="primary" icon="el-icon-star-off" @click="openGithub"> 点个star </el-button>
          <el-button type="primary" icon="el-icon-refresh" @click="openUpdate"> 检查插件更新 </el-button>
          <el-button
            v-if="settings.open && settings.feature.options"
            type="primary"
            icon="el-icon-setting"
            @click="openSetting"
          >
            设置
          </el-button>
          <el-button type="primary" icon="el-icon-upload2" @click="drawer = false"> 收起 </el-button>
        </el-row>
        <div style="position: absolute; right: 10px; bottom: 10px" class="sign">
          Powered By <span @click="openAboutUs">小刻食堂</span>
        </div>
      </el-drawer>
      <!-- 置顶按钮 -->
      <el-button
        icon="el-icon-top"
        type="primary"
        circle
        class="top-btn"
        :class="!drawer && scrollShow ? 'top-btn-show' : ''"
        @click.stop="goTop()"
      />
      <div class="title-area">
        <div class="version">
          {{ `小刻食堂 V${currentVersion}` }}
          <span>
            <span v-if="settings.open"
              >【已蹲饼 <countTo :start-val="oldDunCount" :end-val="dunInfo.counter" :duration="1000" />次】
            </span>
            <template v-if="isCustomBuild">
              <span>【自定义构建 By: {{ BUILD_BY() }}】</span>
            </template>
            <span v-if="settings.checkLowFrequency()">【低频蹲饼中】</span>
          </span>
        </div>
        <div class="countdown-and-btn">
          <div v-show="countDownList.length > 0" class="count-down-area" @click="openCountDown()">
            <div v-for="(item, index) in countDownList" :key="index" :title="'到点时间：' + item.stopTime">
              {{ item.name }}:剩余约{{ item.timeStr }}
            </div>
            <div>【本数据仅会在打开列表时刷新】</div>
          </div>
          <div class="count-down-area" @click="openSponsor">
            <div>支持食堂</div>
          </div>
          <Menu-Icon
            :class="[drawer ? 'menu-btn-open' : 'menu-btn-close', firefox ? 'menu-btn-firefox' : '', 'menu-btn']"
            @handleIconClick="handleIconClick()"
          />
        </div>
      </div>
      <div id="content">
        <time-line
          v-if="settings.open"
          ref="timeline"
          :img-show="LazyLoaded"
          :card-list-all="cardList"
          @cardListChange="goTop(1, 0)"
        />
        <div class="protocol-warning">
          <el-divider content-position="left"> 重要事项 </el-divider>
          <el-row class="protocol-area">
            <div class="warning-msg">
              小刻因为偷吃太多零食被关禁闭了{{ '>"<|||' }}，能不能帮帮小刻<br />
              请同意用户协议，解救小刻！
            </div>
            <el-button type="primary" @click="openWelcome">前往用户协议</el-button>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import countTo from 'vue-count-to';
import TimeLine from '../components/timeline/TimeLine';
import Settings from '../common/Settings';
import TimeUtil from '../common/util/TimeUtil';
import SanInfo from '../common/sync/SanInfo';
import DunInfo from '../common/sync/DunInfo';
import MenuIcon from '@/popup/MenuIcon';
import {
  BUILD_BY,
  dayInfo,
  ENABLE_FEATURES,
  MESSAGE_GET_COUNTDOWN,
  PAGE_CEOBECANTEEN_WEB_ABOUT_US,
  PAGE_CEOBECANTEEN_WEB_SPONSOR,
  PAGE_GITHUB_REPO,
  PAGE_OPTIONS,
  PAGE_TIME,
  PAGE_UPDATE,
  PAGE_WELCOME,
  PLATFORM_FIREFOX,
  SHOW_VERSION,
} from '../common/Constants';
import PlatformHelper from '../common/platform/PlatformHelper';
import 'animate.css';
import CardList from '../common/sync/CardList';
import ServerUtil from '../common/util/ServerUtil';

export default {
  name: 'App',
  components: { countTo, TimeLine, MenuIcon },
  data() {
    CardList.doAfterUpdate((data) => {
      const oldIds = this.cardList.map((it) => it.id);
      if (this.cardList.length === 0) {
        this.cardList = data.getFirstPageList();
      }
      if (oldIds.length > 0 && data.getFirstPageList().find((it) => oldIds.indexOf(it.id) === -1)) {
        this.$message({
          offset: 50,
          center: true,
          message: '蹲到新饼，请重新打开弹框查看！',
          type: 'success',
        });
      }
    });
    return {
      san: SanInfo,
      currentSan: SanInfo.currentSan,
      show: false,
      LazyLoaded: false,
      isNew: false,
      cardList: CardList.getFirstPageList(),
      currentVersion: SHOW_VERSION,
      onlineSpeakList: [],
      oldDunCount: 0,
      dunInfo: DunInfo,
      settings: Settings,
      drawer: false, // 打开菜单
      drawerFirst: false, // 这次打开窗口是否打开过二级菜单
      toolDrawer: false, // 理智计算器菜单
      isReload: false, // 是否正在刷新
      quickJump: {
        source: [],
        tool: [],
        url: [],
      },
      dayInfo: dayInfo,
      loading: true, // 初始化加载
      onlineDayInfo: {},
      scrollShow: false,
      firefox: false,
      countDownList: [],
      // allHeight: 0,
      isOriginScroll: false,
      isToolScroll: false,
      isCustomBuild: false,
      isEdit: false,
    };
  },
  computed: {},
  watch: {
    drawer(value) {
      if (value) {
        this.$nextTick(() => {
          this.bindScrollFun();
        });
      } else {
        this.unbindScrollFun();
      }
    },
  },
  created() {},
  mounted() {
    this.init();
    // 监听鼠标滚动事件
    window.addEventListener('scroll', this.handleScroll, true);
  },
  beforeDestroy() {},
  methods: {
    BUILD_BY() {
      return BUILD_BY;
    },
    openUrl: PlatformHelper.Tabs.create,
    init() {
      this.isCustomBuild = ENABLE_FEATURES.length > 0;
      this.initSourceJump();
      this.initToolJump();
      DunInfo.doAfterUpdate((data) => {
        this.oldDunCount = data.counter;
      });
      setTimeout(() => {
        if (PlatformHelper.PlatformType === PLATFORM_FIREFOX) {
          let div = document.getElementById('app');
          div.style.fontFamily = 'Microsoft yahei';
          this.firefox = true;
        }
        // 图片卡 先加载dom后加载图片内容
        this.LazyLoaded = true;
        this.listenerWindowSize();
        this.getCountDownList();
      }, 1);
    },
    handleIconClick() {
      if (!this.drawer && !this.drawerFirst) {
        this.getVideoJump();
        this.drawerFirst = true;
      } else if (this.drawer) {
        this.isEdit = false;
      }

      this.drawer = !this.drawer;
    },
    // 获取快速跳转视频信息
    getVideoJump() {
      ServerUtil.getVideoInfo().then((data) => {
        // 快捷连接
        let btnList = data.filter(
          (x) =>
            new Date(x.start_time) <= TimeUtil.changeToCCT(new Date()) &&
            new Date(x.over_time) >= TimeUtil.changeToCCT(new Date())
        );
        if (btnList.length > 0) {
          this.quickJump.url = btnList;
        }
      });
    },
    async firefoxWarning() {
      const flagKey = 'firefox-collapse-warning-flag';
      const flagDisableValue = 'disabled';
      const flag = await PlatformHelper.Storage.getLocalStorage(flagKey);
      if (flag === flagDisableValue) {
        return;
      }
      const warningCountKey = 'firefox-collapse-warning';
      const tip =
        '窗口太小,可能显示出现问题，您可以通过以下任意一种办法解决该问题：<br/>1.右键扩展图标并点击"移出折叠菜单"<br/>2.进入小刻食堂设置页面-界面设置-列表窗口化-启用';
      let count = parseInt(String(await PlatformHelper.Storage.getLocalStorage(warningCountKey)));
      if (!count) {
        count = 0;
      }
      count++;
      PlatformHelper.Storage.saveLocalStorage(warningCountKey, count).then();
      if (count < 3) {
        this.$alert(tip, '提示', {
          dangerouslyUseHTMLString: true,
        }).then();
      } else {
        this.$alert(
          tip +
            '<br/><span id="firefox-collapse-warning-tip" style="color: red">点击<button id="btn-disable-firefox-warning">此处</button>以后都不再提示</span>',
          '提示',
          {
            dangerouslyUseHTMLString: true,
          }
        ).then();
        setTimeout(() => {
          document.getElementById('btn-disable-firefox-warning').addEventListener('click', () => {
            PlatformHelper.Storage.saveLocalStorage(flagKey, flagDisableValue).then(() => {
              document.getElementById('firefox-collapse-warning-tip').innerHTML = '以后将不会再提示该信息';
            });
          });
        }, 10);
      }
    },
    listenerWindowSize() {
      if (!PlatformHelper.isMobile) {
        // 只在从大窗口缩小的时候提示(第一次除外)
        let fromLarge = true;
        window.onresize = () => {
          if (fromLarge && window.innerWidth <= 699) {
            if (
              PlatformHelper.PlatformType === PLATFORM_FIREFOX &&
              (window.innerWidth === 425 || window.innerWidth === 348)
            ) {
              // 425和348两个魔法值来源于：https://discourse.mozilla.org/t/can-add-ons-webextensions-popups-determinate-whether-they-are-shown-in-the-overflow-menu-or-not/27937/6
              this.firefoxWarning();
            }
            // 部分浏览器这个功能会出问题，直接关掉提示吧，反正一般也用不到
            // else {
            //   alert('窗口太小,可能显示出现问题');
            // }
          }
          fromLarge = window.innerWidth > 699;
        };
      }
    },
    scrollHandlerUrl() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      scrollDiv.scrollLeft = scrollDiv.scrollLeft + event.deltaY;
    },
    scrollHandlerSource(e) {
      let drawerBtnArea = this.$refs.drawerBtnArea;
      drawerBtnArea.scrollLeft = drawerBtnArea.scrollLeft + event.deltaY;
    },
    scrollHandlerTool(e) {
      let toolPlatformEl = this.$refs.toolPlatformEl;
      toolPlatformEl.scrollLeft = toolPlatformEl.scrollLeft + event.deltaY;
    },
    bindScrollFun() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      let drawerBtnArea = this.$refs.drawerBtnArea;
      let toolPlatformEl = this.$refs.toolPlatformEl;
      // 添加监听事件
      scrollDiv.addEventListener('wheel', this.scrollHandlerUrl, false);
      drawerBtnArea.addEventListener('wheel', this.scrollHandlerSource, false);
      toolPlatformEl.addEventListener('wheel', this.scrollHandlerTool, false);
      const bodyWidth = document.querySelector('body').offsetWidth;
      if (drawerBtnArea.scrollWidth > bodyWidth) this.isOriginScroll = true;
      if (toolPlatformEl.scrollWidth > bodyWidth) this.isToolScroll = true;
    },
    unbindScrollFun() {
      let scrollDiv = this.$refs.drawerBtnAreaQuickJump;
      let drawerBtnArea = this.$refs.drawerBtnArea;
      let toolPlatformEl = this.$refs.toolPlatformEl;
      scrollDiv.removeEventListener('wheel', this.scrollHandlerUrl);
      drawerBtnArea.removeEventListener('wheel', this.scrollHandlerSource);
      toolPlatformEl.removeEventListener('wheel', this.scrollHandlerTool);
    },
    // 获取倒计时数据
    getCountDownList() {
      PlatformHelper.Message.send(MESSAGE_GET_COUNTDOWN).then((data) => {
        this.countDownList = data.sort((x, y) => (new Date(x.stopTime) > new Date(y.stopTime) ? 1 : -1));
        console.log(this.countDownList);
      });
    },
    // 设置数据
    saveSan() {
      this.san.currentSan = this.currentSan;
      this.san.saveUpdate();
      this.toolDrawer = false;
      this.$message({
        offset: 50,
        center: true,
        message: '保存成功，开始计算',
        type: 'success',
      });
    },
    // 检测滚动条高度，大于600出现回顶部按钮
    handleScroll() {
      let scrollArea =
        this.$refs.timeline.$el.scrollTop == 0 ? this.$refs.timeline.$refs.elTimelineArea.$el : this.$refs.timeline.$el;
      this.scrollShow = scrollArea.scrollTop > 600 ? true : false;
    },

    // 回顶部
    goTop(step = 10, interval = 10) {
      if (!this.$refs.timeline || !this.$refs.timeline.$refs.elTimelineArea) {
        return;
      }
      let scrollArea =
        this.$refs.timeline.$el.scrollTop == 0 ? this.$refs.timeline.$refs.elTimelineArea.$el : this.$refs.timeline.$el;
      let top = scrollArea.scrollTop;
      if (step < 1) {
        step = 1;
      }
      let changeTop = top / step;
      const timeTop = setInterval(() => {
        scrollArea.scrollTop = top -= changeTop;
        if (top <= 0) {
          clearInterval(timeTop);
        }
      }, interval);
    },

    // 节点拖拽
    move(inite, value, index, flag) {
      let entities = null;
      let plItem = null;
      switch (flag) {
        case 'source':
          entities = this.$refs.dragEntitySourceEl;
          plItem = this.$refs.drawerBtnArea;
          break;
        case 'tool':
          entities = this.$refs.dragEntityToolEl;
          plItem = this.$refs.toolPlatformEl;
          break;
        default:
          break;
      }
      const dragEntity = entities[index].$el;

      let initLeft = dragEntity.offsetLeft - 10 - plItem.scrollLeft;
      let initTop = dragEntity.offsetTop;
      dragEntity.style.left = initLeft + 'px';
      dragEntity.style.top = initTop + 'px';

      dragEntity.style.position = 'absolute';
      dragEntity.style.zIndex = 100;

      let disX = inite.clientX;
      let disY = inite.clientY;
      document.onmousemove = (e) => {
        let left = e.clientX - disX;
        let top = e.clientY - disY;
        // 拖动到边缘时开启自动滚动
        if (left + initLeft < 50) {
          this.autoScroll(plItem, 'left');
        } else if (left + initLeft > plItem.offsetWidth - 80) {
          this.autoScroll(plItem, 'right');
        }
        dragEntity.style.left = left + initLeft + 'px';
        dragEntity.style.top = top + initTop + 'px';
      };
      document.onmouseup = (b) => {
        let moveX = dragEntity.offsetLeft;
        let moveY = dragEntity.offsetTop;
        // 拖拽实体的宽度
        let entityWidth = dragEntity.offsetWidth + 10;
        dragEntity.style.left = 'initial';
        dragEntity.style.top = 'initial';
        // 判断拖拽组件下落的位置
        if (
          moveX >= plItem.offsetLeft &&
          moveX <= plItem.offsetLeft + plItem.offsetWidth &&
          moveY >= plItem.offsetTop &&
          moveY <= plItem.offsetTop + plItem.offsetHeight
        ) {
          // 获取排序下标
          const activatedLength = this.quickJump[flag].filter((p) => p.isActivated).length;
          let entityIndex = (moveX - entities[0].$el.offsetLeft + plItem.scrollLeft + 10) / entityWidth;
          entityIndex =
            entityIndex < 0 ? 0 : entityIndex > activatedLength ? activatedLength - 1 : Math.trunc(entityIndex);
          this.sortQuickJump(value, entityIndex, index, this.quickJump[flag]);
        }
        dragEntity.style.position = 'relative';
        dragEntity.style.zIndex = 1;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },

    async initSourceJump() {
      const sourceJump = await PlatformHelper.Storage.getLocalStorage('quickJump');
      ServerUtil.getServerDataSourceInfo().then((data) => {
        let list = [];
        let newList = [];
        if (sourceJump?.source && sourceJump.source?.length) {
          for (const item of sourceJump.source) {
            if (data.serverDataSourceList.find((p) => item.nickname === p.nickname)) list.push(item);
          }
          list = list.concat(data.serverDataSourceList);
          newList = list.reduce((pre, cur) => {
            let isRepeat = pre.findIndex((p) => p.nickname === cur.nickname);
            if (isRepeat < 0) {
              cur.isActivated = typeof cur.isActivated === 'boolean' ? cur.isActivated : true;
              pre.push(cur);
            }
            return pre;
          }, []);
        } else {
          for (const item of data.serverDataSourceList) {
            item.isActivated = true;
          }
          newList = data.serverDataSourceList;
        }
        newList.sort((a, b) => b.isActivated - a.isActivated);
        this.quickJump.source = newList.filter((it) => !!it.jump_url);
        // 更新缓存
        this.saveQuickJump();
      });
    },

    async initToolJump() {
      const toolJump = await PlatformHelper.Storage.getLocalStorage('quickJump');
      ServerUtil.getThirdPartyToolsInfo().then((data) => {
        let list = [];
        let newList = [];
        if (toolJump?.tool && toolJump.tool?.length) {
          for (const item of toolJump.tool) {
            if (data.toolList.find((p) => item.nickname === p.nickname)) list.push(item);
          }
          list = list.concat(data.toolList);
          newList = list.reduce((pre, cur) => {
            let isRepeat = pre.findIndex((p) => p.nickname === cur.nickname);
            if (isRepeat < 0) {
              cur.isActivated = typeof cur.isActivated === 'boolean' ? cur.isActivated : true;
              pre.push(cur);
            }
            return pre;
          }, []);
        } else {
          for (const item of data.toolList) {
            item.isActivated = true;
          }
          newList = data.toolList;
        }
        newList.sort((a, b) => b.isActivated - a.isActivated);
        this.quickJump.tool = newList;
        // 更新缓存
        this.saveQuickJump();
      });
    },

    /**
     * 跳转链接拖拽时排序
     * @param value {any} 元素
     * @param index {number} 元素要排序的新下标
     * @param oldIndex {number} 元素原来下标
     * @param array {Array} 用于排序的数组
     */
    async sortQuickJump(value, index, oldIndex, array) {
      array.splice(oldIndex, 1);
      array.splice(index, 0, value);
      this.saveQuickJump();
    },

    deleteSource(data, index, array) {
      data.isActivated = false;
      this.sortQuickJump(data, array.length, index, array);
    },

    addSource(data, index, array) {
      data.isActivated = true;
      const newIndex = array.length - array.filter((p) => !p.isActivated).length - 1;
      this.sortQuickJump(data, newIndex, index, array);
    },

    autoScroll(el, direction) {
      el.scrollTo({
        left: direction === 'left' ? el.scrollLeft - 100 : el.scrollLeft + 100,
        behavior: 'smooth', // instant，瞬间滑动
      });
    },

    saveQuickJump() {
      PlatformHelper.Storage.saveLocalStorage('quickJump', this.quickJump).then();
    },

    openSetting() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_OPTIONS);
    },

    openCountDown() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_TIME);
    },

    openUpdate() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_UPDATE);
    },

    openWelcome() {
      PlatformHelper.Tabs.createWithExtensionFile(PAGE_WELCOME);
    },

    openGithub() {
      PlatformHelper.Tabs.create(PAGE_GITHUB_REPO);
    },

    openAboutUs() {
      PlatformHelper.Tabs.create(PAGE_CEOBECANTEEN_WEB_ABOUT_US);
    },

    openSponsor() {
      PlatformHelper.Tabs.create(PAGE_CEOBECANTEEN_WEB_SPONSOR);
    },
  },
};
</script>

<style lang="less" scoped>
@import '../theme/theme.less';

.styleChange(@theme) {
  @ceobeLightColor: 'ceobeLightColor-@{theme}'; //小刻食堂主题亮色浅色
  @ceobeColor: 'ceobeColor-@{theme}'; //小刻食堂主题亮色
  @ceobeVeryLightColor: 'ceobeVeryLightColor-@{theme}'; // 小刻食堂主题亮色非常浅色
  @ceobeDarkColor: 'ceobeDarkColor-@{theme}'; //小刻食堂主题暗色
  @bgColor: 'bgColor-@{theme}'; // 背景颜色
  @content: 'content-@{theme}'; // 文本颜色
  @timeline: 'timeline-@{theme}'; // 时间线颜色和时间线border颜色
  @subTitle: 'subTitle-@{theme}'; // 小标题颜色
  @btnBorder: 'btnBorder-@{theme}'; // 按钮边框颜色和一些小线条
  @setBtnBorder: 'setBtnBorder-@{theme}';
  @btnBg: 'btnBg-@{theme}'; // 按钮内部颜色
  @setLarge: 'setLarge-@{theme}'; // 设置标题颜色
  @setSmall: 'setSmall-@{theme}'; // 设置文本颜色
  @shadow: 'shadow-@{theme}'; // 卡片的阴影
  @hover: 'hover-@{theme}'; // 按钮hover颜色
  @numberInput: 'numberInput-@{theme}'; //设置页面加减按钮

  #app {
    :deep(a) {
      color: @@content !important;
    }
    position: relative;
    overflow: auto;
    width: 700px;
    height: 599px;
    font-size: 14px;
    background-color: @@bgColor;
  }

  .color-blue {
    color: #23ade5;
  }

  .sane-calculator {
    .san-push.is-checked {
      :deep(.el-switch__core) {
        border-color: @@ceobeColor;
        background-color: @@ceobeColor;
      }
    }
  }

  .title-area {
    position: fixed;
    top: 0;
    z-index: 9999;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 14px 0 18px;
    width: calc(100% - 32px);
    height: 40px;
    font-size: 1rem;
    color: @@ceobeColor;
    background: @@ceobeDarkColor;
    line-height: 40px;
    user-select: none;

    .version {
      text-align: left;
    }

    .countdown-and-btn {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .menu-btn {
        margin-top: 5px;
      }

      .count-down-area {
        overflow: hidden;
        margin-right: 10px;
        padding: 0 10px;
        height: 40px;
        border-radius: 3px;
        text-align: right;
        transition: all 0.5s;
        cursor: pointer;

        &:hover {
          height: auto;
          background: @@bgColor;
          box-shadow: 0 0 20px 0;
        }
      }
    }
  }

  .top-btn {
    position: fixed;
    right: -40px;
    bottom: 30px;
    z-index: 9999;
    border-color: @@ceobeColor;
    background-color: @@ceobeColor;
    opacity: 1;
    transition: 0.3s all;

    &.top-btn-show {
      right: 20px;
      opacity: 0.3;

      &:hover {
        opacity: 1;
      }
    }
  }

  .drawer-btn-area {
    position: initial;
    display: flex;
    align-items: center;
    height: 58px;
    .el-button {
      padding: 5px;
      width: 42px;
      height: 44px;
    }

    .btn-icon {
      width: 30px;

      &.radius {
        border-radius: 10px;
      }
    }

    .drag-entity {
      position: relative;
      transform: none;
      transition: none;
      .edit-icon {
        position: absolute;
        top: -9px;
        right: -9px;
        cursor: pointer;
        & > i {
          font-size: 18px;
          color: #747474;
          transition: 0.2s;
          &:hover {
            color: @@ceobeColor;
          }
        }
        .el-icon-error {
          &:hover {
            color: #f06464;
          }
        }
      }
    }
    .not-activated {
      .btn-icon {
        opacity: 0.2;
        cursor: not-allowed;
        box-sizing: border-box;
      }
    }
  }
  .drawer-btn-area-origin {
    display: flex;
    justify-content: center;
    overflow-x: scroll;
    margin: 0 10px;
    scrollbar-width: none;
  }
  .drawer-btn-area-scroll {
    justify-content: initial;
  }
  // 快捷连接

  .drawer-btn-area-quickJump {
    display: flex;
    overflow-x: scroll;
    margin: 0 10px;
    height: 100px;

    .quickJump-img-area {
      position: relative;
      overflow: hidden;
      margin-right: 10px;
      max-width: 350px;
      border: 1px solid #dcdfe6;
      border-radius: 5px;
      flex-shrink: 0;

      &:hover {
        img {
          filter: blur(30px) brightness(0.1);
        }

        .author {
          & p {
            opacity: 1;
          }
        }
      }

      img {
        height: 100px;
      }

      .author {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 1;
        width: 100%;
        text-align: center;
        transform: translate(-50%, -50%);
        pointer-events: none;

        & p {
          font-size: 20px;
          color: #fff;
          opacity: 0;
        }
      }
    }
  }
  .edit-layout {
    position: absolute;
    top: 62px;
    right: 0;
    z-index: 9;
    display: inline-flex;
    justify-content: right;
    align-items: center;
    margin-right: 20px;
    padding: 0 20px;
    background: #fff;
    & > span {
      margin-right: 15px;
      line-height: 20px;
    }
  }

  // 标签栏

  :deep(.el-tabs) {
    margin: 0 10px;
    height: 30px;

    .el-tabs__nav-prev,
    .el-tabs__nav-next {
      line-height: 30px;
      font-size: 18px;
    }

    .el-tabs__header {
      margin-top: 15px;
      margin-bottom: 5px;

      .title-img {
        width: 30px;
        border-radius: 4px;
      }
    }

    .el-tabs__content {
      min-height: 360px;

      .el-timeline {
        height: 360px;
      }
    }

    .el-tabs__nav-wrap::after {
      background-color: @@timeline;
    }

    .el-tabs__item {
      color: @@setLarge;

      &:hover {
        color: @@ceobeColor;
      }
    }
  }

  // 隐藏二级菜单

  :deep {
    background-color: @@bgColor;

    .el-divider {
      background-color: @@btnBorder;
    }

    .el-divider__text {
      color: @@setLarge;
      background-color: @@bgColor;
    }

    .el-button {
      border: @@btnBorder 1px solid;
      background-color: @@bgColor;
      .radius {
        background-color: #fff;
      }
    }

    // 单独对刷新设置设颜色

    .el-button--primary {
      border: @@ceobeColor 1px solid;
      background-color: @@ceobeColor;
    }

    .el-button:hover {
      border-color: @@ceobeLightColor;
      color: @@ceobeColor;
      background-color: @@ceobeVeryLightColor;
    }

    .sign {
      color: @@setLarge;
      & > span {
        text-decoration: underline;
        color: @@ceobeColor !important;
        cursor: pointer;
      }
    }

    .mention,
    .el-form-item__label,
    .el-button--mini {
      color: @@setLarge;
    }

    .el-input-number__increase,
    .el-input-number__decrease {
      color: @@setSmall;
      background-color: @@numberInput;
    }

    .el-input-number__increase {
      border-left: @@btnBorder 1px solid;
    }

    .el-input-number__decrease {
      border-right: @@btnBorder 1px solid;
    }

    .el-input-number__increase:hover + .el-input > .el-input__inner,
    .el-input-number__decrease:hover + .el-input-number__increase + .el-input > .el-input__inner {
      border: @@ceobeColor 1px solid;
    }

    .el-input__inner {
      border: @@btnBorder 1px solid;
      color: @@setLarge;
      background-color: @@bgColor;
    }

    .el-input__inner:focus {
      border-color: @@ceobeColor;
    }
    .el-switch.is-checked .el-switch__core {
      border: @@ceobeColor 1px solid;
      background-color: @@ceobeColor;
    }
    .el-divider--horizontal {
      margin: 20px 0 !important;
    }
  }
  :deep(.protocol-warning) {
    .protocol-area {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .warning-msg {
      font-size: 18px;
      text-align: center;
      color: @@content;
      line-height: 36px;
    }
    .el-divider {
      background-color: @@btnBorder;
    }
    .el-divider__text {
      color: @@setLarge;
      background-color: @@bgColor;
    }
    .el-button {
      padding: 0 15px;
      height: 35px;
      border: @@btnBorder 1px solid;
      background-color: @@bgColor;
      box-sizing: border-box;
    }

    .el-button--primary {
      border: @@ceobeColor 1px solid;
      background-color: @@ceobeColor;
    }

    .el-button:hover {
      border-color: @@ceobeLightColor;
      color: @@ceobeColor;
      background-color: @@ceobeVeryLightColor;
    }
  }
}

.dark {
  .styleChange(dark);
  height: 100vh;
  background: #22272e;
}

.light {
  .styleChange(light);
}
</style>

<style lang="less">
@media (max-width: 699px) {
  .online-area {
    align-items: flex-start !important;
    font-size: small;
  }

  .online-title-img,
  .sane-area,
  .day-info-content-bottom {
    display: none !important;
  }

  .el-loading-spinner {
    top: 0 !important;
    margin-top: 0 !important;
  }

  .el-timeline {
    padding-right: 10px !important;
    padding-left: 20px !important;
  }

  .el-timeline-item__timestamp {
    margin-left: 13px !important;
  }

  .el-timeline-item__wrapper {
    padding-left: 14px !important;
  }

  .el-divider--horizontal {
    display: flex !important;
    justify-content: center !important;

    .el-divider__text.is-left {
      left: unset !important;
    }
  }

  .el-drawer {
    width: 100% !important;
  }

  .drawer-btn-area {
    flex-wrap: wrap;

    .el-button {
      margin: 3px !important;
    }
  }

  .menu-button-area {
    flex-wrap: wrap;

    .el-button {
      margin: 3px !important;
      width: 40% !important;
    }
  }

  .el-message-box {
    width: 100% !important;
  }
}

@media (max-width: 525px) {
  .online-area {
    font-size: x-small;
  }
}

body {
  margin: 0;
}

.el-timeline,
.drawer-btn-area-quickJump,
.drawer-btn-area-origin,
.content-card-episodes {
  scrollbar-width: none;
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0;
}

.online-area {
  display: flex;
  align-items: center;
  margin-right: 30px;

  p {
    margin: 0;
  }

  // 菜单按钮

  drawer {
    color: #dd558a;
  }

  // 设置按钮

  setting {
    color: #dd55c4;
  }

  .online-title-img {
    margin-right: 10px;
    height: 100px;

    &.radius {
      border-radius: 4px;
    }
  }
}

.online-pointer {
  cursor: pointer;
}

.online-blue {
  color: #23ade5;
}

.online-orange {
  color: #ffba4b;
}

.online-red {
  color: #f56c6c;
}

.online-yellow {
  color: #e6a23c;
}

.online-green {
  color: #67c23a;
}

.online-gray {
  color: #909399;
}
</style>
