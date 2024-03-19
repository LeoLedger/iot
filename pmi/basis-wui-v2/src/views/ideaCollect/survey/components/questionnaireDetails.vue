<!--
* @description 问卷调查-详情
* @author 王鹏
!-->
<template>
  <el-dialog
    :visible.sync="questionnaireDetailsVisible"
    :before-close="handleDialogClose"
    :title="titleCont"
    class="questionnaire-container"
  >
    <div class="questionnaire-view-header">
      <div class="questionnaire-view-satisfaction">
        满意度: {{ questionnaireData.satisfaction }}%
      </div>

      <div class="questionnaire-user-info">
        <img :src="uploadFileUrl +'/download/' + avatar">
        <span class="questionnaire-user-name">{{ questionnaireData.reporter }}({{ questionnaireData.phone }})</span>
        <span class="questionnaire-user-time">提交于：{{ questionnaireData.reportDate }}</span>
      </div>
    </div>
    <!-- 左侧菜单 -->
    <div class="questionnaire-menu-wrap">
      <div class="questionnaire-menu">
        <div
          v-for="(item, index) in featuresTreeData"
          :key="index"
          :class="['questionnaire-menu-item', selectIndex === index ? 'active' :'']"
          @click="handleQuestionnaireMenuClick(index)"
        >
          <span>{{ item.satisfaction }}</span>{{ item.label }}
        </div>
      </div>
    </div>
    <!-- 右侧问卷 -->
    <div v-loading="loading" class="questionnaire-content">
      <questionnaire-list
        :questions-list="questionsList"
        :answer-list="answerList"
        :select-index="selectIndex"
        :select-features="selectFeatures"
      />
    </div>
  </el-dialog>
</template>
<script>

import QuestionnaireList from './questionnaireList'
import { getQuestionnaireDetails } from '@/api/ideaCollect/questionnaire'
export default {
  name: 'Questionnaire',
  components: {
    QuestionnaireList
  },
  props: {
    questionnaireDetailsVisible: {
      type: Boolean,
      default: false
    },
    questionnaireData: {
      type: Object,
      default: null
    },
    id: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      uploadFileUrl: process.env.VUE_APP_uploadFileUrl,
      loading: true,
      titleCont: '', // 弹窗标题
      firstCome: false, // 首次进入
      featuresTreeData: [], // 功能树
      selectFeatures: null, // 选中的模块
      selectIndex: 0, // 选中的模块索引值
      avatar: '', // 用户头像
      moduleList: [], // 所有表单数据
      questionsList: [], // 问题列表
      answerList: [] // 选项列表
    }
  },
  watch: {
    questionnaireDetailsVisible(newVal, oldVal) {
      this.loading = true
      this.selectIndex = 0
      document.getElementsByClassName('questionnaire-content')[0].scrollTop = 0
    },
    id(newVal, oldVal) {
      console.log(newVal, oldVal)
      // 设置标题
      this.titleCont = '问卷编号：' + this.questionnaireData.code
      if (newVal !== oldVal) {
        this.getDetails()
      }
    }
  },
  created() {
  },
  methods: {
    // 获取问卷详情
    getDetails() {
      getQuestionnaireDetails(this.id).then(res => {
        const result = res.data
        this.featuresTreeData = []
        if (result.success) {
          const list = result.data.moduleList
          list.map((v, i) => {
            this.featuresTreeData.push({
              label: v.module,
              satisfaction: v.satisfaction.toFixed(2) + '%'
            })
          })
          this.avatar = result.data.avatar
          this.moduleList = list
          this.selectFeatures = list[0].questionnairePageList
        }
        this.loading = false
      })
    },
    // 功能模块点击事件
    handleQuestionnaireMenuClick(index) {
      this.selectIndex = index
      this.selectFeatures = this.moduleList[index].questionnairePageList
      document.getElementsByClassName('questionnaire-content')[0].scrollTop = 0
    },
    // 弹窗关闭
    handleDialogClose() {
      this.$emit('closeDialog', 'questionnaireDetailsVisible')
    }
  }
}
</script>

<style lang='scss'>
.questionnaire-container {
    .el-dialog__header {
        line-height: 20px;
    }
}
.questionnaire-view-header {
    padding-bottom: 10px;
    border-bottom: 1px solid #aaa;
}

.questionnaire-user-info {
    padding-top: 10px;
    font-size: 14px;
    img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 10px;
    }
}
.questionnaire-user-name {
    color: #63A4CB;
}
.questionnaire-user-time {
    padding-left: 20px;
    color: #aaa;
}

.questionnaire-view-satisfaction {
    float: right;
    padding-top: 10px;
    font-size: 24px;
    color: #F59A23;
}

.questionnaire-content {
    position: relative;
    margin-top: 10px;
    padding-left: 210px;
    min-height: 410px;
}

.questionnaire-menu-wrap {
    position: absolute;
    z-index: 6;
    margin-top: 10px;
}

.questionnaire-menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 180px;
}

.questionnaire-menu-item {
    height: 40px;
    line-height: 40px;
    padding-right: 20px;
    padding-left: 16px;
    margin-bottom: 1px;
    color: #7f7f7f;
    border-left: 4px solid #f4f6f7;
    background-color: #f4f6f7;
    cursor: pointer;
    &.active, &:hover {
        color: #2a2a2a;
        border-left-color: #04a1e7;
        background-color: #d4d4d4;
    }
    span {
        float: right;
        color: #7f7f7f;
    }
}

</style>
