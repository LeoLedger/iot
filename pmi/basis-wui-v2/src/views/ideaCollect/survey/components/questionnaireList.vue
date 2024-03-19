<!--
* @description 问卷调查-问题列表
* @author 王鹏
!-->
<template>
  <div class="questionnaire-list">
    <!-- 功能分类 -->
    <div v-for="(item1, index1) in questionnairePageList" :key="index1" class="questionnaire-item">
      <div class="questionnaire-item-title">
        {{ item1.menu }}
      </div>
      <!-- 问题列表 -->
      <div v-for="(item2,index2) in item1.questionsList" :key="index2" class="questionnaire-item-problem">
        <p><span class="dot">*</span>{{ item2.title }} ?</p>
        <!-- 选项列表 -->
        <div class="questionnaire-radio-list">
          <div
            v-for="(item3,index3) in item2.answerList"
            :key="index3"
            :class="['questionnaire-radio-item', item3.checked ? 'checked' : '']"
          >
            <span>{{ item3.title }}</span>
          </div>
        </div>
      </div>
      <div v-show="item1.desc" class="questionnaire-item-txt">
        {{ item1.desc }}
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'QuestionnaireList',
  props: {
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
      this.questionnairePageList = []
      if (!newVal[0].questionsList) {
        this.selectFeatures.map(v => {
          this.questionnairePageList.push({
            menu: v.menu,
            menuId: v.menuId,
            fillNum: 0,
            questionnaireModuleId: v.moduleId,
            questionsList: []
          })
        })
        this.getQuestionnaireConfigureList()
      } else {
        this.questionnairePageList = newVal
      }
    },
    answerList(newVal, oldVal) {
      // console.log(newVal)
      this.questionnairePageList = []
      if (!this.selectFeatures.questionsList) {
        this.selectFeatures.map(v => {
          this.questionnairePageList.push({
            menu: v.menu,
            menuId: v.menuId,
            questionnaireModuleId: v.moduleId,
            questionsList: []
          })
        })
        this.getQuestionnaireConfigureList()
      }
    }
  },
  mounted() {
  },
  methods: {
    // 获取工作人员列表
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
      console.log(this.questionnairePageList)
    },
    // 获取用户点击选项
    handleAnswerClick(index1, index2, index3) {
      console.log(index1, index2, index3)
      // 由于都是数据,没有undefined、function、symbol 可以直接是用
      const list = JSON.parse(JSON.stringify(this.questionnairePageList[index1]))
      list.questionsList.map((v2, i2) => {
        if (i2 === index2) {
          v2.answerList.map((v3, i3) => {
            if (i3 === index3) {
              v3.checked = true
              v2.checked = true // 设置 questionsList 该问题已选中 提交需要删除
            } else {
              v3.checked = false
            }
          })
        }
      })
      console.log(list)
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

.questionnaire-item {
  padding-bottom: 20px;
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
  p {
    margin: 0;
  }
  .el-radio {
    color: #7f7f7f;
  }
  .dot {
    color: #d9101b;
  }
}

.questionnaire-radio-item {
  position: relative;
  display: inline-block;
  margin-right: 10px;
  padding-left: 20px;
  line-height: 26px;
  &:after {
    position: absolute;
    left: 0;
    top: 50%;
    content: '';
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
  margin: 16px 0 0 10px;
  padding: 5px 10px;
  border: 1px solid #E4E7ED;
  border-radius: 4px;
}

</style>
