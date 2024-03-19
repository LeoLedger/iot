<!--
* @description  合同出库
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
            <!-- <el-button
                v-waves
                v-if="checkFeature(['ty.iot.xxx.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button> -->
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
                v-model="searchParam.contractType"
                type="contractType"
                placeholder="合同类型"
                clearable
                filterable
                size="mini"
                style="width: 200px"
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.projectName"
                placeholder="项目名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.sectionName"
                placeholder="标段名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.customerName"
                placeholder="企业名称"
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
    // API
    import outWarehouseContractApi from '@/api/statisticsReport/outWarehouseContract'
    // 组件

    export default {
        components: {
        },
        data() {
            const columnClick = (row) => {
                this.listConfigDialog = {
                    title: '出库详情',
                    method: outWarehouseContractApi.detail,
                    table: {
                        columns: [
                            {
                                prop: 'approvalCode',
                                label: '出库单号',
                                minWidth: 120,
                                idKey: 'approvalId',
                                isClick: true,
                                dialogType: 'storageOutApproval'
                            },
                            {
                                prop: 'productType',
                                label: '产品类型',
                                minWidth: 120,
                                type: 'dict',
                                dictType: 'productType'
                            },
                            {
                                prop: 'productName',
                                label: '产品名称',
                                minWidth: 130
                            }
                        ]
                    },
                    params: {
                        sectionId: row.sectionId,
                        productId: row.productId,
                        projectId: row.projectId,
                        customerId: row.customerId,
                        costCenterId: row.costCenterId,
                        scopeDate: this.searchParam.scopeDate
                    },
                    visible: true
                }
            }
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
                            prop: 'projectName',
                            label: '项目名称',
                            minWidth: 200,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'sectionName',
                            label: '标段名称',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'customerName',
                            label: '企业名称',
                            minWidth: 200,
                            idKey: 'customerId',
                            isClick: true,
                            dialogType: 'customer'
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 200,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 120,
                            type: 'dict',
                            dictType: 'productType'
                        },
                        {
                            prop: 'costCenterId',
                            label: '成本中心',
                            minWidth: 120,
                            type: 'dict',
                            dictType: 'costCenter'
                        },
                        {
                            type: 'dict',
                            dictType: 'contractType',
                            prop: 'contractType',
                            label: '合同类型',
                            minWidth: 120
                        },
                        {
                            prop: 'outWarehouseApplyCount',
                            label: '申请数量',
                            minWidth: 120,
                            dbProp: 'c_out_warehouse_apply_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: columnClick
                        },
                        {
                            prop: 'outWarehouseActualCount',
                            label: '实际出库数量',
                            minWidth: 120,
                            dbProp: 'c_out_warehouse_actual_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: columnClick
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
                var res = await outWarehouseContractApi.getList({
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
                newStockApi.export(data)
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
