<!--
* @description 问题反馈
* @author 王鹏
!-->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader
        v-model="featuresStr"
        size="mini"
        placeholder="请选择功能模块"
        :options="featuresList"
        :props="{ checkStrictly: true }"
        clearable
        @change="handleFeaturesChange"
      />
      <el-select v-model="feedbackOptionStr" size="mini" placeholder="请选择问题类型" clearable @change="handleFeedbackOptionChange">
        <el-option
          v-for="item in feedbackOptionList"
          :key="item.id"
          :label="item.question"
          :value="item.question"
        />
      </el-select>
      <el-input
        v-model="searchParam.reporter"
        placeholder="反馈人"
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
        v-model="searchParam.theme"
        placeholder="主题"
        clearable
        class="filter-item"
        style="width:200px"
        size="mini"
      />
      <el-input
        v-model="searchParam.code"
        placeholder="编号"
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
        @click="addFeedbackOption()"
      >
        规则配置
      </el-button>
    </div>
    <el-table
      :height="tableHeght"
      :data="list"
      border
      cell-class-name="text_hidden"
      fit
      resizable
      highlight-current-row
      @sort-change="tableSortChange"
    >
      <el-table-column fixed align="center" width="50" label="序号">
        <template slot-scope="scope">
          <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <!-- sortable="custom" -->
      <el-table-column align="center" fixed label="编号" width="120">
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
      <el-table-column align="center" label="功能模块" prop="module" sortable="custom" />
      <el-table-column align="center" label="提交人" prop="reporter" />
      <el-table-column align="center" label="联系电话" prop="phone" />
      <el-table-column align="center" label="提交时间" prop="reportDate" sortable="custom" />
    </el-table>
    <pagination
      v-show="pagination.records>0"
      :total="pagination.records"
      :page.sync="searchParam.pageIndex"
      :limit.sync="searchParam.pageSize"
      @pagination="getList"
    />
    <feedback-details :id="viewDataId" :feedback-data="feedbackData" :feedback-details-visible="feedbackDetailsVisible" @closeDialog="handleDialogClose" />
    <feedback-option-dialog :feedback-option-dialog-visible="feedbackOptionDialogVisible" @closeDialog="handleDialogClose" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import FeedbackDetails from './components/feedbackDetails'
import FeedbackOptionDialog from './components/feedbackOptionDialog'
import { queryFeedbackExport, getFeedbackList, getFeedbackOption } from '@/api/ideaCollect/feedback'
import { getSysTem } from '@/api/resource'
export default {
  name: 'Feedback',
  components: {
    Pagination,
    FeedbackDetails,
    FeedbackOptionDialog
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
      feedbackOptionList: [], // 问题类型列表
      feedbackOptionStr: null, // 选中问题类型列表
      feedbackOptionDialogVisible: false, // 展示配置信息
      feedbackDetailsVisible: false, // 详情信息
      feedbackData: {}, // 查看详情数据
      viewDataId: 0, // 查看详情数据
      featuresList: [], // 功能列表
      featuresStr: null // 选中的功能列表
    }
  },
  watch: {
  },
  created() {
    this.getList()
    // 设置默认功能模块
    if (this.$route.params.moduleId) {
      this.featuresStr = this.$route.params.moduleId
      this.searchParam.moduleArr = [this.$route.params.moduleId]
    }
  },
  mounted() {
    this.setTableHeight()
    this.getFeaturesList()
    this.getFeedbackOptionList()
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
        const filterHeight = document.getElementsByClassName('filter-container')[0].clientHeight
        const windowH = window.innerHeight
        this.tableHeght = windowH - filterHeight - 160
      })
    },
    // 获取功能列表
    getFeaturesList() {
      getSysTem({
        id: 0,
        appId: 'AA2E2C8F-787F-4B30-92A5-4239B485113D'
      }).then(res => {
        console.log(res)
        // 移除children
        function removeObjChildren(data) {
          const list = data
          for (let i = 0; i < list.length; i++) {
            if (list[i].children.length === 0) {
              delete list[i].children
            } else {
              removeObjChildren(list[i].children)
            }
          }
          return list
        }

        this.featuresList = removeObjChildren(res.data[0].children)
      })
    },
    // 获取问题类型配置信息
    getFeedbackOptionList() {
      getFeedbackOption().then(res => {
        this.feedbackOptionList = res.data
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
    // 导出
    exportList() {
      queryFeedbackExport(this.searchParam)
    },
    // 功能选择
    handleFeaturesChange(data) {
      this.searchParam.moduleArr = data
    },
    // 配置信息选择
    handleFeedbackOptionChange(data) {
      this.searchParam.feedbackOptionName = data
    },
    // 添加配置信息
    addFeedbackOption() {
      this.feedbackOptionDialogVisible = true
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
    color: #409EFF;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
</style>
