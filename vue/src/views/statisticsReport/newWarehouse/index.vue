<!--
* @description  全新仓库
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
    </layout-template>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    import { filterList } from '@/utils'
    // API
    import deviceApi from '@/api/inventory/device'
    import deviceSimApi from '@/api/inventory/deviceSim'
    import deviceOtherApi from '@/api/inventory/deviceOther'
    import newWarehouseApi from '@/api/statisticsReport/newWarehouse'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120,
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
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 130
                        },
                        {
                            prop: 'count',
                            label: '数量',
                            minWidth: 100,
                            dbProp: 'c_new_count',
                            sortable: 'custom',
                            isCopy: false,
                            isClick: ({ row }) => enums.productCategoryId.findIndex(v => v.id === row.productCategory) > -1,
                            onClick: (row) => {
                                let category = enums.productCategoryId.find(v => v.id === row.productCategory)
                                this.selectDialog = {
                                    type: 'device',
                                    title: '查看设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: [
                                        deviceApi.getList,
                                        deviceSimApi.getList,
                                        deviceOtherApi.getList
                                    ][category.value],
                                    extendParams: {
                                        typeId: row.spaceId,
                                        productCode: row.productCode,
                                        costCenterId: row.costCenterId,
                                        warehousesId: [
                                            '1bba900a-26c8-492e-bd6d-1583814866c9',
                                            void 0,
                                            '1bba900a-26c8-492e-bd6d-1583814866c9'
                                        ][category.value],
                                        warehousesSpaceIds: [
                                            ['0d6146ff-ab3d-4dde-8584-803e2fc03730'],
                                            ['764b61fe-14c1-43cf-b7fb-b1eb93d3e340', '282a27b2-c877-442c-8fdf-d3c12c8b59e1'],
                                            ['09bf8815-fea3-4f22-b90d-e87765fd37cd']
                                        ][category.value],
                                        lockedProps: ['productCode']
                                    }
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
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await newWarehouseApi.getList({
                    ...this.searchParam
                })
                this.dataList = res.data
                this.filterData()
                this.tableData.options.loading = false
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = filterList(this.dataList, this.searchParam, [
                    { name: 'productCode', type: 'string' },
                    { name: 'productName', type: 'string' },
                    { name: 'productType', type: 'same' }
                ])
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                this.tableData.total = list.length
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
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
