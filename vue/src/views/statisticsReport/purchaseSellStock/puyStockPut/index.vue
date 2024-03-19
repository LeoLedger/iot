<!--
* @description  外购入库台账
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
            <DictSelect
                v-model="searchParam.approvalStatus"
                :exclude="[4]"
                type="documentStatus"
                placeholder="单据状态"
                clearable
                filterable
                size="mini"
                style="width: 200px"
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.code"
                placeholder="入库单据号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productName"
                placeholder="产品类型"
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
    import puyStockPutApi from '@/api/statisticsReport/purchaseSellStock/puyStockPut'
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
                            prop: 'enterWarehouseTime',
                            label: '入库日期',
                            minWidth: 90
                        },
                        {
                            prop: 'approvalStatus',
                            type: 'status',
                            enums: enums.documentStatus,
                            label: '审核标志',
                            width: 85
                        },
                        {
                            label: '入库单据号',
                            prop: 'code',
                            width: 160,
                            isClick: true,
                            dialogType: 'storagePutApproval',
                            idKey: 'approvalId'
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 200,
                            idKey: 'supplierId',
                            isClick: true,
                            dialogType: 'supplier'
                        },
                        {
                            prop: 'warehousesName',
                            label: '收料仓库',
                            minWidth: 160
                        },
                        {
                            prop: 'productName',
                            label: '产品类型',
                            minWidth: 160
                        },
                        {
                            prop: 'productCode',
                            label: '规格型号',
                            minWidth: 120
                        },
                        {
                            prop: 'unit',
                            label: '单位',
                            minWidth: 80
                        },
                        {
                            type: 'money',
                            prop: 'unitPrice',
                            label: '采购单价',
                            minWidth: 100
                        },
                        {
                            prop: 'countApply',
                            label: '入库数量',
                            minWidth: 100
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '入库金额（不含税）',
                            minWidth: 140
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 140
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
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
                var res = await puyStockPutApi.getList({
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
                puyStockPutApi.export(data)
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
