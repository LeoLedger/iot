<!--
* @description  销售-出库统计
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
                v-model="searchParam.projectCode"
                placeholder="项目编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.customerName"
                placeholder="客户名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productName"
                placeholder="产品名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productCode"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
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
    import salesStorageOutApi from '@/api/statisticsReport/salesStorageOut'
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
                            type: 'date',
                            prop: 'outWarehouseTime',
                            label: '出库日期',
                            minWidth: 100
                        },
                        {
                            label: '合同基本资料',
                            align: 'center',
                            children: [
                                {
                                    prop: 'projectCode',
                                    label: '项目编号',
                                    minWidth: 140
                                },
                                {
                                    prop: 'projectName',
                                    label: '项目名称',
                                    minWidth: 200,
                                    idKey: 'projectId',
                                    isClick: true,
                                    dialogType: 'project'
                                },
                                {
                                    prop: 'customerName',
                                    label: '客户名称',
                                    minWidth: 200,
                                    isClick: true,
                                    dialogType: 'customer',
                                    idKey: 'customerId'
                                },
                                {
                                    prop: 'productCode',
                                    label: '产品编号',
                                    minWidth: 140,
                                    idKey: 'productId',
                                    isClick: true,
                                    dialogType: 'product'
                                },
                                {
                                    prop: 'productName',
                                    label: '产品名称',
                                    minWidth: 140
                                },
                                {
                                    prop: 'productType',
                                    label: '产品类型',
                                    minWidth: 140,
                                    type: 'dict',
                                    dictType: 'productType'
                                },
                                {
                                    type: 'dict',
                                    dictType: 'productCategory',
                                    prop: 'productCategory',
                                    label: '产品种类',
                                    minWidth: 120
                                },
                                {
                                    prop: 'supplierName',
                                    label: '供应商',
                                    minWidth: 200,
                                    isClick: true,
                                    dialogType: 'supplier',
                                    idKey: 'supplierId'
                                }
                            ]
                        },
                        {
                            label: '采购成本',
                            align: 'center',
                            children: [
                                {
                                    type: 'money',
                                    prop: 'purchaseCost',
                                    label: '采购成本',
                                    width: 100
                                },
                                {
                                    prop: 'biggerRate',
                                    label: '采购税率',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unTaxPurchaseCost',
                                    label: '采购不含税',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'trafficFeeYear',
                                    label: '年流量费',
                                    width: 100
                                },
                                {
                                    prop: 'rate',
                                    label: '流量税率',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unTaxTrafficFeeYear',
                                    label: '流量费不含税',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'installCost',
                                    label: '安装成本',
                                    width: 100
                                },
                                {
                                    prop: 'rate',
                                    label: '安装税率',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'unTaxInstallCost',
                                    label: '安装不含税',
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'allCostAmount',
                                    label: '成本合计',
                                    width: 100
                                }
                            ]
                        },
                        {
                            label: '销售情况',
                            align: 'center',
                            children: [
                                {
                                    prop: 'salesCount',
                                    label: '销售数量',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'unitPrice',
                                    label: '销售单价',
                                    minWidth: 130
                                },
                                {
                                    prop: 'biggerRate',
                                    label: '税率',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'salesIncome',
                                    label: '销售收入（不含税）',
                                    minWidth: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'salesGrossProfit',
                                    label: '销售毛利',
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
                var res = await salesStorageOutApi.getList({
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
                salesStorageOutApi.export(data)
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
