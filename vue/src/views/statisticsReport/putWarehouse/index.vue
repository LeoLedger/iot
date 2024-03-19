<!--
* @description  入库
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
            <el-input
                v-model="searchParam.supplierName"
                placeholder="供应商名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.costCenterId"
                :disabled="!isEmpty(userInfo.costCenterId)"
                type="costCenter"
                placeholder="成本中心"
                clearable
                filterable
                size="mini"
                class="filter-item"
                style="width: 200px"
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
    import { mapGetters } from 'vuex'
    import { isEmpty } from '@/utils'
    // API
    import putWarehouseApi from '@/api/statisticsReport/putWarehouse'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    costCenterId: ''
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 130,
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
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 200,
                            isClick: true,
                            dialogType: 'supplier',
                            idKey: 'supplierId'
                        },
                        {
                            prop: 'costCenterId',
                            label: '成本中心',
                            minWidth: 200,
                            type: 'dict',
                            dictType: 'costCenter'
                        },
                        {
                            prop: 'enterWarehouseCount',
                            label: '入库数量',
                            minWidth: 100,
                            dbProp: 'c_enter_warehouse_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.listConfigDialog = {
                                    title: '入库详情',
                                    method: putWarehouseApi.detail,
                                    table: {
                                        columns: [
                                            {
                                                prop: 'approvalCode',
                                                label: '入库单号',
                                                minWidth: 120,
                                                idKey: 'approvalId',
                                                isClick: true,
                                                dialogType: 'storagePutApproval'
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
                                        productId: row.productId,
                                        costCenterId: row.costCenterId,
                                        scopeDate: this.searchParam.scopeDate
                                    },
                                    visible: true
                                }
                            }
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
            ...mapGetters(['userInfo'])
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            },
            'userInfo.costCenterId'(value) {
                this.searchParam.costCenterId = value
            }
        },
        mounted() {
            this.searchParam.costCenterId = this.userInfo.costCenterId
            this.getList()
        },
        methods: {
            isEmpty,
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await putWarehouseApi.getList({
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
