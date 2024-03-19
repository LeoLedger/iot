<!--
* @description 问卷调查-问题列表
* @author 王鹏
!-->
<template>
  <div class="questionnaire-list">
    <!-- 功能分类 -->
    <div
      v-for="(item1, index1) in questionnairePageList"
      :key="index1"
      class="questionnaire-item">
      <div class="questionnaire-item-title">{{ item1.menu }}</div>
      <!-- 问题列表 -->
      <div
        v-for="(item2,index2) in item1.questionsList"
        :key="index2"
        class="questionnaire-item-problem">
        <p style="font-weight: bold;">{{ item2.title }}</p>
        <!-- 选项列表 -->
        <div class="questionnaire-radio-list">
          <div
            v-for="(item3,index3) in item2.answerList"
            :key="index3"
            :class="['questionnaire-radio-item', item3.checked ? 'checked' : '']"
            @click="handleAnswerClick(index1, index2, index3)">
            <span>{{ item3.title }}</span>
          </div>
        </div>
      </div>
      <div class="questionnaire-item-txt">
        <el-input v-model="item1.desc" :rows="{ minRows: 4}" type="textarea" autosize placeholder="您对该功能模块有什么想法，请大声说出来吧！（例如：哪里有问题，哪些功能做得不够好等）" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionnaireList',
  props: {
    hasSaveQuestionnaire: {
      type: Boolean,
      default: false
    },
    hasNewMoudle: {
      type: Boolean,
      default: false
    },
    selectFeatures: {
      type: Array,
      default: null
    },
    questionsList: {
      type: Array,
      default: null
    },
    answerList: {
      type: Array,
      default: null
    },
    selectIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      questionnairePageList: [] // 整合的问题列表
    }
  },
  watch: {
    selectFeatures(newVal, oldVal) {
      if (newVal && !newVal[0].questionsList) {
        this.resetQuestionnaireConfigureList()
      } else {
        this.questionnairePageList = newVal
      }
    },
    answerList(newVal, oldVal) {
      if (this.selectFeatures && !this.selectFeatures.questionsList) {
        this.resetQuestionnaireConfigureList()
      }
    }
  },
  mounted() {},
  methods: {
    // 初始化问题列表
    resetQuestionnaireConfigureList() {
      // 如果是暂存状态
      if (this.hasSaveQuestionnaire && this.hasNewMoudle) {
        this.resetQuestionnaireContent()
      }
      if (this.hasSaveQuestionnaire) { return }
      this.resetQuestionnaireContent()
    },
    // 初始化问题内容
    resetQuestionnaireContent() {
      this.questionnairePageList = []
      this.selectFeatures.map(v => {
        this.questionnairePageList.push({
          menu: v.menu,
          menuId: v.menuId,
          fillNum: 0,
          satisfaction: 0,
          questionnaireModuleId: v.moduleId,
          questionsList: []
        })
      })
      this.getQuestionnaireConfigureList()
    },
    // 设置问题列表
    getQuestionnaireConfigureList() {
      // 整合问题列表
      this.questionnairePageList.map((v, i) => {
        v.questionsList = this.questionsList
        this.$set(this.questionnairePageList, i, v)
      })
      // 设置当前功能问题及选项
      this.questionnairePageList.map((v1, i1) => {
        v1.questionsList.map((v2, i2) => {
          v2.questionnairePageId = v2.id
          v2.title = v2.question
          v2.answerList = []
          // v2.satisfaction = 0
          // 根据问题 id 配置对应选项
          this.answerList.map(v3 => {
            if (v3.questionnaireConfigureId === v2.id) {
              v2.answerList.push({
                id: v3.id,
                title: v3.option,
                checked: false,
                ratio: v3.ratio
              })
            }
          })
          this.$set(this.questionnairePageList[i1].questionsList, i2, v2)
        })
      })
      // console.log(this.questionnairePageList)
    },
    // 获取用户点击选项
    handleAnswerClick(index1, index2, index3) {
      // console.log(index1, index2, index3)
      // 由于都是数据,没有undefined、function、symbol 可以直接使用
      const list = JSON.parse(JSON.stringify(this.questionnairePageList[index1]))
      list.questionsList.map((v2, i2) => {
        if (i2 === index2) {
          v2.answerList.map((v3, i3) => {
            if (i3 === index3) {
              v3.checked = true
            } else {
              v3.checked = false
            }
          })
        }
      })
      // console.log(list)
      this.$set(this.questionnairePageList, index1, list)
      this.$emit('getQuestionnaireFromData', this.questionnairePageList, index1)
    }
  }
}
</script>

<style lang="scss">
.questionnaire-content {
  max-height: 600px;
  padding-right: 10px;
  overflow-y: auto;
}
.questionnaire-item-title {
  padding-top: 8px;
  padding-left: 8px;
  line-height: 26px;
  color: #04a1e7;
  border-left: 4px solid #04a1e7;
  border-bottom: 1px solid #04a1e7;
}
.questionnaire-item-problem {
  padding-top: 10px;
  padding-bottom: 6px;
  margin-left: 12px;
  line-height: 30px;
  color: #7f7f7f;
  border-bottom: 1px dashed #aaa;
  .el-radio {
    color: #7f7f7f;
  }
}

.questionnaire-radio-item {
  position: relative;
  display: inline-block;
  margin-right: 10px;
  padding-left: 20px;
  line-height: 26px;
  cursor: pointer;
  user-select: none;
  &:after {
    position: absolute;
    left: 0;
    top: 50%;
    content: "";
    display: block;
    width: 14px;
    height: 14px;
    margin-top: -8px;
    border-radius: 50%;
    border: 1px solid #aaa;
    background-color: #fff;
  }
  &.checked:after {
    border: 4px solid #04a1e7;
  }
}

.questionnaire-item-txt {
  margin: 16px 0 20px 10px;
}
</style>
