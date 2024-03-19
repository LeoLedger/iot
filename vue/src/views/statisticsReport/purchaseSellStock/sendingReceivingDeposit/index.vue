<!--
* @description  收发存台账
* @fileName index.vue
* @author 易超
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
                v-model="searchParam.scopeDate"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                style="width: 300px"
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productName"
                placeholder="物料名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productCode"
                placeholder="规格型号"
                size="mini"
                clearable
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
        <div>
            <ListConfigDialog
                v-if="listConfigDialog.visible"
                v-bind="listConfigDialog"
                :visible.sync="listConfigDialog.visible"
            />
        </div>
    </layout-template>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    // API
    import sendingReceivingDepositApi from '@/api/statisticsReport/purchaseSellStock/sendingReceivingDeposit'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            type: 'date',
                            prop: 'approvalTime',
                            label: '日期',
                            minWidth: 90
                        },
                        {
                            prop: 'productName',
                            label: '物料名称',
                            minWidth: 200,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'productCode',
                            label: '规格型号',
                            minWidth: 120
                        },
                        {
                            prop: 'unit',
                            label: '计量单位',
                            minWidth: 80
                        },
                        {
                            label: '期初数',
                            align: 'center',
                            children: [
                                {
                                    prop: 'initCount',
                                    label: '期初结存数量',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'initUnitPrice',
                                    label: '期初结存单价',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'initAmount',
                                    label: '期初结存金额',
                                    minWidth: 100
                                }
                            ]
                        },
                        {
                            label: '入库',
                            align: 'center',
                            children: [
                                {
                                    prop: 'enterCount',
                                    label: '本期收入数量',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'enterUnitPrice',
                                    label: '本期收入单价',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'enterAmount',
                                    label: '本期收入金额',
                                    minWidth: 100
                                }
                            ]
                        },
                        {
                            label: '出库',
                            align: 'center',
                            children: [
                                {
                                    prop: 'outCount',
                                    label: '本期发出数量',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'outUnitPrice',
                                    label: '本期发出单价',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'outAmount',
                                    label: '本期发出金额',
                                    minWidth: 100
                                }
                            ]
                        },
                        {
                            label: '期末结存',
                            align: 'center',
                            children: [
                                {
                                    prop: 'endCount',
                                    label: '期末结存数量',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'endUnitPrice',
                                    label: '期末结存单价',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'endAmount',
                                    label: '期末结存金额',
                                    minWidth: 100
                                }
                            ]
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true
                    }
                },
                summaryData: [],
                listConfigDialog: {
                    visible: false
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
                var res = await sendingReceivingDepositApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records
                this.tableData.total = res.data.total
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
                sendingReceivingDepositApi.export(data)
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
                    if (index > 4) {
                        sums[index] = this.summaryData[index - 5]
                    }
                    return ''
                })
                return sums
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
