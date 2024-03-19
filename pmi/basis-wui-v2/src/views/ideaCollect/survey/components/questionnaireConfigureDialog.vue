<!--
* @description 问题反馈
* @author 王鹏
!-->
<template>
  <el-dialog
    :visible.sync="questionnaireConfigureDialogVisible"
    :before-close="handleDialogClose"
    title="问卷调查规则配置"
    width="800px"
    class="questionnaire-container"
  >
    <el-table
      height="400px"
      :data="questionnaireConfigureList"
      border
      highlight-current-row
    >
      <el-table-column type="index" align="center" width="50" label="序号" />
      <el-table-column align="center" label="问题">
        <template slot-scope="scope">
          <el-input v-model="scope.row.question" type="textarea" autosize size="mini" placeholder="请输入内容" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="满意度权重" width="140">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.satisfaction"
            type="number"
            size="mini"
            placeholder="请输入内容"
          >
            <span slot="append">%</span>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="160">
        <template slot-scope="scope">
          <el-button size="mini" :disabled="scope.row.id === 0" icon="el-icon-setting" @click="optionQuestionnaireConfigure(scope.$index)">
            选项配置
          </el-button>
          <el-button type="danger" size="mini" icon="el-icon-minus" @click="delQuestionnaireConfigure(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="questionnaire-option-btn">
      <el-button type="success" size="mini" @click="addNewQuestionnaireConfigure">
        添加问题
      </el-button>
      <el-button size="mini" @click="handleDialogClose">
        取消
      </el-button>
      <el-button type="primary" size="mini" @click="saveQuestionnaireConfigure">
        保存
      </el-button>
    </div>
    <questionnaire-option-dialog :configure-id="configureId" :questionnaire-option-dialog-visible="questionnaireOptionDialogVisible" @closeDialog="handleOptionDialogClose" />
  </el-dialog>
</template>

<script>
import QuestionnaireOptionDialog from './questionnaireOptionDialog'
import { getQuestionnaireConfigure, postQuestionnaireConfigure, deleteQuestionnaireConfigure } from '@/api/ideaCollect/questionnaire'
export default {
  name: 'QuestionnaireConfigureDialog',
  components: {
    QuestionnaireOptionDialog
  },
  props: {
    questionnaireConfigureDialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 配置
      questionnaireConfigureList: [
        {
          id: 0,
          question: '',
          satisfaction: 0
        }
      ],
      configureId: 0, // 配置id
      questionnaireOptionDialogVisible: false // 选项弹窗
    }
  },
  watch: {
    questionnaireConfigureDialogVisible(newVal, oldVal) {
      console.log(newVal)
      if (newVal) {
        this.getList()
      }
    }
  },
  created() {
  },
  methods: {
    // 获取配置列表
    getList() {
      getQuestionnaireConfigure(this.searchParam).then(res => {
        const result = res.data
        if (result.length !== 0) {
          this.questionnaireConfigureList = result
        }
      })
    },
    // 获取输入框的值
    handleInput(val, scope) {
      console.log(this.questionnaireConfigureList)
    },
    // 新增配置
    addNewQuestionnaireConfigure() {
      this.questionnaireConfigureList.push({
        id: 0,
        question: '',
        satisfaction: 0
      })
    },
    // 删除配置
    delQuestionnaireConfigure(index) {
      this.$confirm('确认删除？')
        .then(_ => {
          if (this.questionnaireConfigureList[index].id !== 0) {
            deleteQuestionnaireConfigure(this.questionnaireConfigureList[index].id).then(res => {
              const result = res.data
              if (result.success) {
                this.questionnaireConfigureList.splice(index, 1)
                this.$message.success('删除成功')
              } else {
                this.$message.error(result.message)
              }
            })
          } else {
            this.questionnaireConfigureList.splice(index, 1)
            this.$message.success('删除成功')
          }
        })
        .catch(_ => {})
    },
    // 问题配置
    optionQuestionnaireConfigure(index) {
      this.configureId = this.questionnaireConfigureList[index].id
      this.questionnaireOptionDialogVisible = true
    },
    // 选项配置关闭
    handleOptionDialogClose() {
      this.questionnaireOptionDialogVisible = false
    },

    // 保存配置
    saveQuestionnaireConfigure() {
      // 判断已经保存的配置内容是否为空
      const defaultList = this.questionnaireConfigureList.filter(v => {
        return v.id > 0
      })
      let hasEmpty = false
      for (let i = 0; i < defaultList.length; i++) {
        if (defaultList[i].question.replace(/(^\s{0,})|(\s{0,}$)/g, '').length === 0) {
          const txt = `第${i + 1}个配置内容为空, 如果不需要请删除`
          this.$message.warning(txt)
          hasEmpty = true
        }
      }
      if (hasEmpty) { return }

      // 判断所有的配置内容是否为空
      const list = this.questionnaireConfigureList.filter(v => {
        return v.question.replace(/(^\s{0,})|(\s{0,}$)/g, '').length > 0
      })
      if (list.length === 0) {
        this.$message.warning('请至少输入一个问题')
        return
      }
      list.map(v => {
        v.satisfaction = Number(v.satisfaction)
      })

      const data = { questionList: list }
      console.log(data)
      postQuestionnaireConfigure(data).then(res => {
        const result = res.data
        if (result.success) {
          this.$message.success('添加成功')
          this.getList()
        } else {
          this.$message.error(result.message)
        }
      })
    },
    // 关闭详情
    handleDialogClose() {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$emit('closeDialog', 'questionnaireConfigureDialogVisible')
          done()
        })
        .catch(_ => {})
    }
  }
}
</script>

<style lang='scss'>
  .questionnaire-option-add {
    padding-bottom: 10px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
