<!--
* @description 问题反馈-详情
* @author 王鹏
!-->
<template>
  <el-dialog
    :visible.sync="feedbackDetailsVisible"
    :before-close="handleDialogClose"
    :title="titleCont"
    width="800px"
    class="feedback-container"
  >
    <div class="feedback-details-title">
      <h1>【{{ feedbackDetails.feedbackOptionName }}】{{ feedbackDetails.theme }}</h1>
      <em>{{ feedbackDetails.moduleStr }}</em>
    </div>
    <div class="feedback-details-user-info">
      <img v-if="feedbackDetails.avatar.length > 0" :src="feedbackDetails.avatar">
      <img v-else src="../../../../assets/default/user.png">
      <span class="feedback-details-user-name">{{ feedbackData.reporter }}({{ feedbackData.phone }})</span>
      <span class="feedback-details-user-time">提交于：{{ feedbackData.reportDate }}</span>
    </div>
    <div class="feedback-details-describe">
      {{ feedbackDetails.describe }}
    </div>
    <Upload
      :form="feedbackDetails"
      :params="feedbackDetails"
    />
  </el-dialog>
</template>

<script>
import { getFeedbackDetails } from '@/api/ideaCollect/feedback'
// import Carousel from '@/components/Carousel'
import Upload from '@/components/customizeFormItem/Upload'
export default {
  name: 'FeedbackDetails',
  components: {
    Upload
  },
  props: {
    id: {
      type: Number,
      default: 0
    },
    feedbackData: {
      type: Object,
      default: null
    },
    feedbackDetailsVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadFileUrl: process.env.VUE_APP_uploadFileUrl,
      titleCont: '', // 标题名称
      // 反馈详情
      feedbackDetails: {
        moduleStr: '', // 功能模块
        code: '', // 编号
        avatar: '', // 头像
        id: 0,
        theme: '', // 主题
        moduleIdArr: [], // 功能模块id
        moduleId: 0,
        menuId: 0,
        isEdit: false,
        feedbackOptionName: '', // 提交类型
        satisfaction: 0, // 满意度
        describe: '', // 详情
        tempStore: true, // 是否暂存
        prop: 'files', // 上传文件相关
        files: [] // 图片地址
      },
      fileIndex: 0,
      carouselVisible: false
    }
  },
  watch: {
    feedbackDetailsVisible(newVal, oldVal) {
      if (newVal) {
        this.getDetails()
      }
    }
  },
  created() {
  },
  methods: {
    // 获取功能列表
    getDetails() {
      getFeedbackDetails(this.id).then(res => {
        console.log(res)
        const result = res.data
        if (result.success) {
          this.titleCont = `反馈问题编号：${result.data.code}`
          result.data.avatar = result.data.avatar ? this.uploadFileUrl +'/download/' + result.data.avatar : ''
          this.feedbackDetails = Object.assign({ prop: 'files', disabled: true, isEdit: false }, result.data)
        } else {
          this.$message.error(result.message)
        }
      })
    },
    // 关闭详情
    handleDialogClose() {
      this.feedbackDetails = {
        moduleStr: '', // 功能模块
        code: '', // 编号
        avatar: '', // 头像
        id: 0,
        theme: '', // 主题
        moduleIdArr: [], // 功能模块id
        moduleId: 0,
        menuId: 0,
        feedbackOptionName: '', // 提交类型
        satisfaction: 0, // 满意度
        describe: '', // 详情
        tempStore: true, // 是否暂存
        prop: 'files', // 上传文件相关
        files: [] // 图片地址
      }
      this.$emit('closeDialog', 'feedbackDetailsVisible')
    },
    // 查看图片
    handleDetailsImgClick(index) {
      this.fileIndex = index
      this.carouselVisible = true
    },
    // 关闭轮播图
    handleCarouselClose() {
      this.carouselVisible = !this.carouselVisible
    }
  }
}
</script>

<style lang='scss'>
    .clearfix:after {
        content: "";
        display: block;
        clear: both;
    }
    .feedback-container {
      .el-dialog {
        padding-bottom: 60px;
      }
    }
    .feedback-details-title {
        h1 {
            margin: 0;
            padding: 20px 0;
            text-indent: -10px;
            font-size: 18px;
            color: #373D41;
            font-weight: normal;
        }
        em {
            padding: 2px 6px;
            font-style: normal;
            border: 1px solid rgba(215, 215, 215, 1);
            border-radius: 20px;
        }
    }
    .feedback-details-user-info {
        padding-top: 20px;
        font-size: 14px;
        img {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            vertical-align: middle;
            margin-right: 10px;
        }
    }
    .feedback-details-user-name {
        color: #63A4CB;
    }
    .feedback-details-user-time {
        padding-left: 20px;
        color: #aaa;
    }

    .feedback-details-describe {
        margin-top: 14px;
        padding: 20px 20px 40px;
        font-size: 14px;
        color: #555;
        background-color: rgba(248, 249, 250, 1);
    }

    .feedback-details-img-list {
        padding-top: 20px;
        padding-bottom: 60px;
    }

    .feedback-details-img-item {
        float: left;
        width: 60px;
        height: 60px;
        text-align: center;
        margin-right: 10px;
        margin-bottom: 10px;
        border: 1px solid #aaa;
        border-radius: 6px;
        padding: 5px;
        cursor: pointer;
        &:after {
            content: "";
            display: inline-block;
            height: 100%;
            vertical-align: middle;
        }
        img {
            max-width: 100%;
            max-height: 100%;
            vertical-align: middle
        }
    }

</style>
