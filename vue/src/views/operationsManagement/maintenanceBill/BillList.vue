<!--
* @description 维修费账单
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.maintenanceBill.search'])"
        class="container"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.maintenanceBill.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.imei"
                placeholder="IMEI"
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
                v-model="searchParam.repairCarCode"
                placeholder="账单编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="maintenanceBillStatus"
                    placeholder="状态"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="项目名称">
                <el-input
                    v-model="searchParam.projectName"
                    size="mini"
                    placeholder="项目名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="标段名称">
                <el-input
                    v-model="searchParam.sectionName"
                    size="mini"
                    placeholder="标段名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="客户名称">
                <el-input
                    v-model="searchParam.customerName"
                    size="mini"
                    placeholder="客户名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="维修结算单据编号">
                <el-input
                    v-model="searchParam.repairBillSettleCode"
                    size="mini"
                    placeholder="维修结算单据编号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <el-input
                    v-model="searchParam.supplierName"
                    placeholder="供应商"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="生成日期">
                <el-date-picker
                    v-model="searchParam.buildDate"
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
            <layout-filter-item label="确认人">
                <el-input
                    v-model="searchParam.confirmationUserName"
                    placeholder="确认人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="确认时间">
                <el-date-picker
                    v-model="searchParam.confirmationTime"
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
            <BillDialog
                v-if="billDialogVisible"
                :data-id="activeRowId"
                :visible.sync="billDialogVisible"
                @update="handleSuccess"
            />
        </div>
    </layout-filter>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import maintenanceBillApi from '@/api/operationsManagement/maintenanceBill'
    // 组件
    import BillDialog from './components/BillDialog'

    export default {
        components: {
            BillDialog
        },
        props: {
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 155
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 100
                        },
                        {
                            prop: 'repairCode',
                            label: '维修/寄修单号',
                            minWidth: 150,
                            isClick: true,
                            idKey: 'repairId',
                            dialogType: ({ row }) => row.type < 2 ? null : 'expressRepairCar',
                            onClick: (data) => {
                                if (data.type < 2) {
                                    this.activeRowId = data.guidId
                                    this.billDialogVisible = true
                                }
                            }
                        },
                        {
                            type: 'status',
                            enums: enums.maintenanceBillStatus,
                            prop: 'status',
                            label: '状态',
                            width: 100
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 210
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 210
                        },
                        {
                            prop: 'customerName',
                            label: '客户',
                            minWidth: 210
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 210
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'labourCost',
                            label: '人工费（元）',
                            width: 130,
                            dbProp: 'c_labour_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'cost',
                            label: '维修费用（元）',
                            width: 130,
                            dbProp: 'c_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'companyBearCost',
                            label: '公司承担（元）',
                            width: 130,
                            dbProp: 'c_company_bear_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'enterpriseBearCost',
                            label: '客户承担（元）',
                            width: 130,
                            dbProp: 'c_enterprise_bear_cost',
                            sortable: 'custom'
                        },
                        {
                            prop: 'repairBillSettleCode',
                            label: '维修结算单据编号',
                            minWidth: 210
                        },
                        {
                            type: 'date',
                            prop: 'buildDate',
                            label: '生成日期',
                            width: 100,
                            dbProp: 'c_build_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'userName',
                            label: '确认人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'confirmationTime',
                            label: '确认时间',
                            width: 140,
                            format: 'YYYY-MM-DD HH:mm',
                            dbProp: 'c_confirmation_time',
                            sortable: 'custom'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    repairCarCode: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowId: null,
                billDialogVisible: false,
                batchDialogVisible: false
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
                var res = await maintenanceBillApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(item => {
                    return item
                })
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
                maintenanceBillApi.export(data)
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
