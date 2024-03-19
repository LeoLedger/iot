<!--
* @description 问题反馈
* @author 王鹏
!-->
<template>
  <el-dialog
    :visible.sync="feedbackOptionDialogVisible"
    :before-close="handleDialogClose"
    title="问题反馈规则配置"
    width="800px"
    class="feedback-container"
  >
    <el-table
      height="400px"
      :data="feedbackOptionList"
      border
      highlight-current-row
    >
      <el-table-column type="index" align="center" width="50" label="序号" />
      <el-table-column align="center" label="选项">
        <template slot-scope="scope">
          <el-input v-model="scope.row.question" size="mini" placeholder="请输入内容" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="满意度" width="150">
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
      <el-table-column align="center" label="操作" width="80">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" icon="el-icon-minus" @click="delFeedbackOption(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="feedback-option-btn">
      <el-button type="success" size="mini" @click="addNewFeedbackOption">
        添加选项
      </el-button>
      <el-button size="mini" @click="handleDialogClose">
        取消
      </el-button>
      <el-button type="primary" size="mini" @click="saveFeedbackOption">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getFeedbackOption, postFeedbackOption, deleteFeedbackOption } from '@/api/ideaCollect/feedback'
export default {
  name: 'FeedbackOptionDialog',
  props: {
    feedbackOptionDialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 配置
      feedbackOptionList: [
        {
          id: 0,
          question: '',
          satisfaction: ''
        }
      ]
    }
  },
  watch: {
    feedbackOptionDialogVisible(newVal, oldVal) {
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
      getFeedbackOption(this.searchParam).then(res => {
        const result = res.data
        if (result.length !== 0) {
          this.feedbackOptionList = result
        }
      })
    },
    // 获取输入框的值
    handleInput(val, scope) {
      // console.log(val, scope)
      console.log(this.feedbackOptionList)
    },
    // 新增配置
    addNewFeedbackOption() {
      this.feedbackOptionList.push({
        id: 0,
        question: '',
        satisfaction: ''
      })
    },
    // 删除配置
    delFeedbackOption(index) {
      if (this.feedbackOptionList[index].id !== 0) {
        deleteFeedbackOption(this.feedbackOptionList[index].id).then(res => {
          const result = res.data
          if (result.success) {
            this.feedbackOptionList.splice(index, 1)
            this.$message.success('删除成功')
          } else {
            this.$message.error(result.message)
          }
        })
      } else {
        this.feedbackOptionList.splice(index, 1)
        this.$message.success('删除成功')
      }
    },
    // 保存配置
    saveFeedbackOption() {
      // 判断已经保存的选项内容是否为空
      const defaultList = this.feedbackOptionList.filter(v => {
        return v.id > 0
      })
      let hasEmpty = false
      for (let i = 0; i < defaultList.length; i++) {
        if (defaultList[i].question.replace(/(^\s{0,})|(\s{0,}$)/g, '').length === 0) {
          const txt = `第${i + 1}个选项内容为空, 如果不需要请删除`
          this.$message.warning(txt)
          hasEmpty = true
        }
      }
      if (hasEmpty) { return }

      // 判断所有的选项内容是否为空
      const list = this.feedbackOptionList.filter(v => {
        return v.question.replace(/(^\s{0,})|(\s{0,}$)/g, '').length > 0
      })
      if (list.length === 0) {
        this.$message.warning('请至少输入一个选项')
        return
      }

      list.map(v => {
        v.satisfaction = v.satisfaction * 1
      })

      const fromData = {
        questionList: list
      }

      postFeedbackOption(fromData).then(res => {
        const result = res.data
        if (result.success) {
          // this.$emit('closeDialog', 'feedbackOptionDialogVisible')
          this.$message.success('添加成功')
        } else {
          this.$message.error(result.message)
        }
      })
    },
    // 关闭详情
    handleDialogClose() {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$emit('closeDialog', 'feedbackOptionDialogVisible')
          done()
        })
        .catch(_ => {})
    }
  }
}
</script>

<style lang='scss'>
    .feedback-option-add {
        padding-bottom: 10px;
    }
</style>
