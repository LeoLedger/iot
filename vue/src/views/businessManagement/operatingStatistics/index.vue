<!--
* @description  经营统计
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
    import operatingStatisticsApi from '@/api/businessManagement/operatingStatistics'
    // 组件
    export default {
        name: 'OperatingStatistics',
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
                            prop: 'projectCode',
                            label: '项目编号',
                            minWidth: 155
                        },
                        {
                            label: '项目名称',
                            prop: 'projectName',
                            minWidth: 170
                        },
                        {
                            label: '收入确认月份',
                            prop: 'carryOverTime',
                            minWidth: 170
                        },
                        {
                            label: '当期计提管理费用',
                            prop: 'withdrawingFee',
                            minWidth: 170,
                            type: 'money'
                        },
                        {
                            prop: 'depositIncome',
                            label: '收款/押金',
                            width: 120,
                            type: 'money'
                        },
                        {
                            prop: 'servicesIncome',
                            label: '服务费收入',
                            width: 100,
                            type: 'money'
                        },
                        {
                            label: '设备收入',
                            prop: 'salesIncome',
                            width: 120,
                            type: 'money'
                        },
                        {
                            prop: 'installIncome',
                            label: '安装费收入',
                            minWidth: 155,
                            type: 'money'
                        },
                        {
                            prop: 'operatingIncome',
                            label: '计入事业部收入',
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
                            prop: 'purchaseCost',
                            label: '设备采购成本',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'standbyCost',
                            label: '备用设备成本',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'installationCost',
                            label: '安装费成本',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'trafficCost',
                            label: '流量成本',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'maintenanceCost',
                            label: '维保费成本',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'repairCost',
                            label: '维修成本',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'totalCost',
                            label: '成本合计',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'totalTax',
                            label: '税费合计',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'grossProfit',
                            label: '毛利',
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
                var res = await operatingStatisticsApi.getList({
                    ...this.searchParam
                })
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
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
                operatingStatisticsApi.export(data)
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
