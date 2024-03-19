<!--
* @description  租赁设备待分摊库存表
* @fileName index.vue
* @author 望浩然
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
                v-model="searchParam.customerName"
                placeholder="客户名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-date-picker
                v-model="searchParam.queryTime"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="结算起始"
                end-placeholder="结算截止"
                clearable
                style="width: 300px"
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
    </layout-template>
</template>
<script>
  // 工具
  // API
    import mainApi from '@/api/statisticsReport/deviceCostShare'
    import { getPriceFormat, getDayOfTheMonth } from '@/utils'
    import moment from 'moment'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    queryTime: []
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'projectName',
                            label: '合同项目',
                            minWidth: 180,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'projectCode',
                            label: '项目编号',
                            minWidth: 120
                        },
                        {
                            prop: 'customerName',
                            label: '客户名称',
                            minWidth: 120
                        },
                        // {
                        //     prop: 'outTime',
                        //     label: '出库时间',
                        //     minWidth: 120,
                        //     type: 'date'
                        // },
                        {
                            prop: 'serviceStartTime',
                            label: '服务期起',
                            minWidth: 120,
                            type: 'date'
                        },
                        {
                            prop: 'serviceEndTime',
                            label: '服务期止',
                            minWidth: 120,
                            type: 'date'
                        },
                        {
                            prop: 'costCycle',
                            label: '设备分摊期限',
                            minWidth: 120,
                            align: 'right'
                        },
                        {
                            prop: 'contractCycle',
                            label: '合同分摊期限',
                            minWidth: 120,
                            align: 'right'
                        },
                        {
                            prop: 'productType',
                            label: '设备类型',
                            minWidth: 120
                        },
                        {
                            prop: 'productCode',
                            label: '型号',
                            minWidth: 120
                        },
                        {
                            prop: 'salesTypeDesc',
                            label: '销售类型',
                            minWidth: 120
                        },
                        {
                            prop: 'count',
                            label: '设备应摊-数量',
                            minWidth: 120,
                            align: 'right'
                        },
                        {
                            prop: 'purchaseCost',
                            label: '设备应摊-单位服务费(不含税)',
                            minWidth: 180,
                            type: 'money'
                        },
                        {
                            prop: 'shouldShareAmount',
                            label: '设备应摊-应分摊金额',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'monthlyAmount',
                            label: '设备应摊-月摊金额',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'useShouldShareAmount',
                            label: '在用待摊-合同期内应摊',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'useAlreadyShareAmount',
                            label: '在用待摊-已摊销金额',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'useNoShareAmount',
                            label: '在用待摊-未摊金额',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'noUseShouldShareAmount',
                            label: '未用待摊-合同到期应摊未摊金额',
                            minWidth: 200,
                            type: 'money'
                        },
                        {
                            prop: 'noUseAreadyShareAmount',
                            label: '未用待摊-已摊销金额',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'noUseNoShareAmount',
                            label: '未用待摊-未摊金额',
                            minWidth: 160,
                            type: 'money'
                        },
                        {
                            prop: 'costCenterName',
                            label: '摊销项目',
                            minWidth: 120
                        },
                        {
                            prop: 'description',
                            label: '说明',
                            minWidth: 120
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
                var res = await mainApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records
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
                mainApi.export(data)
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
