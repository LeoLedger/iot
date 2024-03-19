<!--
* @description  财务成本结转-产品维度
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
                v-model="searchParam.productCode"
                size="mini"
                placeholder="产品编号"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productName"
                size="mini"
                placeholder="产品名称"
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
            :params="listConfigDialog.params"
            :visible.sync="listConfigDialog.visible"
        />
    </layout-filter>
</template>
<script>
  // 工具
  // API
    import mainApi from '@/api/statisticsReport/execute'
    import productApi from '@/api/purchase/product'
    import { getPriceFormat } from '@/utils'
    // 组件
    import columns1 from './productColumns/B16C3151'
    export default {
        components: {
        },
        data() {
            const columnClick = (row, prop) => {
                let params = {}
                let _method = mainApi.getProductDetails
                if (prop === 'thisTransferAmount') {
                    params = {
                        yearAndMonth: this.searchParam.yearAndMonth,
                        costType: 6,
                        productId: row.productId
                    }
                } else if (prop === 'thisScrapAmount') {
                    params = {
                        yearAndMonth: this.searchParam.yearAndMonth,
                        description: '报废',
                        productId: row.productId
                    }
                } else if (prop === 'cumulativeTransferAmount') {
                    params = {
                        costType: 6,
                        productId: row.productId
                    }
                } else {
                    return
                }
                this.listConfigDialog = {
                    title: '设备详情',
                    method: _method,
                    table: {
                        columns: [
                            {
                                label: '产品编号',
                                prop: 'productCode',
                                minWidth: 100,
                                sortable: false
                            },
                            {
                                label: '产品名称',
                                prop: 'productName',
                                minWidth: 200,
                                sortable: false
                            },
                            {
                                label: 'IMEI',
                                prop: 'imei',
                                minWidth: 150,
                                dbProp: 'c_imei',
                                sortable: 'custom',
                                isClick: true,
                                dialogType: 'device',
                                idKey: 'imei'
                            },
                            {
                                label: 'SIM卡号',
                                prop: 'sim',
                                minWidth: 155,
                                dbProp: 'c_sim',
                                sortable: 'custom',
                                isCopy: true
                            },
                            {
                                label: '合同编号',
                                prop: 'contractCode',
                                minWidth: 100,
                                sortable: false
                            },
                            {
                                label: '结转日期',
                                prop: 'carryOverTime',
                                width: 150,
                                type: 'date'
                            },
                            {
                                label: '结转类型',
                                prop: 'type',
                                width: 100,
                                type: 'dict',
                                dictType: 'accountDetailType'
                            },
                            {
                                label: '费用类型',
                                prop: 'feeType',
                                width: 100,
                                type: 'dict',
                                dictType: 'accountCostType'
                            },
                            {
                                label: '结转金额',
                                prop: 'amount',
                                width: 100,
                                type: 'money',
                                digit: 4
                            },
                            {
                                label: '项目/成本中心',
                                prop: 'projectName',
                                width: 200
                            },
                            {
                                label: '企业',
                                prop: 'customerName',
                                width: 200
                            },
                            {
                                label: '标段',
                                prop: 'sectionName',
                                width: 200
                            }
                        ]
                    },
                    params: params,
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
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'productName',
                            label: '产品编号',
                            minWidth: 120,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'originalAmount',
                            label: '原始成本',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'thisInitAmount',
                            label: '期初成本',
                            minWidth: 120,
                            type: 'money'
                        },
                        {
                            prop: 'thisNewAmount',
                            label: '本期新增',
                            minWidth: 120,
                            isClick: true,
                            onClick: (val) => this.showNewList(val),
                            type: 'money'
                        },
                        {
                            prop: 'thisTransferAmount',
                            label: '本期结转',
                            minWidth: 120,
                            isClick: true,
                            onClick: (val) => columnClick(val, 'thisTransferAmount'),
                            type: 'money'
                        },
                        {
                            prop: 'thisScrapAmount',
                            label: '本期报废',
                            minWidth: 120,
                            isClick: true,
                            onClick: (val) => columnClick(val, 'thisScrapAmount'),
                            type: 'money'
                        },
                        {
                            prop: 'cumulativeTransferAmount',
                            label: '累积结转',
                            minWidth: 120,
                            isClick: true,
                            onClick: (val) => columnClick(val, 'cumulativeTransferAmount'),
                            type: 'money'
                        },
                        {
                            prop: 'unTransferAmount',
                            label: '待结转',
                            minWidth: 120,
                            type: 'money'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true,
                        showSummary: true,
                        showPagination: true,
                        summaryMethod: this.handleSummary
                    }
                },
                summaryData: {}
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
            const month = (new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)
            this.searchParam.yearAndMonth = new Date().getFullYear() + '-' + month
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await mainApi.getProductList(
                    {
                        ...this.searchParam
                })
                this.summaryData = res.data
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
                mainApi.exportProduct(data)
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
                        sums[index] = getPriceFormat(this.summaryData.sumOriginalAmount) + ' 元'
                    }
                    if (index === 4) {
                        sums[index] = getPriceFormat(this.summaryData.sumThisInitAmount) + ' 元'
                    }
                    if (index === 5) {
                        sums[index] = getPriceFormat(this.summaryData.sumThisNewAmount) + ' 元'
                    }
                    if (index === 6) {
                        sums[index] = getPriceFormat(this.summaryData.sumThisTransferAmount) + ' 元'
                    }
                    if (index === 7) {
                        sums[index] = getPriceFormat(this.summaryData.sumThisScrapAmount) + ' 元'
                    }
                    if (index === 8) {
                        sums[index] = getPriceFormat(this.summaryData.sumCumulativeTransferAmount) + ' 元'
                    }
                    if (index === 9) {
                        sums[index] = getPriceFormat(this.summaryData.sumUnTransferAmount) + ' 元'
                    }
                })
                return sums
            },
            async showNewList(row) {
                // 请求产品详情
                const res = await productApi.detail(row.productId)
                if (res.success) {
                    if (res.data.categoryId) {
                        let columns = []
                        if (res.data.categoryId === 'B16C3151-11D2-4364-8F45-63EFFFFCF424') columns = columns1
                        if (res.data.categoryId === 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7') columns = columns1
                        if (res.data.categoryId === 'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100') columns = columns1
                        this.listConfigDialog = {
                            visible: true,
                            title: '本期新增设备详情',
                            method: mainApi.getNewDetails,
                            table: {
                                columns: columns
                            },
                            params: {
                                yearAndMonth: this.searchParam.yearAndMonth,
                                productId: row.productId
                            }
                        }
                    } else {
                        this.$message.warning('未知产品类型')
                    }
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
