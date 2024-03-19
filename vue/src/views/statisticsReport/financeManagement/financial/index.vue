<!--
* @description  出纳报表
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
            <el-input
                v-model="searchParam.projectName"
                placeholder="项目名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.objectName"
                placeholder="客户/供应商名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-date-picker
                v-model="searchParam.queryTime"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="结算起始"
                end-placeholder="结算截止"
                clearable
                style="width: 300px"
                class="filter-item"
                @change="handleFilter"
            />
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
    import mainApi from '@/api/statisticsReport/financial'
    import { getPriceFormat, getDayOfTheMonth } from '@/utils'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    pageSize: 100,
                    pageIndex: 1,
                    queryTime: [
                        getDayOfTheMonth('s', 0) + ' 00:00:00',
                        getDayOfTheMonth('e', 0) + ' 23:59:59'
                    ]
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'payTime',
                            label: '收付日期',
                            minWidth: 60,
                            type: 'date'
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 120,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'billCode',
                            label: '合同编号',
                            minWidth: 120
                            // idKey: 'purchaseContractId',
                            // isClick: true,
                            // dialogType: 'purchaseContract'
                        },
                        {
                            label: '费用类型',
                            prop: 'costTypeDesc',
                            width: 150
                        },
                        {
                            prop: 'objectName',
                            label: '客户/供应商',
                            minWidth: 120
                            // idKey: 'customerId',
                            // isClick: true,
                            // dialogType: 'customer'
                        },
                        {
                            prop: 'beginAmount',
                            label: '期初金额',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'receivedAmount',
                            label: '收款金额',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'spendAmount',
                            label: '支出金额',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'endAmount',
                            label: '期末金额',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'userName',
                            label: '销售员/业务员',
                            minWidth: 60
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 60
                        }

                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        showPagination: false,
                        summaryMethod: this.handleSummary
                    }
                },
                summary: {
                    // 期初金额
                    beginAmount: 0,
                    // 收款金额
                    receivedAmount: 0,
                    // 支出金额
                    spendAmount: 0,
                    // 期末金额
                    endAmount: 0
                }
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
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await mainApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data
                this.tableData.total = res.data.length
                if (res.data.length > 0) {
                    this.summary = res.data[res.data.length - 1]
                } else this.summary = {}
                this.tableData.list.splice(res.data.length - 1)
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
                mainApi.export(data)
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
                        sums[index] = '年合计'
                        return
                    }
                    if (index === 6) {
                        if (this.summary.beginAmount) {
                            sums[index] = getPriceFormat(this.summary.beginAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 7) {
                        if (this.summary.receivedAmount) {
                            sums[index] = getPriceFormat(this.summary.receivedAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 8) {
                        if (this.summary.spendAmount) {
                            sums[index] = getPriceFormat(this.summary.spendAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 9) {
                        if (this.summary.endAmount) {
                            sums[index] = getPriceFormat(this.summary.endAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                })
                return sums
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
