<!--
* @description  安装登记
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
                v-model="searchParam.supplierName"
                placeholder="供应商名称"
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
    import mainApi from '@/api/statisticsReport/carryOverFault'
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
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 120,
                            idKey: 'supplierId',
                            isClick: true,
                            dialogType: 'supplier'
                        },
                        {
                            prop: 'projectCode',
                            label: '项目编号',
                            minWidth: 120,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            minWidth: 120,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'amount',
                            label: '维护费(安装费)',
                            minWidth: 60,
                            type: 'money'
                        },
                        // {
                        //     prop: 'warrantyFee',
                        //     label: '延保费',
                        //     minWidth: 60,
                        //     type: 'money'
                        // },
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
                            formatter: (params, formData) => {
                                if (params[formData.prop]) {
                                    return params[formData.prop] + '%'
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
                        }
                        // {
                        //     prop: 'startTime',
                        //     label: '服务期起',
                        //     minWidth: 60,
                        //     type: 'date'
                        // },
                        // {
                        //     prop: 'endTime',
                        //     label: '服务期止',
                        //     minWidth: 60,
                        //     type: 'date'
                        // }
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
                    denominator: 0,
                    molecule: 0
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
                    if (index >= 4 && index <= 9 && index !== 7) {
                        const values = data.map(item => Number(item[column.property]))
                        if (!values.every(value => isNaN(value))) {
                            sums[index] = values.reduce((prev, curr) => {
                                const value = Number(curr)
                                if (!isNaN(value)) {
                                    return prev + curr
                                } else {
                                    return prev
                                }
                            }, 0)
                            if (index === 6) this.summary.denominator = sums[index]
                            if (index === 9) this.summary.molecule = sums[index]
                            sums[index] = getPriceFormat(sums[index]) + ' 元'
                        } else {
                            sums[index] = '--'
                        }
                    }
                    if (index === 7) {
                        // 分母 - 合计金额
                        const denominator = this.summary.denominator
                        // 分子 - 税额
                        const molecule = this.summary.molecule
                        if (denominator) {
                            if (molecule) {
                                sums[index] = Math.round(molecule / denominator * 10000) / 100 + '%'
                            } else sums[index] = '0.00%'
                        } else sums[index] = '0.00%'
                    }
                })
                return sums
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
