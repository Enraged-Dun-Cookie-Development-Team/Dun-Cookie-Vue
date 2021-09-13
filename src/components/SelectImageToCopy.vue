<template>
  <el-dialog
      title="九宫格分享【实验性功能】【暂不支持图片排序】"
      :modal-append-to-body="false"
      :visible.sync="copyImageToImage"
      @closed="closeDialog"
      width="80%">
    <div class="title-area">
      <span>选择需要粘贴到分享内的图片，点击复制即可生成图片</span>
      <el-button size="small" type="primary" @click="copyData" :disabled="isPrint">复制</el-button>
    </div>
    <div class="image-area" :class="hideNoImage?'hideNoImage':''">
      <div v-if="item.imageHttpList && item.imageHttpList.length > 1" class="multi-img">
        <el-row :gutter="5">
          <el-col v-for="img in item.imageHttpList" :class="selectImg.some(x=>x==img)?'':'noImage'" :key="img"
                  :span="spanNumber">
            <div class="multi-img-area" :class="selectImg.some(x=>x==img)?'hasImage':''">
              <img v-lazy="img" class="img" @click="addImage(img)"/>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import html2canvas from "html2canvas";

export default {
  name: "SelectImageToCopy",
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
      spanNumber: 8,
      isPrint: true
    }
  },
  methods: {
    closeDialog() {
      this.item = {};
      this.copyImageToImage = false;
      this.hideNoImage = false;
      this.spanNumber = 8;
      this.selectImg = [];
      this.isPrint = true;
    },

    addImage(img) {
      let index = this.selectImg.findIndex(x => x == img);
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
        this.spanNumber = 24;
      }
      this.$nextTick(async () => {
        let imageCanvas = await html2canvas(document.querySelector('.image-area'), {
          allowTaint: true,
          imageTimeout: 10000
        })
        this.successImageUrl = imageCanvas.toDataURL("image/jpeg");
        this.$emit('copyData', this.item, this.successImageUrl);
        this.copyImageToImage = false;
      })
    }
  }
}
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
  margin: 10px auto;
  align-items: center;
}

.multi-img {
  width: 100%;
  margin: auto;

  .multi-img-area {
    position: relative;

    &.hasImage::after {
      content: "\e6da";
      position: absolute;
      top: 5px;
      left: 5px;
      width: 20px;
      height: 20px;
      font-family: element-icons !important;
      background: #23ade5;
      text-align: center;
      line-height: 20px;
      border-radius: 3px;
      font-size: 19px;
      font-weight: 900;
      color: #fff;
      border: 1px solid #fff;
    }

    .img {
      width: 100%;
    }
  }

}
</style>
