<!--
* @description  销售-买断统计
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
            <el-input
                v-model="searchParam.projectName"
                placeholder="项目名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.customerName"
                placeholder="甲方名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productName"
                placeholder="设备类型"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productCode"
                placeholder="型号"
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
    </layout-template>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    // API
    import salesBuyoutApi from '@/api/statisticsReport/salesBuyout'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '基本资料',
                            align: 'center',
                            children: [
                                {
                                    prop: 'projectName',
                                    label: '运营项目',
                                    minWidth: 200,
                                    idKey: 'projectId',
                                    isClick: true,
                                    dialogType: 'project'
                                },
                                {
                                    label: '执行状态',
                                    prop: 'status',
                                    type: 'status',
                                    style: 'dot',
                                    enums: enums.contractStatus,
                                    width: 100
                                },
                                {
                                    type: 'dateRange',
                                    label: '合同服务期',
                                    startKey: 'startDate',
                                    endKey: 'endDate',
                                    minWidth: 180
                                },
                                {
                                    prop: 'contractCode',
                                    label: '合同编号',
                                    minWidth: 155,
                                    disabled: true,
                                    idKey: 'contractId',
                                    isClick: true,
                                    dialogType: 'salesContract'
                                },
                                {
                                    prop: 'customerName',
                                    label: '甲方',
                                    minWidth: 200
                                },
                                {
                                    prop: 'productName',
                                    label: '设备类型',
                                    minWidth: 160
                                },
                                {
                                    type: 'dict',
                                    dictType: 'contractType',
                                    prop: 'type',
                                    label: '成交模式',
                                    width: 100
                                },
                                {
                                    prop: 'productCode',
                                    label: '型号',
                                    minWidth: 140,
                                    idKey: 'productId',
                                    isClick: true,
                                    dialogType: 'product'
                                }
                            ]
                        },
                        {
                            label: '合同收款（含税）',
                            align: 'center',
                            children: [
                                {
                                    prop: 'count',
                                    label: '数量',
                                    minWidth: 80,
                                    dbProp: 'c_new_count',
                                    sortable: 'custom'
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceDeposit',
                                    label: '押金',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceSales',
                                    label: '销售单价',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceMove',
                                    label: '单位迁移费',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceInstall',
                                    label: '单位安装费',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceDepositTotal',
                                    label: '押金总额',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceSalesTotal',
                                    label: '销售总额',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceMoveTotal',
                                    label: '迁移费',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceInstallTotal',
                                    label: '安装费总额',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'amount',
                                    label: '合同总金额',
                                    width: 100
                                }
                            ]
                        },
                        {
                            label: '出库情况（不含税）',
                            align: 'center',
                            children: [
                                {
                                    prop: 'outCount',
                                    label: '出库数量',
                                    minWidth: 80
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPrice',
                                    label: '成本单价',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'costAmount',
                                    label: '成本金额',
                                    minWidth: 130
                                }
                            ]
                        },
                        // {
                        //     label: '开票情况',
                        //     align: 'center',
                        //     children: [
                        //         {
                        //             type: 'money',
                        //             prop: 'shouldinvoiceAmount',
                        //             label: '应开票金额',
                        //             minWidth: 130
                        //         },
                        //         {
                        //             type: 'money',
                        //             prop: 'alreadyInvoiceAmount',
                        //             label: '累计已开票',
                        //             minWidth: 130
                        //         },
                        //         {
                        //             type: 'money',
                        //             prop: 'unInvoiceAmount',
                        //             label: '剩余未开票',
                        //             minWidth: 130
                        //         }
                        //     ]
                        // },
                        {
                            label: '收款情况',
                            align: 'center',
                            children: [
                                // {
                                //     type: 'money',
                                //     prop: 'xxx',
                                //     label: '收款金额',
                                //     minWidth: 130
                                // },
                                {
                                    prop: 'payee',
                                    label: '收款人',
                                    minWidth: 130
                                }
                            ]
                        },
                        {
                            label: '财务核算',
                            align: 'center',
                            children: [
                                {
                                    type: 'money',
                                    prop: 'unitPriceSalesTotal',
                                    label: '设备销售总额（含税）',
                                    minWidth: 150
                                },
                                {
                                    type: 'money',
                                    prop: 'unTaxunitPriceSales',
                                    label: '不含税销售额',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'biggerRate',
                                    label: '税率',
                                    minWidth: 80
                                },
                                {
                                    type: 'money',
                                    prop: 'deviceSalesTax',
                                    label: '设备销售税额',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceInstallTotal',
                                    label: '安装费总额',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'taxInstallTotal',
                                    label: '安装费不含税',
                                    minWidth: 130
                                },
                                {
                                    prop: 'rate',
                                    label: '税率',
                                    minWidth: 80
                                },
                                {
                                    type: 'money',
                                    prop: 'unstallTax',
                                    label: '安装费税额',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceMoveTotal',
                                    label: '迁移费总额',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'unTaxunitPriceMoveTotal',
                                    label: '迁移费不含税',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'rate',
                                    label: '税率',
                                    minWidth: 80
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPriceMoveTax',
                                    label: '迁移税额',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'allIncome',
                                    label: '总收入',
                                    minWidth: 130
                                }
                            ]
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                selectDialog: {
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
                var res = await salesBuyoutApi.getList({
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
                salesBuyoutApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
