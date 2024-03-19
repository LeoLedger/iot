<!--
* @description 问卷调查
* @author 王鹏
!-->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchParam.reporter"
        placeholder="提交人"
        clearable
        class="filter-item"
        style="width:200px"
        size="mini"
      />
      <el-input
        v-model="searchParam.phone"
        placeholder="联系电话"
        clearable
        class="filter-item"
        style="width:200px"
        size="mini"
      />
      <el-input
        v-model="searchParam.code"
        placeholder="问卷编号"
        clearable
        class="filter-item"
        style="width:200px"
        size="mini"
      />
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
      <!-- 导出 -->
      <el-button
        class="filter-item"
        type="warning"
        icon="el-icon-download"
        size="mini"
        @click="exportList()"
      >
        导出
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-setting"
        size="mini"
        @click="addQuestionnaireConfigure()"
      >
        规则配置
      </el-button>
    </div>
    <el-table
      :height="tableHeght"
      :data="list"
      border
      fit
      resizable
      highlight-current-row
      @sort-change="tableSortChange"
    >
      <el-table-column
        fixed
        align="center"
        width="50"
        label="序号"
      >
        <template slot-scope="scope">
          <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        fixed
        label="编号"
        width="120"
      >
        <template slot-scope="scope">
          <span
            class="table-view"
            @click="viewQuestionnaireDetails(scope.row)"
          >{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="提交人"
        prop="reporter"
      />
      <el-table-column
        align="center"
        label="联系电话"
        prop="phone"
      />
      <el-table-column
        align="center"
        label="提交时间"
        prop="reportDate"
        sortable="custom"
      />
      <el-table-column
        align="center"
        label="满意度%"
        prop="satisfaction"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.satisfaction.toFixed(2) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="pagination.records>0"
      :total="pagination.records"
      :page.sync="searchParam.pageIndex"
      :limit.sync="searchParam.pageSize"
      @pagination="getList"
    />
    <questionnaire-details
      :id="viewDataId"
      :questionnaire-data="questionnaireData"
      :questionnaire-details-visible="questionnaireDetailsVisible"
      @closeDialog="handleDialogClose"
    />
    <questionnaire-configure-dialog
      :questionnaire-configure-dialog-visible="questionnaireConfigureDialogVisible"
      @closeDialog="handleDialogClose"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import QuestionnaireDetails from './components/questionnaireDetails'
import QuestionnaireConfigureDialog from './components/questionnaireConfigureDialog'
import {
  queryQuestionnaireExport,
  getQuestionnaireList
} from '@/api/ideaCollect/questionnaire'
export default {
  name: 'Questionnaire',
  components: {
    Pagination,
    QuestionnaireDetails,
    QuestionnaireConfigureDialog
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
        reporter: '', // 反馈人
        phone: null, // 联系电话
        code: null, // 编号
        userId: '', // 用户id.
        beginDate: '', // 开始时间
        endDate: '', // 结束时间
        keyValues: '', // 查询参数
        pageIndex: 1,
        pageSize: 15,
      },
      questionnaireConfigureList: [], // 问卷类型列表
      questionnaireConfigureStr: null, // 选中问卷类型列表
      questionnaireConfigureDialogVisible: false, // 展示配置信息
      questionnaireDetailsVisible: false, // 详情信息
      questionnaireData: {}, // 查看详情数据
      viewDataId: 0 // 查看详情数据
    }
  },
  watch: {},
  created() {
    this.getList()
  },
  mounted() {
    this.setTableHeight()
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
    // 设置表格高度
    setTableHeight() {
      this.$nextTick(() => {
        const filterHeight = document.getElementsByClassName(
          'filter-container'
        )[0].clientHeight
        const windowH = window.innerHeight
        this.tableHeght = windowH - filterHeight - 160
      })
    },
    // 搜索
    resetgetList() {
      this.searchParam.pageIndex = 1
      if (this.beginEndDate && this.beginEndDate.length > 0) {
        this.searchParam.beginDate = this.beginEndDate[0]
        this.searchParam.endDate = this.beginEndDate[1]
      } else {
        this.searchParam.beginDate = ''
        this.searchParam.endDate = ''
      }
      this.getList()
    },
    // 列表
    getList() {
      getQuestionnaireList(this.searchParam).then(res => {
        if (res && res.data.success) {
          const result = res.data
          result.data.rows.map(v => {
            v.reportDate = v.reportDate
              .replace('T', ' ')
              .substring(0, v.reportDate.length - 4)
          })
          this.list = result.data.rows
          this.pagination.records = res.data.data.records
          if (this.list.length === 0) {
            this.infoSection === false
          } else {
            this.handleCurrentChange(this.list[0])
          }
        }
      })
    },
    // 导出
    exportList() {
      queryQuestionnaireExport(this.searchParam)
    },
    // 行点击
    handleCurrentChange(val) {},
    // 功能选择
    handleFeaturesChange(data) {
      console.log(data)
      this.searchParam.moduleArr = data
    },
    // 配置信息选择
    handleQuestionnaireConfigureChange(data) {
      console.log(data)
      this.searchParam.questionnaireConfigureName = data
    },
    // 添加配置信息
    addQuestionnaireConfigure() {
      this.questionnaireConfigureDialogVisible = true
    },
    // 查看详情
    viewQuestionnaireDetails(row) {
      console.log(row)
      this.viewDataId = row.id
      this.questionnaireData = row
      this.questionnaireDetailsVisible = true
    },
    // 弹窗关闭
    handleDialogClose(visible) {
      console.log(visible)
      this[visible] = !this[visible]
    }
  }
}
</script>

<style lang='scss'>
.table-view {
  color: #409eff;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
