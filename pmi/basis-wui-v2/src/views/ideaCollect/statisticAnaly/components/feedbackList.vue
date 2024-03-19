<!--
* @description 
* @fileName feedbackList.vue
* @author 王鹏
* @date 2019/09/04 09:51:30
* @version V1.0.0
!-->
<template>
  <el-dialog
    :visible.sync="feedbackListVisible"
    :before-close="handleDialogClose"
    :title="titleCont"
    width="80%"
  >
    <el-table
      height="400px"
      :data="list"
      border
      cell-class-name="text_hidden"
      fit
      resizable
      highlight-current-row
      @sort-change="tableSortChange"
    >
      <el-table-column align="center" width="50" label="序号">
        <template slot-scope="scope">
          <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="编号" width="120">
        <template slot-scope="scope">
          <span class="table-view" @click="viewFeedbackDetails(scope.row)">{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="主题" prop="theme">
        <template slot-scope="scope">
          <span :title="scope.row.theme">{{ scope.row.theme }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="问题类型" prop="feedbackOptionName">
        <template slot-scope="scope">
          <span :title="scope.row.feedbackOptionName">{{ scope.row.feedbackOptionName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="功能模块" prop="module" />
      <el-table-column align="center" label="提交人" prop="reporter" />
      <el-table-column align="center" label="联系电话" prop="phone" />
      <el-table-column align="center" label="提交时间" prop="reportDate" sortable="custom" />
    </el-table>
    <pagination
      v-show='pagination.records>0'
      :total='pagination.records'
      :page.sync='searchParam.pageIndex'
      :limit.sync='searchParam.pageSize'
      @pagination='getList'
      />
  </el-dialog>
</template>

<script>
import waves from '@/directive/waves'; // Waves directive;
import prereclick from '@/directive/prereclick'; // prereclick directive;
import Pagination from '@/components/Pagination';
import resourceApi from '@/api/resource';
import { getFeedbackList } from '@/api/ideaCollect/feedback'
export default {
  name:'xx',
  directives: { waves, prereclick},
  components: {
    Pagination
  },
  props: {
    feedbackListVisible: {
      type: Boolean,
      default: false
    },
    viewId: {
      type: Number,
      default: 0,
    }
  },
  data () {
    return {
      titleCont: '问题反馈列表',
      pagination: {
        records: 0,
        pageIndex: 0,
        ageTotal: 0,
      },
      searchParam: {
        moduleArr: [], // 功能模块
        feedbackOptionName: '', // 问题类型（传问题内容）
        reporter: null, // 反馈人
        phone: null, // 联系电话
        code: null, // 编号
        theme: '', // 主题
        userId: '', // 用户id.
        beginDate: '', // 开始时间
        endDate: '', // 结束时间
        keyValues: '', // 查询参数
        pageIndex: 1,
        pageSize: 15,
      },
      list: []
    }
  },
  created(){
  },
  watch: {
    viewId: {
      immediate: true,
      handler(val) {
        this.searchParam.moduleArr = [val]
        this.list = []
        this.getList()
      }
    }
  },
  methods: {
    tableSortChange(column) {
      if (column.prop != null) {
        this.searchParam.sortField = column.prop
        this.searchParam.sortDirection = column.order
      } else {
        this.searchParam.sortField = ''
        this.searchParam.sortDirection = ''
      }
      this.getList()
    },
    getList(){
      getFeedbackList(this.searchParam).then(res => {
        if (res && res.data.success) {
          const result = res.data
          result.data.rows.map(v => {
            v.reportDate = v.reportDate.replace('T', ' ').substring(0, v.reportDate.length - 4)
          })
          this.list = result.data.rows
          this.pagination.records = res.data.data.records
        }
      })
    },
    // 查看详情
    viewFeedbackDetails(row) {
      console.log(row)
      this.viewDataId = row.id
      this.feedbackData = {
        reporter: row.reporter,
        phone: row.phone,
        reportDate: row.reportDate
      }
      this.feedbackDetailsVisible = true
      const data = {
        viewDataId: row.id,
        feedbackData: {
          reporter: row.reporter,
          phone: row.phone,
          reportDate: row.reportDate
        }
      }
      this.$emit('viewDetails', data)
    },
    handleDialogClose(){
      this.$emit('closeDialog', 'feedbackListVisible')
    },
  },
}
</script>

<style lang='scss' scoped>
 
</style>
