<!--
* @description  收款计划
* @fileName index.vue
* @author
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
                v-model="searchParam.dateList"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="合同签订开始日期"
                end-placeholder="合同签订结束日期"
                clearable
            />
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
            />
        </template>
    </layout-template>
</template>
<script>
    // 工具
    import { filterList } from '@/utils'
    // API
    import financialStatements from '@/api/statisticsReport/financialStatements.js'
    // 组件

    export default {
        components: {
        },
        data() {
            let myDate = new Date()
            let month = myDate.getMonth() + 1
            month = month < 10 ? '0' + month : month // 格式化月份，补0
            let day = myDate.getDate()
            day = day < 10 ? '0' + day : day
            let beginDate = myDate.getFullYear().toString() + '-' + month + '-01 00:00:00' // 月初
            let endDate = myDate.getFullYear().toString() + '-' + month + '-' + day + ' 23:59:59'
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'f0',
                            label: '应收合同财务组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f1',
                            label: '应收合同财务组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f2',
                            label: '应收合同合同编号',
                            minWidth: 120
                        },
                        {
                            prop: 'f3',
                            label: '应收合同名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f4',
                            label: '收款计划行',
                            minWidth: 120
                        },
                        {
                            prop: 'f5',
                            label: '项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f6',
                            label: '项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f7',
                            label: '业务类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f8',
                            label: '业务类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f9',
                            label: '产品类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f10',
                            label: '产品类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f11',
                            label: '收款类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f12',
                            label: '收款类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f13',
                            label: '收款日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f14',
                            label: '收款比例%',
                            minWidth: 120
                        },
                        {
                            prop: 'f15',
                            label: '结算方式名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f16',
                            label: '结算方式编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f17',
                            label: '收款金额',
                            minWidth: 120
                        },
                        {
                            prop: 'f18',
                            label: '已收金额',
                            minWidth: 120
                        },
                        {
                            prop: 'f19',
                            label: '已收款日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f20',
                            label: '累计收款原币金额',
                            minWidth: 120
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    dateList: [beginDate, endDate],
                    beginDate: beginDate,
                    endDate: endDate,
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            },
            'searchParam.dateList'(val) {
                if (val) {
                    this.searchParam.beginDate = val[0]
                    this.searchParam.endDate = val[1]
                } else {
                    this.searchParam.beginDate = null
                    this.searchParam.endDate = null
                }
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
                var res = await financialStatements.pageContractCollectionPlan({
                    ...this.searchParam
                })
                this.dataList = res.data.records
                this.filterData()
                this.tableData.options.loading = false
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = filterList(this.dataList, this.searchParam, [
                    { name: 'productCode', type: 'string' },
                    { name: 'productName', type: 'string' },
                    { name: 'productType', type: 'same' }
                ])
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                this.tableData.total = list.length
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                    this.getList()
                } else {
                    this.getList()
                    // this.filterData()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                financialStatements.pageContractCollectionPlanExport(data)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
