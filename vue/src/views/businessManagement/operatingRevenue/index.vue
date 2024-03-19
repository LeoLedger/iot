<!--
* @description  经营管理部收入
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.incomeAccounting.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <!-- <el-button
                v-waves
                v-if="checkFeature(['ty.iot.incomeAccounting.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button> -->
        </template>
        <template slot="filter">
            <!-- <el-input
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
                placeholder="客户名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            /> -->
        </template>
        <template slot="filter-popup"/>
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
    import operatingRevenueApi from '@/api/businessManagement/operatingRevenue'
    // 组件
    export default {
        name: 'ProjectCollection',
        components: {

        },
        data() {
            return {
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                // accountDetailDialog
                // 核算详情窗口
                accountDetailDialog: {
                    visible: false,
                    dataId: null,
                    extendParams: {}
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'projectName',
                            label: '运营项目',
                            minWidth: 155
                        },
                        {
                            label: '成本中心',
                            prop: 'costCenterName',
                            minWidth: 170
                        },
                        {
                            label: '执行状态',
                            prop: 'contractStatus',
                            minWidth: 170
                        },
                        {
                            label: '合同起始时间',
                            prop: 'startDate',
                            minWidth: 170
                        },
                        {
                            prop: 'endDate',
                            label: '合同截止时间',
                            width: 120
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            width: 100
                        },
                        {
                            label: '甲方',
                            prop: 'customerName',
                            width: 120
                        },
                        {
                            prop: 'productName',
                            label: '设备类型',
                            minWidth: 155
                        },
                        {
                            prop: 'salesType',
                            label: '成交模式',
                            minWidth: 200
                        },
                        {
                            prop: 'productTypeName',
                            label: '型号',
                            minWidth: 200
                        },
                        {
                            prop: 'count',
                            label: '数量',
                            minWidth: 200
                        },
                        {
                            prop: 'unitPriceDeposit',
                            label: '押金',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceSales',
                            label: '销售单价',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceMove',
                            label: '单位迁移费',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceInstall',
                            label: '单位安装费',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceDepositTotal',
                            label: '押金总额',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceSalesTotal',
                            label: '销售总额',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceMoveTotal',
                            label: '迁移费',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'unitPriceInstallTotal',
                            label: '安装费总额',
                            minWidth: 200,
                            type: 'money'
                        },
                        // {
                        //     prop: 'xxxx',
                        //     label: '合同总金额',
                        //     minWidth: 200
                        // },
                        {
                            prop: 'outCount',
                            label: '出库数量',
                            minWidth: 200
                        },
                        {
                            prop: 'outWarehouseTime',
                            label: '出库日期',
                            minWidth: 200
                        },
                        {
                            prop: 'carryOverTime',
                            label: '收入确认时间',
                            minWidth: 200
                        },
                        {
                            prop: 'salesIncome',
                            label: '产品销售收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'servicesIncome',
                            label: '服务费收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'depositIncome',
                            label: '扣除押金收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'installIncome',
                            label: '安装费收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'repairIncome',
                            label: '维修费收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'moveIncome',
                            label: '迁装费收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'totalIncome',
                            label: '收入合计',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'withdrawingFee',
                            label: '计提管理费',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'operatingIncome',
                            label: '经营收入',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'vatvalue',
                            label: '销项税额',
                            minWidth: 200,
                            type: 'money'
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
                var res = await operatingRevenueApi.getList({
                    ...this.searchParam
                })
                if (res.success) {
                    this.tableData.list = res.data
                    this.tableData.total = res.data.length
                }
                this.tableData.options.loading = false
            },
            // 核算详情
            showAccountDetail(row) {
                this.accountDetailDialog = {
                    visible: true,
                    dataId: row.guidId
                }
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
                operatingRevenueApi.export(data)
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
