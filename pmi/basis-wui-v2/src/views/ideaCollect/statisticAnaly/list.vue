<!--
* @description 统计分析
* @author 王鹏
!-->
<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="filter-top">
        <el-date-picker
          v-model="beginEndDate"
          size="mini"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
          value-format="yyyy-MM-dd"
          style="width: 325px"
          clearable
        />
        <!-- 搜索 -->
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="resetgetList()"
        >
          搜索
        </el-button>
        <!-- 导出
        <el-button
          class="filter-item"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="exportList()"
        >
          导出
        </el-button>
      </div> -->
      </div>
    </div>
    <el-table
      :height="tableHeght"
      :data="list"
      border
      fit
      resizable
      highlight-current-row
    >
      <el-table-column fixed align="center" width="50" label="序号">
        <template slot-scope="scope">
          <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="功能模块" prop="module" />
      <el-table-column align="center" label="问题反馈（40%）">
        <el-table-column
          align="center"
          prop="feedbackCount"
          label="问题数量"
        >
          <template slot-scope="scope">
            <span class="table-view" @click="handleFeaturesClick(scope.row)">{{ scope.row.feedbackCount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="satisfactionAvg"
          label="满意度"
        >
          <template slot-scope="scope">
            <span>{{ (scope.row.satisfactionAvg).toFixed(2) }}%</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" label="问卷调查（60%）">
        <el-table-column
          align="center"
          prop="questionnaireCount"
          label="问卷数量"
        />
        <el-table-column
          align="center"
          prop="questionnaireSatisfactionAvg"
          label="满意度"
        >
          <template slot-scope="scope">
            <span>{{ (scope.row.questionnaireSatisfactionAvg).toFixed(2) }}%</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        align="center"
        label="整体满意度"
        prop="wholeSatisfaction"
      >
        <template slot-scope="scope">
          <span>{{ (scope.row.wholeSatisfaction).toFixed(2) }}%</span>
        </template>
      </el-table-column>
    </el-table>
    <dialog-wrap :viewId="viewId" :show="showFeedbackListDialog" @dialogClose="handleDialogClose"></dialog-wrap>
  </div>
</template>

<script>
import DialogWrap from './components/dialogWrap'
import { getFeedbackStatisticsList, queryFeedbackExport } from '@/api/ideaCollect/feedback'
export default {
  name: 'FeedbackStatisticsList',
  components: {
    DialogWrap
  },
  props: {},
  data() {
    return {
      tableHeght: 0, // 表格高度
      pagination: {
        records: 0,
        pageIndex: 0,
        ageTotal: 0
      },
      infoSection: false,
      list: [],
      beginEndDate: [], // 开始结束时间集合
      searchParam: {
        userId: '', // 用户id.
        beginDate: '', // 开始时间
        endDate: '', // 结束时间
        keyValues: '', // 查询参数
        pageIndex: 1,
        pageSize: 15,
      },
      viewId: 0, // 访问的功能id
      showFeedbackListDialog: false // 展示问题反馈列表
    }
  },
  watch: {
  },
  created() {
    this.getList()
  },
  mounted() {
    this.setTableHeight()
  },
  methods: {
    // 设置表格高度
    setTableHeight() {
      this.$nextTick(() => {
        const filterHeight = document.getElementsByClassName('filter-container')[0].clientHeight
        const windowH = window.innerHeight
        this.tableHeght = windowH - filterHeight - 160
      })
    },
    // 搜索
    resetgetList() {
      this.searchParam.pageIndex = 1
      if (this.beginEndDate.length > 0) {
        this.searchParam.beginDate = this.beginEndDate[0]
        this.searchParam.endDate = this.beginEndDate[1]
      }
      this.getList()
    },
    // 列表
    getList() {
      getFeedbackStatisticsList(this.searchParam).then(res => {
        if (res && res.data.success) {
          const result = res.data
          this.list = result.data.filter(v=> v.moduleId !== 4112)
        }
      })
    },
    // 导出
    exportList() {
      queryFeedbackExport(this.searchParam)
    },
    // 功能列表点击
    handleFeaturesClick(row) {
      // console.log(row)
      this.viewId = row.moduleId
      this.showFeedbackListDialog = true
    },
    // 列表关闭
    handleDialogClose(e){
      this.showFeedbackListDialog = false
    }
  }
}
</script>

<style lang='scss'>

</style>
