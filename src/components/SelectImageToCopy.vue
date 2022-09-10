<template>
  <el-dialog
    title="九宫格分享"
    :modal-append-to-body="false"
    :visible.sync="copyImageToImage"
    width="80%"
    @closed="closeDialog"
  >
    <div class="title-area">
      <span>
        <span>选择需要粘贴到分享内的图片，点击复制即可生成图片</span>
        <br />
        <span>如果长时间没反应，请刷新页面</span>
      </span>
      <el-button size="small" type="primary" :disabled="isPrint" @click="copyData"> 复制 </el-button>
    </div>
    <div class="image-area" :class="hideNoImage ? 'hideNoImage' : ''">
      <div v-if="item.imageList && item.imageList.length > 1" class="multi-img">
        <div
          v-for="img in item.imageHttpList"
          :key="img"
          class="multi-img-area"
          :style="{ width: spanNumber + '%', 'max-width': spanNumber + '%' }"
          :class="selectImg.some((x) => x == img) ? 'hasImage' : 'noImage'"
        >
          <img v-lazy="img" class="img" crossorigin="anonymous" @click="addImage(img)" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import html2canvas from 'html2canvas';

export default {
  name: 'SelectImageToCopy',
  props: [],
  data() {
    return {
      item: {},
      // 窗口显示
      copyImageToImage: false,
      // 当前选择的图片列表
      selectImg: [],
      // 生成的图片url
      successImageUrl: null,
      // 石头隐藏未被选中的图片
      hideNoImage: false,
      // 图片宽度
      spanNumber: 33,
      isPrint: true,
    };
  },
  methods: {
    closeDialog() {
      this.item = {};
      this.copyImageToImage = false;
      this.hideNoImage = false;
      this.spanNumber = 33;
      this.selectImg = [];
      this.isPrint = true;
    },

    addImage(img) {
      let index = this.selectImg.findIndex((x) => x == img);
      if (index >= 0) {
        this.selectImg.splice(index, 1);
      } else {
        this.selectImg.push(img);
      }
      if (this.selectImg.length > 0) {
        this.isPrint = false;
      } else {
        this.isPrint = true;
      }
    },

    copyData() {
      this.isPrint = true;
      this.hideNoImage = true;
      if (this.selectImg.length == 1 || this.selectImg.length == 2) {
        this.spanNumber = 100;
      }
      this.$nextTick(async () => {
        let imageCanvas = await html2canvas(document.querySelector('.image-area'), {
          allowTaint: true,
          useCORS: true,
          imageTimeout: 10000,
        });
        this.successImageUrl = imageCanvas.toDataURL('image/jpeg');
        this.$emit('copyData', this.item, this.successImageUrl);
        this.copyImageToImage = false;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.image-area {
  &.hideNoImage {
    .noImage {
      display: none;
    }

    .hasImage {
      &::after {
        display: none;
      }
    }
  }
}

.title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px auto;
}

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

    &.hasImage::after {
      position: absolute;
      top: 5px;
      left: 5px;
      width: 20px;
      height: 20px;
      font-size: 19px;
      font-family: element-icons !important;
      font-weight: 900;
      border: 1px solid #fff;
      border-radius: 3px;
      text-align: center;
      color: #fff;
      background: #23ade5;
      content: '\e6da';
      line-height: 20px;
    }

    .img {
      width: 100%;
    }
  }
}
</style>
