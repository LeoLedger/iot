<!--
* @description  出库台账
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
        <template slot="filter-popup">
            <layout-filter-item label="审核通过日期">
                <el-date-picker
                    v-model="searchParam.approvalTime"
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
    import stockOutApi from '@/api/statisticsReport/purchaseSellStock/stockOut'
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
                            prop: 'outWarehouseTime',
                            label: '日期',
                            minWidth: 90
                        },
                        {
                            prop: 'approvalStatus',
                            type: 'status',
                            enums: enums.documentStatus,
                            label: '审核状态',
                            width: 85
                        },
                        {
                            type: 'date',
                            prop: 'approvalTime',
                            label: '审核通过日期',
                            minWidth: 100
                        },
                        {
                            label: '出库单据号',
                            prop: 'code',
                            width: 160,
                            isClick: true,
                            dialogType: 'storageOutApproval',
                            idKey: 'approvalId'
                        },
                        {
                            prop: 'customerName',
                            label: '购货单位',
                            minWidth: 200,
                            idKey: 'customerId',
                            isClick: true,
                            dialogType: 'customer'
                        },
                        {
                            prop: 'warehousesSpaceName',
                            label: '发货仓库',
                            minWidth: 160
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
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
                            prop: 'countConfig',
                            label: '实发数量',
                            minWidth: 100
                        },
                        {
                            type: 'money',
                            prop: 'unitCost',
                            label: '单位成本（不含税）',
                            minWidth: 100
                        },
                        {
                            prop: 'allCost',
                            label: '成本（不含税）',
                            minWidth: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'storageOutType',
                            prop: 'outType',
                            label: '单据类型',
                            width: 100
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 140
                        },
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            minWidth: 200,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        }, {
                            type: 'dict',
                            dictType: 'isProjectContract',
                            prop: 'isProject',
                            label: '是否项目合同',
                            width: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'isVirtualContract',
                            prop: 'isVirtual',
                            label: '是否虚拟合同',
                            width: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'isDeviceHistoryContract',
                            prop: 'isHistoryDevice',
                            label: '是否历史设备合同',
                            width: 120
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
                var res = await stockOutApi.getList({
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
                stockOutApi.export(data)
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
