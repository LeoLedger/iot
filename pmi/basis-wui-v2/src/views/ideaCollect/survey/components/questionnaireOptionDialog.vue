<!--
* @description 问题反馈
* @author 王鹏
!-->
<template>
  <el-dialog
    :visible.sync="questionnaireOptionDialogVisible"
    :before-close="handleDialogClose"
    title="选项配置"
    width="600px"
    class="questionnaire-container"
    append-to-body
  >
    <el-table
      height="400px"
      :data="questionnaireOptionList"
      border
      highlight-current-row
    >
      <el-table-column type="index" align="center" width="50" label="序号" />
      <el-table-column align="center" label="选项">
        <template slot-scope="scope">
          <el-input v-model="scope.row.option" size="mini" placeholder="请输入内容" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="得分权重" width="140">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.ratio"
            type="number"
            size="mini"
            placeholder="请输入内容"
          >
            <span slot="append">%</span>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="80">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" icon="el-icon-minus" @click="delQuestionnaireOption(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="questionnaire-option-btn">
      <el-button type="success" size="mini" @click="addNewQuestionnaireOption">
        添加选项
      </el-button>
      <el-button size="mini" @click="handleDialogClose">
        取消
      </el-button>
      <el-button type="primary" size="mini" @click="saveQuestionnaireOption">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getQuestionnaireOptionDetails, postQuestionnaireOption, deleteQuestionnaireOption } from '@/api/ideaCollect/questionnaire'
export default {
  name: 'QuestionnaireOptionDialog',
  props: {
    questionnaireOptionDialogVisible: {
      type: Boolean,
      default: false
    },
    configureId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      // 配置
      questionnaireOptionList: []
    }
  },
  watch: {
    questionnaireOptionDialogVisible(newVal, oldVal) {
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
      this.questionnaireOptionList = []
      getQuestionnaireOptionDetails(this.configureId).then(res => {
        const result = res.data
        if (result.length !== 0) {
          this.questionnaireOptionList = result
        } else {
          this.questionnaireOptionList.push({
            id: 0,
            questionnaireConfigureId: this.configureId,
            option: '',
            ratio: 0
          })
        }
      })
    },
    // 新增配置
    addNewQuestionnaireOption() {
      this.questionnaireOptionList.push({
        id: 0,
        questionnaireConfigureId: this.configureId,
        option: '',
        ratio: 0
      })
    },
    // 删除配置
    delQuestionnaireOption(index) {
      this.$confirm('确认删除？')
        .then(_ => {
          if (this.questionnaireOptionList[index].id !== 0) {
            deleteQuestionnaireOption(this.questionnaireOptionList[index].id).then(res => {
              const result = res.data
              if (result.success) {
                this.questionnaireOptionList.splice(index, 1)
                this.$message.success('删除成功')
              } else {
                this.$message.error(result.message)
              }
            })
          } else {
            this.questionnaireOptionList.splice(index, 1)
            this.$message.success('删除成功')
          }
        })
        .catch(_ => {})
    },
    // 保存配置
    saveQuestionnaireOption() {
      // 判断已经保存的选项内容是否为空
      const defaultList = this.questionnaireOptionList.filter(v => {
        return v.id > 0
      })
      let hasEmpty = false
      for (let i = 0; i < defaultList.length; i++) {
        if (defaultList[i].option.replace(/(^\s{0,})|(\s{0,}$)/g, '').length === 0) {
          const txt = `第${i + 1}个选项内容为空, 如果不需要请删除`
          this.$message.warning(txt)
          hasEmpty = true
        }
      }
      if (hasEmpty) { return }

      // 判断所有的选项内容是否为空
      const list = this.questionnaireOptionList.filter(v => {
        return v.option.replace(/(^\s{0,})|(\s{0,}$)/g, '').length > 0
      })
      if (list.length === 0) {
        this.$message.warning('请至少输入一个选项')
        return
      }

      list.map(v => {
        v.ratio = Number(v.ratio)
      })

      const data = { questionnaireOptionList: list }

      postQuestionnaireOption(data).then(res => {
        const result = res.data
        if (result.success) {
          this.getList()
          this.$message.success('添加成功')
        } else {
          this.$message.error(result.message)
        }
      })
    },
    // 关闭详情
    handleDialogClose() {
      this.$emit('closeDialog')
    }
  }
}
</script>

<style lang='scss'>
  .questionnaire-option-add {
    padding-bottom: 10px;
  }
</style>
