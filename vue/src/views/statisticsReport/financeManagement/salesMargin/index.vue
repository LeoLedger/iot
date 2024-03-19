<!--
* @description  销售毛利
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
            <el-button
                v-waves
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.projectName"
                placeholder="项目名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productCode"
                placeholder="产品名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-date-picker
                v-model="searchParam.dateList"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                class="filter-item"
                style="width: 260px"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="客户名称">
                <el-input
                    v-model="searchParam.customerName"
                    placeholder="客户名称"
                    size="mini"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
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
    import rigorous from '@/utils/rigorous'
    // API
    import salesMarginApi from '@/api/statisticsReport/salesMargin'
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
                            label: '客户',
                            prop: 'customerName',
                            width: 200,
                            isClick: true,
                            dialogType: 'customer',
                            idKey: 'customerId'
                        },
                        {
                            prop: 'projectName',
                            label: '运营项目',
                            minWidth: 200,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'productCode',
                            label: '产品名称',
                            minWidth: 140,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            label: '销售收入',
                            align: 'center',
                            children: [
                                {
                                    type: 'money',
                                    prop: 'salesIncome',
                                    label: '销售毛利',
                                    digit: 4,
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'serviceIncome',
                                    label: '服务收入',
                                    digit: 4,
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'simIncome',
                                    label: '流量续费收入',
                                    digit: 4,
                                    width: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'extendIncome',
                                    label: '延保卡/质保费',
                                    digit: 4,
                                    width: 140
                                },
                                {
                                    type: 'money',
                                    prop: 'repairIncome',
                                    label: '维修费/移机费/安装费',
                                    digit: 4,
                                    width: 160
                                },
                                {
                                    type: 'money',
                                    prop: '_incomeTotal',
                                    label: '收入合计',
                                    digit: 4,
                                    width: 140
                                }
                            ]
                        },
                        {
                            label: '销售成本',
                            align: 'center',
                            children: [
                                {
                                    type: 'money',
                                    prop: 'salesCost',
                                    label: '设备成本',
                                    digit: 4,
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'serviceCost',
                                    label: '服务成本',
                                    digit: 4,
                                    width: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'simCost',
                                    label: '流量续费成本',
                                    digit: 4,
                                    width: 130
                                },
                                {
                                    type: 'money',
                                    prop: 'extendCost',
                                    label: '延保卡/质保费',
                                    digit: 4,
                                    width: 140
                                },
                                {
                                    type: 'money',
                                    prop: 'repairCost',
                                    label: '维修费/移机费/安装费',
                                    digit: 4,
                                    width: 160
                                },
                                {
                                    type: 'money',
                                    prop: '_costTotal',
                                    label: '成本合计',
                                    digit: 4,
                                    width: 140
                                }
                            ]
                        },
                        {
                            label: '销售毛利',
                            align: 'center',
                            children: [
                                {
                                    type: 'money',
                                    prop: '_salesMargin',
                                    label: '设备销售毛利',
                                    digit: 4,
                                    width: 120
                                },
                                {
                                    type: 'money',
                                    prop: '_serviceMargin',
                                    label: '服务费毛利',
                                    digit: 4,
                                    width: 120
                                },
                                {
                                    type: 'money',
                                    prop: '_simMargin',
                                    label: '流量续费毛利',
                                    digit: 4,
                                    width: 130
                                },
                                {
                                    type: 'money',
                                    prop: '_extendMargin',
                                    label: '延保卡/质保费',
                                    digit: 4,
                                    width: 140
                                },
                                {
                                    type: 'money',
                                    prop: '_repairMargin',
                                    label: '维修费/移机费/安装费',
                                    digit: 4,
                                    width: 160
                                },
                                {
                                    type: 'money',
                                    prop: '_marginTotal',
                                    label: '毛利合计',
                                    digit: 4,
                                    width: 140
                                }
                            ]
                        },
                        {
                            prop: 'projectManagerUserName',
                            label: '销售员',
                            width: 100
                        }
                    ],
                    options: {
                        stripe: true,
                        loading: false,
                        showIndex: true
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
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
                var res = await salesMarginApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(item => {
                    // 成本
                    item._costTotal = rigorous.floatAdd(item.salesCost, item.serviceCost, item.simCost, item.extendCost, item.repairCost)
                    // 销售
                    item._incomeTotal = rigorous.floatAdd(item.salesIncome, item.serviceIncome, item.simIncome, item.extendIncome, item.repairIncome)
                    // 毛利
                    item._salesMargin = rigorous.floatSub(item.salesIncome, item.salesCost)
                    item._serviceMargin = rigorous.floatSub(item.serviceIncome, item.serviceCost)
                    item._simMargin = rigorous.floatSub(item.simIncome, item.simCost)
                    item._extendMargin = rigorous.floatSub(item.extendIncome, item.extendCost)
                    item._repairMargin = rigorous.floatSub(item.repairIncome, item.repairCost)
                    item._marginTotal = rigorous.floatAdd(item._salesMargin, item._serviceMargin, item._simMargin, item._extendMargin, item._repairMargin)

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
                salesMarginApi.export(data)
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
