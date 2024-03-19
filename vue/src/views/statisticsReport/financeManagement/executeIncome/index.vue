<!--
* @description  财务收入执行
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template slot="button">
              <el-button
                  v-waves
                  size="mini"
                  class="filter-button"
                  type="warning"
                  icon="el-icon-download"
                  @click="handleExport"
              >导出</el-button>
        </template>
        <template slot="filter">
            <el-date-picker
                v-model="searchParam.yearAndMonth"
                type="month"
                format="yyyy-MM"
                value-format="yyyy-MM"
                clearable
                style="width: 150px"
                class="filter-item"
                placeholder="选择年月"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.saleContractCode"
                placeholder="销售合同编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.saleContractName"
                placeholder="销售合同名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同类型">
                <DictSelect
                    v-model="searchParam.saleContractType"
                    type="contractType"
                    placeholder="合同类型"
                    clearable
                    filterable
                    size="mini"
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="合同开始">
                <el-date-picker
                    v-model="searchParam.startDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="合同截止">
                <el-date-picker
                    v-model="searchParam.endDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="项目名称">
                <el-input
                    v-model="searchParam.projectName"
                    size="mini"
                    placeholder="项目名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="客户名称">
                <el-input
                    v-model="searchParam.customerName"
                    size="mini"
                    placeholder="客户名称"
                    clearable
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
    </layout-template>
</template>
<script>
  // 工具
  // API
    import mainApi from '@/api/statisticsReport/execute'
    import { getPriceFormat } from '@/utils'
    import moment from 'moment'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    pageSize: 100,
                    pageIndex: 1,
                    yearAndMonth: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'saleContractCode',
                            label: '销售合同编号',
                            minWidth: 180,
                            dialogType: 'salesContract',
                            idKey: 'saleContractId',
                            isClick: true
                        },
                        {
                            prop: 'saleContractName',
                            label: '销售合同名称',
                            minWidth: 150
                        },
                        {
                            prop: 'saleContractType',
                            label: '销售合同类型',
                            type: 'dict',
                            dictType: 'contractType',
                            minWidth: 120
                        },
                        {
                            prop: 'contractAmount',
                            label: '合同金额',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'startDate_endDate',
                            label: '合同期限',
                            minWidth: 200
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 150,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'customerName',
                            label: '客户',
                            minWidth: 150
                        },
                        {
                            prop: 'saleShouldAmount',
                            label: '销售收入-应执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'saleAlreadyAmount',
                            label: '销售收入-已执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'saleUnAmount',
                            label: '销售收入-待执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'serviceShouldAmount',
                            label: '服务费-应执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'serviceThisAmount',
                            label: '服务费-本期执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'serviceSubtractAmount',
                            label: '服务费-核检金额',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'serviceCumulativeAmount',
                            label: '服务费-累积执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'serviceUnAmount',
                            label: '服务费-待执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'installShouldAmount',
                            label: '安装费-应执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'installAlreadyAmount',
                            label: '安装费-已执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'installUnAmount',
                            label: '安装费-待执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'moveShouldAmount',
                            label: '迁装费-应执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'moveAlreadyAmount',
                            label: '迁装费-已执行',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'moveUnAmount',
                            label: '迁装费-待执行',
                            minWidth: 120,
                            type: 'money'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        showPagination: true,
                        summaryMethod: this.handleSummary
                    }
                },
                summaryData: {}
            }
        },
        computed: {
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            const month = (new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)
            this.searchParam.yearAndMonth = new Date().getFullYear() + '-' + month
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await mainApi.getIncomeList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.data.records
                this.tableData.list.map(item => {
                    item.startDate_endDate = (item.startDate).replace('T00:00:00', ' ') + ' - ' + item.endDate.replace('T23:59:59', ' ')
                })
                this.summaryData = res.data
                this.tableData.total = res.data.data.total
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                mainApi.exportIncome(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleSummary({ columns, data }) {
                const sums = []
                columns.forEach((column, index) => {
                    if (index === 1) {
                        sums[index] = '合计'
                        return
                    }
                    if (index === 4) {
                        sums[index] = getPriceFormat(this.summaryData.sumContractAmount) + ' 元'
                    }
                    if (index === 8) {
                        sums[index] = getPriceFormat(this.summaryData.sumSaleShouldAmount) + ' 元'
                    }
                    if (index === 9) {
                        sums[index] = getPriceFormat(this.summaryData.sumSaleAlreadyAmount) + ' 元'
                    }
                    if (index === 10) {
                        sums[index] = getPriceFormat(this.summaryData.sumSaleUnAmount) + ' 元'
                    }
                    if (index === 11) {
                        sums[index] = getPriceFormat(this.summaryData.sumServiceShouldAmount) + ' 元'
                    }
                    if (index === 12) {
                        sums[index] = getPriceFormat(this.summaryData.sumServiceThisAmount) + ' 元'
                    }
                    if (index === 15) {
                        sums[index] = getPriceFormat(this.summaryData.sumServiceUnAmount) + ' 元'
                    }
                    if (index === 16) {
                        sums[index] = getPriceFormat(this.summaryData.sumInstallShouldAmount) + ' 元'
                    }
                    if (index === 17) {
                        sums[index] = getPriceFormat(this.summaryData.sumInstallAlreadyAmount) + ' 元'
                    }
                    if (index === 18) {
                        sums[index] = getPriceFormat(this.summaryData.sumInstallUnAmount) + ' 元'
                    }
                    if (index === 19) {
                        sums[index] = getPriceFormat(this.summaryData.sumMoveShouldAmount) + ' 元'
                    }
                    if (index === 20) {
                        sums[index] = getPriceFormat(this.summaryData.sumMoveAlreadyAmount) + ' 元'
                    }
                    if (index === 21) {
                        sums[index] = getPriceFormat(this.summaryData.sumMoveUnAmount) + ' 元'
                    }
                })
                return sums
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
