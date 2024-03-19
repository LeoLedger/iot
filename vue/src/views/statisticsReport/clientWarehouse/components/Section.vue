<!--
* @description  客户仓库-标段
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-filter
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
            <el-input
                v-model="searchParam.sectionName"
                placeholder="标段名称"
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
            <el-input
                v-model="searchParam.productName"
                placeholder="产品名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.productType"
                type="productType"
                placeholder="产品类型"
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
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
            />
        </div>
    </layout-filter>
</template>
<script>
    // 工具
    // API
    import deviceApi from '@/api/inventory/device'
    import clientWarehouseApi from '@/api/statisticsReport/clientWarehouse'
    // 组件

    export default {
        components: {
        },
        data() {
            const extendParams = {
                typeId: 'cf946c33-9f2c-11eb-bbfa-000c29bb1337',
                warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                warehousesSpaceId: 'e9c33757-4b00-4ac6-b5ed-eaefd2388b06',
                lockedProps: ['sectionId', 'productCode', 'unitStatus']
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
                            prop: 'sectionName',
                            label: '标段名称',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 200,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 200,
                            type: 'dict',
                            dictType: 'productType'
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 200
                        },
                        {
                            prop: 'normalCount',
                            label: '正常',
                            minWidth: 100,
                            dbProp: 'c_normal_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '查看设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: deviceApi.getList,
                                    extendParams: {
                                        unitStatus: 1,
                                        sectionId: row.sectionId,
                                        productCode: row.productCode,
                                        costCenterId: row.costCenterId,
                                        ...extendParams
                                    }
                                }
                            }
                        },
                        {
                            prop: 'maintainingCount',
                            label: '保修中',
                            minWidth: 100,
                            dbProp: 'c_maintaining_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '查看设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: deviceApi.getList,
                                    extendParams: {
                                        unitStatus: 6,
                                        sectionId: row.sectionId,
                                        productCode: row.productCode,
                                        costCenterId: row.costCenterId,
                                        ...extendParams
                                    }
                                }
                            }
                        },
                        {
                            prop: 'waitingMaintingCount',
                            label: '待寄修',
                            minWidth: 100,
                            dbProp: 'c_waiting_mainting_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '查看设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: deviceApi.getList,
                                    extendParams: {
                                        unitStatus: 4,
                                        sectionId: row.sectionId,
                                        productCode: row.productCode,
                                        costCenterId: row.costCenterId,
                                        ...extendParams
                                    }
                                }
                            }
                        },
                        {
                            prop: 'sendMaintainingCount',
                            label: '寄修中',
                            minWidth: 100,
                            dbProp: 'c_send_maintaining_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '查看设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: deviceApi.getList,
                                    extendParams: {
                                        unitStatus: 5,
                                        sectionId: row.sectionId,
                                        productCode: row.productCode,
                                        costCenterId: row.costCenterId,
                                        ...extendParams
                                    }
                                }
                            }
                        },
                        {
                            prop: 'allCount',
                            label: '数量',
                            minWidth: 100,
                            dbProp: 'c_all_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '查看设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: deviceApi.getList,
                                    extendParams: {
                                        sectionId: row.sectionId,
                                        productCode: row.productCode,
                                        costCenterId: row.costCenterId,
                                        ...extendParams
                                    }
                                }
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        summaryMethod: this.handleSummary
                    }
                },
                summaryData: [],
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
                var { data } = await clientWarehouseApi.toSection({
                    ...this.searchParam
                })
                this.tableData.list = data.data.records
                this.tableData.total = data.data.total
                this.tableData.options.loading = false
                this.summaryData = [
                    data.normalCount,
                    data.maintainingCount,
                    data.waitingMaintingCount,
                    data.sendMaintainingCount,
                    data.allCount
                ]
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
