<!--
* @description  入库记录查询
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.statistical.storagePut.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.statistical.storagePut.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
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
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="入库单号">
                <el-input
                    v-model="searchParam.approvalCode"
                    clearable
                    size="mini"
                    placeholder="入库单号"
                />
            </layout-filter-item>
            <layout-filter-item label="产品类型">
                <DictSelect
                    v-model="searchParam.productType"
                    type="productType"
                    placeholder="产品类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="入库仓库">
                <WarehouseCascader
                    :form-data="searchParam"
                    stock-key="warehousesId"
                    place-key="warehousesSpaceId"
                    placeholder="入库仓库"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="采购合同">
                <el-input
                    v-model="searchParam.purchaseContractCode"
                    clearable
                    size="mini"
                    placeholder="采购合同"
                />
            </layout-filter-item>
            <layout-filter-item label="入库时间">
                <el-date-picker
                    v-model="searchParam.createTime"
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
    </layout-template>
</template>
<script>
    // 工具
    // API
    import storagePutApi from '@/api/statistical/storagePut'
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
                            prop: 'approvalCode',
                            label: '入库单号',
                            minWidth: 155,
                            idKey: 'approvalId',
                            isClick: true,
                            dialogType: 'storagePutApproval',
                            disabled: true,
                            extendParams: {
                                onlyShow: true
                            }
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120,
                            disabled: true
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 130
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 120,
                            type: 'dict',
                            dictType: 'productType'
                        },
                        {
                            prop: 'count',
                            label: '入库数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'purchaseContractCode',
                            label: '采购合同',
                            minWidth: 155,
                            idKey: 'purchaseContractId',
                            isClick: true,
                            dialogType: 'purchaseContract'
                        },
                        {
                            type: 'money',
                            prop: 'unitPrice',
                            label: '采购单价',
                            width: 120,
                            dbProp: 'c_unit_price',
                            sortable: 'custom'
                        },
                        {
                            prop: 'warehousesName',
                            label: '入库仓库',
                            minWidth: 160,
                            formatter: (row, column) => {
                                return `${row.warehousesName || '- -'} | ${row.warehousesSpaceName || '- -'}`
                            }
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '入库时间',
                            width: 160,
                            format: 'YYYY-MM-DD HH:mm:ss',
                            dbProp: 'c_create_time',
                            sortable: 'custom'
                        },
                        {
                            prop: 'userName',
                            label: '操作人',
                            width: 100
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
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
                var res = await storagePutApi.getList({
                    ...this.searchParam
                })
                if (res.success) {
                    this.tableData.list = res.data.records
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
                storagePutApi.export(data)
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
