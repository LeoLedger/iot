<!--
* @description  出库记录查询
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.statistical.storageOut.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.statistical.storageOut.export'])"
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
            <el-input
                v-model="searchParam.contractCode"
                placeholder="合同单号"
                size="mini"
                clearable
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
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="关联单据编号">
                <el-input
                    v-model="searchParam.approvalCode"
                    clearable
                    size="mini"
                    placeholder="关联单据编号"
                />
            </layout-filter-item>
            <layout-filter-item label="出库类型">
                <DictSelect
                    v-model="searchParam.type"
                    type="storageOutType"
                    placeholder="出库类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="产品名称">
                <el-input
                    v-model="searchParam.productName"
                    clearable
                    size="mini"
                    placeholder="产品名称"
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
            <layout-filter-item label="出库仓库">
                <WarehouseCascader
                    :form-data="searchParam"
                    stock-key="warehousesId"
                    place-key="warehousesSpaceId"
                    placeholder="出库仓库"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="项目">
                <el-input
                    v-model="searchParam.projectName"
                    clearable
                    size="mini"
                    placeholder="项目"
                />
            </layout-filter-item>
            <layout-filter-item label="企业">
                <el-input
                    v-model="searchParam.customerName"
                    clearable
                    size="mini"
                    placeholder="企业"
                />
            </layout-filter-item>
            <layout-filter-item label="标段">
                <el-input
                    v-model="searchParam.sectionName"
                    clearable
                    size="mini"
                    placeholder="标段"
                />
            </layout-filter-item>
            <layout-filter-item label="出库时间">
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
            <layout-filter-item label="最新审批时间">
                <el-date-picker
                    v-model="searchParam.approvalYesTime"
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
            <layout-filter-item label="操作人">
                <el-input
                    v-model="searchParam.userName"
                    clearable
                    size="mini"
                    placeholder="操作人"
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
    import storageOutApi from '@/api/statistical/storageOut'
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
                            label: '关联单据',
                            minWidth: 155,
                            idKey: 'approvalId',
                            isClick: true,
                            disabled: true,
                            dialogType: ({ row }) => {
                                switch (row.type) {
                                case 2: return 'carTroubleBill'
                                case 3: return 'troubleTicket'
                                default: return 'storageOutApproval'
                                }
                            },
                            extendParams: ({ row }) => {
                                switch (row.type) {
                                case 2:
                                    return {}
                                default:
                                    return {
                                        onlyShow: true
                                    }
                                }
                            }
                        },
                        {
                            type: 'dict',
                            dictType: 'storageOutType',
                            prop: 'type',
                            label: '出库类型',
                            width: 120,
                            disabled: true
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
                            type: 'dict',
                            dictType: 'contractType',
                            prop: 'contractType',
                            label: '合同类型',
                            width: 100
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 130
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 130,
                            type: 'dict',
                            dictType: 'productType'
                        },
                        {
                            prop: 'count',
                            label: '出库数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'warehousesName',
                            label: '出库仓库',
                            minWidth: 150,
                            formatter: (row, column) => {
                                return `${row.warehousesName || '- -'} | ${row.warehousesSpaceName || '- -'}`
                            }
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            minWidth: 170
                        },
                        {
                            label: '企业',
                            prop: 'customerName',
                            minWidth: 170
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 170,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId'
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '出库时间',
                            width: 150,
                            format: 'YYYY-MM-DD HH:mm:ss',
                            dbProp: 'c_create_time',
                            sortable: 'custom'
                        },
                        {
                            type: 'date',
                            prop: 'approvalYesTime',
                            label: '审批时间',
                            width: 150,
                            format: 'YYYY-MM-DD HH:mm:ss'
                        },
                        {
                            prop: 'userName',
                            label: '操作人',
                            width: 80
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
                var res = await storageOutApi.getList({
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
                storageOutApi.export(data)
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
