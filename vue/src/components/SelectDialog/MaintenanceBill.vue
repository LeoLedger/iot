<!--
* @description 选择寄修单
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <el-input
                v-model="publicParam.imei"
                :disabled="lockedProps.includes('imei')"
                placeholder="IMEI"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.productCode"
                :disabled="lockedProps.includes('productCode')"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.repairCarCode"
                :disabled="lockedProps.includes('repairCarCode')"
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
                    v-model="publicParam.status"
                    :disabled="lockedProps.includes('status')"
                    type="maintenanceBillStatus"
                    placeholder="状态"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <el-input
                    v-model="publicParam.supplierName"
                    :disabled="lockedProps.includes('supplierName')"
                    placeholder="供应商"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="生成日期">
                <el-date-picker
                    v-model="publicParam.buildDate"
                    :disabled="lockedProps.includes('buildDate')"
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
                    v-model="publicParam.confirmationUserName"
                    :disabled="lockedProps.includes('confirmationUserName')"
                    placeholder="确认人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="确认时间">
                <el-date-picker
                    v-model="publicParam.confirmationTime"
                    :disabled="lockedProps.includes('confirmationTime')"
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
                ref="TableComponent"
                v-bind="tableData"
                :options="tableOptions"
                :selected-list="selectList"
                :page-index.sync="publicParam.pageIndex"
                :page-size.sync="publicParam.pageSize"
                @refreshList="handleRefreshList"
                @handleCurrentChange="handleCurrentChange"
                @handleSelectionChange="handleSelectionChange"
                @not-selected-click="handleNotSelectedClick"
            />
        </template>
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // 方法
    import enums from '@/utils/enum'
    // API
    import maintenanceBillApi from '@/api/operationsManagement/maintenanceBill'

    export default {
        name: 'People',
        components: {
        },
        mixins: [mixin],
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
                            dialogType: 'maintenanceBill'
                        },
                        {
                            type: 'status',
                            enums: enums.maintenanceBillStatus,
                            prop: 'status',
                            label: '状态',
                            width: 100
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 210
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            width: 220
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
                    ]
                },
                defaultParam: {
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.loading = true
                try {
                    var res
                    if (this.customRequest) {
                        res = await this.customRequest(this.publicParam)
                    } else {
                        res = await maintenanceBillApi.getList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {
                    console.log(err)
                }
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
