<!--
* @description  财务成本结转-项目维度
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <layout-filter
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
            <el-date-picker
                v-model="searchParam.yearAndMonth"
                type="month"
                format="yyyy-MM"
                value-format="yyyy-MM"
                clearable
                style="width: 150px"
                class="filter-item"
                placeholder="选择年月"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.projectName"
                size="mini"
                placeholder="项目名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.customerName"
                size="mini"
                placeholder="客户名称"
                clearable
                class="filter-item"
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
        <ListConfigDialog
            v-if="listConfigDialog.visible"
            v-bind="listConfigDialog"
            :visible.sync="listConfigDialog.visible"
        />
    </layout-filter>
</template>
<script>
  // 工具
  // API
    import mainApi from '@/api/statisticsReport/execute'
    import accountCostApi from '@/api/businessAccounting/accountingCost'
    import { getPriceFormat } from '@/utils'
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        data() {
            const columnClick = (row) => {
                this.listConfigDialog = {
                    title: '项目结转成本明细',
                    method: accountCostApi.getList,
                    table: {
                        columns: [
                            {
                                prop: 'code',
                                label: '编号',
                                width: 140
                            },
                            {
                                label: '成本中心',
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
                                type: 'dict',
                                dictType: 'accountCostType',
                                prop: 'costType',
                                label: '费用类型',
                                width: 120,
                                disabled: true
                            },
                            {
                                prop: 'amount',
                                label: '核算金额',
                                width: 100,
                                type: 'money',
                                digit: 4,
                                sortable: 'custom',
                                dbProp: 'tac.c_amount'
                            },
                            {
                                type: 'date',
                                prop: 'carryOverTime',
                                label: '结转时间',
                                width: 150,
                                format: 'YYYY-MM-DD HH:mm:ss',
                                sortable: 'custom',
                                dbProp: 'tac.c_carry_over_time'
                            },
                            {
                                prop: 'billCode',
                                label: '关联单据',
                                minWidth: 155,
                                disabled: true,
                                idKey: 'billId',
                                isClick: ({ row }) => enums.accountBillType.findIndex(v => v.value === row.billType) > -1,
                                dialogType: ({ row }) => enums.accountBillType.find(v => v.value === row.billType).dialogType
                            },
                            {
                                prop: 'description',
                                label: '结转说明',
                                minWidth: 200
                            }
                        ]
                    },
                    params: {
                        yearAndMonth: this.searchParam.yearAndMonth,
                        projectId: row.projectId,
                        costType: 6,
                        customerId: row.customerId
                    },
                    visible: true
                }
            }
            return {
                listConfigDialog: {
                    visible: false
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    yearAndMonth: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 120,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'customerName',
                            label: '客户',
                            minWidth: 120,
                            idKey: 'customerId',
                            isClick: true,
                            dialogType: 'customer'
                        },
                        {
                            prop: 'amount',
                            label: '已结转成本',
                            minWidth: 120,
                            isClick: true,
                            onClick: columnClick
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        showPagination: true,
                        summaryMethod: this.handleSummary
                    }
                },
                summaryData: {}
            }
        },
        computed: {},
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            const month = (new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)
            this.searchParam.yearAndMonth = new Date().getFullYear() + '-' + month
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await mainApi.getProjectList({
                    ...this.searchParam
                })
                this.summaryData = { amount: res.data.sumAmount }
                this.tableData.list = res.data.data.records
                this.tableData.total = res.data.data.total
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
                mainApi.exportProject(data)
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
                    if (index === 3) {
                        sums[index] = getPriceFormat(this.summaryData.amount) + ' 元'
                    }
                })
                return sums
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
