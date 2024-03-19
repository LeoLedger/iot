<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        class="project"
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
                v-model="searchParam.code"
                placeholder="合同编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同类型">
                <DictSelect
                    v-model="searchParam.type"
                    type="contractType"
                    placeholder="合同类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="合同金额">
                <div class="flex-align-center">
                    <el-input
                        v-model="searchParam.amountList[0]"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最小金额"
                        clearable
                        style="width: 120px"
                    />
                    <span class="separator">至</span>
                    <el-input
                        v-model="searchParam.amountList[1]"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最大金额"
                        clearable
                        style="width: 120px"
                    />
                </div>
            </layout-filter-item>
            <layout-filter-item label="合同期限">
                <el-date-picker
                    v-model="searchParam.dateList"
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
            <layout-filter-item label="签订日期">
                <el-date-picker
                    v-model="searchParam.signedDateRange"
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
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
    </layout-filter>
</template>

<script>
    import { getPriceFormat } from '@/utils'
    import moment from 'moment'
    import contractApi from '@/api/PM/contract'
    import projectApi from '@/api/PM/project'

    export default {
        name: 'SalesContract',
        props: {
            customerId: {
                type: String,
                default: null
            }
        },
        data() {
            var that = this
            return {
                searchParam: {
                    type: '',
                    code: '',
                    name: '',
                    dataList: [],
                    amountList: [],
                    schedule: [],
                    projectId: '',
                    sectionId: '',
                    customerId: '',
                    signedDate: [],
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '合同编号',
                            minWidth: 120,
                            disabled: true,
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'type',
                            label: '合同类型',
                            width: 100,
                            formatter: (params, formData) => {
                                return (that.getDict('contractType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'amount',
                            label: '合同总金额（元）',
                            width: 120,
                            align: 'right',
                            type: 'money'
                        },
                        {
                            prop: 'amountReceived',
                            label: '已收款(元)',
                            width: 100,
                            align: 'right',
                            type: 'money'
                        },
                        {
                            prop: 'amountReceivedRate',
                            label: '收款进度',
                            width: 100,
                            align: 'right'
                        },
                        {
                            prop: '_period',
                            label: '合同期限',
                            width: 180,
                            formatter: (params, formData) => {
                                if (params.startDate && params.endDate) {
                                    return `${moment(params.startDate).format('yyyy-MM-DD')} 至 ${moment(params.endDate).format('yyyy-MM-DD')}`
                                }
                                return '- -'
                            }
                        },
                        {
                            prop: 'signedDate',
                            label: '签订日期',
                            width: 140,
                            type: 'date'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        summaryMethod: this.handleSummary
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: false
                    }
                },
                summary: {
                    denominator: 0,
                    molecule: 0
                }
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            },
            customerId(val) {
                if (this.customerId) {
                    this.searchParam.customerId = val
                    this.getList()
                }
            }
        },
        mounted() {
            if (this.customerId) {
                this.searchParam.customerId = this.customerId
                this.getList()
            }
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                const res = await contractApi.getList({
                    ...this.searchParam,
                    amountList: this.searchParam.amountList.filter(v => v !== ''),
                    customerId: this.customerId,
                    approvalStatus: 3
                })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        return item
                    })
                    this.tableData.total = res.data.total
                }
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
                projectApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleSummary({ columns, data }) {
                const sums = []
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '合计'
                        return
                    }
                    if (index === 3 || index === 4) {
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
                            if (index === 3) this.summary.denominator = sums[index]
                            if (index === 4) this.summary.molecule = sums[index]
                            sums[index] = getPriceFormat(sums[index]) + ' 元'
                        } else {
                            sums[index] = '--'
                        }
                    }
                    if (index === 5) {
                        // 分母 - 总金额
                        const denominator = this.summary.denominator
                        // 分子 - 已收款
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
.flex-align-center {
  display: flex;
  align-items: center;
  .flex {
    flex: 1;
  }
  .separator {
    margin: 0 8px;
    font-size: 12px;
  }
  /deep/ {
    .el-input__inner {
      text-align: center;
    }
  }
}
</style>
