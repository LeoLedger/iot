<!--
* @description 问题反馈-详情
* @author 王鹏
!-->
<template>
  <div>
    <feedback-list :viewId="viewId" :feedback-list-visible="feedbackListVisible" @viewDetails="viewDetails" @closeDialog="handleDialogClose"/>
    <feedback-details :id="viewDataId" :feedback-data="feedbackData" :feedback-details-visible="feedbackDetailsVisible" @closeDialog="handleDialogClose" />
  </div>
</template>

<script>
import FeedbackDetails from '../../problemBack/components/feedbackDetails'
import FeedbackList from './feedbackList'
export default {
  name: 'dialogWrap',
  components: {
    FeedbackDetails,
    FeedbackList
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    viewId: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      feedbackListVisible: false,
      feedbackDetailsVisible: false,
      feedbackData: {},
      viewDataId: 0
    }
  },
  watch: {
    show(newVal){
      if (newVal) {
        this.feedbackListVisible = this.show
      }
    }
  },
  created() {
  },
  methods: {
    viewDetails(e){
      this.feedbackDetailsVisible = true
      this.feedbackData = e.feedbackData
      this.viewDataId = e.viewDataId
    },
    // 关闭弹窗
    handleDialogClose(e){
      console.log(e)
      this[e] = false
      this.$emit('dialogClose')
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
