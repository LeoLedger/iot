<!--
* @description  延保费报表
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
                v-model="searchParam.purchaseSupplierName"
                placeholder="供应商名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <!--            <el-date-picker-->
            <!--                v-model="searchParam.queryTime"-->
            <!--                :default-time="['00:00:00', '23:59:59']"-->
            <!--                type="datetimerange"-->
            <!--                format="yyyy-MM-dd"-->
            <!--                value-format="yyyy-MM-dd HH:mm:ss"-->
            <!--                range-separator="至"-->
            <!--                start-placeholder="结算起始"-->
            <!--                end-placeholder="结算截止"-->
            <!--                clearable-->
            <!--                style="width: 300px"-->
            <!--                class="filter-item"-->
            <!--                @change="handleFilter"-->
            <!--            />-->
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
    import mainApi from '@/api/statisticsReport/extendLife'
    import { getPriceFormat, getDayOfTheMonth } from '@/utils'
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
                            prop: 'purchaseSupplierName',
                            label: '供应商',
                            minWidth: 120
                        },
                        {
                            prop: 'projectCode',
                            label: '项目编号',
                            minWidth: 120
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
                            prop: 'amount',
                            label: '延保费',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'totalAmount',
                            label: '合计金额',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'rate',
                            label: '税率',
                            minWidth: 60,
                            align: 'right',
                            formatter: (params, formData) => {
                                if (params[formData.prop]) {
                                    return Number(params[formData.prop]) * 100 + ' %'
                                }
                                return '- -'
                            }
                        },
                        {
                            prop: 'noRateAmount',
                            label: '不含税',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'rateAmount',
                            label: '税额',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'monthlyAmount',
                            label: '月分摊金额(不含税)',
                            minWidth: 60,
                            type: 'money'
                        },
                        {
                            prop: 'startTime',
                            label: '服务期起',
                            minWidth: 120,
                            type: 'date'
                        },
                        {
                            prop: 'endTime',
                            label: '服务期止',
                            minWidth: 120,
                            type: 'date'
                        },
                        {
                            prop: 'cycle',
                            label: '分摊期限',
                            minWidth: 60
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
                summary: {
                    amount: 0,
                    totalAmount: 0,
                    rate: 0,
                    noRateAmount: 0,
                    rateAmount: 0,
                    monthlyAmount: 0
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
                console.log('res.data', res.data)
                this.tableData.list = res.data.data.records
                this.tableData.total = res.data.data.total
                this.summary = res.data.sumData || {}
                // this.tableData.list.splice(res.data.data.length - 1)
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
                        sums[index] = '合计'
                        return
                    }
                    if (index === 4) {
                        if (this.summary.amount) {
                            sums[index] = getPriceFormat(this.summary.amount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 5) {
                        if (this.summary.totalAmount) {
                            sums[index] = getPriceFormat(this.summary.totalAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 6) {
                        if (this.summary.rate) {
                            sums[index] = this.summary.rate * 100 + ' %'
                        } else sums[index] = '--'
                    }
                    if (index === 7) {
                        if (this.summary.noRateAmount) {
                            sums[index] = getPriceFormat(this.summary.noRateAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 8) {
                        if (this.summary.rateAmount) {
                            sums[index] = getPriceFormat(this.summary.rateAmount) + ' 元'
                        } else sums[index] = '--'
                    }
                    if (index === 9) {
                        if (this.summary.monthlyAmount) {
                            sums[index] = getPriceFormat(this.summary.monthlyAmount) + ' 元'
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
