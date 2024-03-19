<template>
  <el-dialog
    :visible="carouselVisible"
    :before-close="closeDialog"
    class="carousel-dialog"
    title="图片预览"
    width="500px"
    append-to-body
  >
    <el-carousel :initial-index="imgIndex" :autoplay="false">
      <el-carousel-item v-for="(item, index) in imgList" :key="index">
        <div class="carousel-img-wrap">
          <img :src="uploadFileUrl +'/download/' + item.fileId" class="carousel-img">
        </div>
      </el-carousel-item>
    </el-carousel>
  </el-dialog>
</template>

<script>
export default {
  name: 'Carousel',
  props: {
    fileList: {
      type: Array,
      default: null
    },
    fileIndex: {
      type: Number,
      default: -1
    },
    carouselVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadFileUrl: process.env.VUE_APP_uploadFileUrl,
      imgIndex: 0,
      imgList: []
    }
  },
  watch: {
    carouselVisible(newVal, oldVal) {
      if (newVal) {
        this.imgList = this.fileList
      } else {
        this.imgList = []
      }
    },
    fileIndex(newVal, oldVal) {
      this.imgIndex = newVal
    }
  },
  created() {
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    }
  }
}

</script>

<style scoped lang="scss">
  .carousel-img-wrap {
    width: 100%;
    height: 100%;
    text-align: center;
    &:after {
      content: "";
      display: inline-block;
      height: 100%;
      vertical-align: middle;
    }
  }
  .carousel-img {
    max-width: 100%;
    max-height: 100%;
    vertical-align: middle;
  }
  .carousel-dialog {
    /deep/ .el-dialog__body {
      width: 500px;
      height: 500px;
    }
    .el-carousel {
      height: 100%;
    }
    /deep/ .el-carousel__container {
      height: 100%;
    }
    /deep/ .el-carousel__button {
      background-color: #11a6e8;
    }
  }
</style>
