<!--
* @description  押金收款单
* @fileName index.vue
* @author
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
            <el-date-picker
                v-model="searchParam.dateList"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="合同签订开始日期"
                end-placeholder="合同签订结束日期"
                clearable
            />
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
            />
        </template>
    </layout-template>
</template>
<script>
    // 工具
    // API
    import financialStatements from '@/api/statisticsReport/financialStatements.js'
    // 组件

    export default {
        components: {
        },
        data() {
            let myDate = new Date()
            let month = myDate.getMonth() + 1
            month = month < 10 ? '0' + month : month // 格式化月份，补0
            let day = myDate.getDate()
            day = day < 10 ? '0' + day : day
            let beginDate = myDate.getFullYear().toString() + '-' + month + '-01 00:00:00' // 月初
            let endDate = myDate.getFullYear().toString() + '-' + month + '-' + day + ' 23:59:59'
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'f0',
                            label: '财务组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f1',
                            label: '财务组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f2',
                            label: '单据编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f3',
                            label: '单据名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f4',
                            label: '单据编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f5',
                            label: '单据类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f6',
                            label: '单据类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f7',
                            label: '销售合同编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f8',
                            label: '合同名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f9',
                            label: '销售合同项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f10',
                            label: '销售合同项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f11',
                            label: '业务日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f12',
                            label: '往来单位类型',
                            minWidth: 120
                        },
                        {
                            prop: 'f13',
                            label: '往来单位名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f14',
                            label: '往来单位编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f15',
                            label: '结算单位名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f16',
                            label: '结算单位编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f17',
                            label: '结算方式名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f18',
                            label: '结算方式编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f19',
                            label: '账户名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f20',
                            label: '账户编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f21',
                            label: '对方银行账号',
                            minWidth: 120
                        },
                        {
                            prop: 'f22',
                            label: '业务员姓名',
                            minWidth: 120
                        },
                        {
                            prop: 'f23',
                            label: '业务员编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f24',
                            label: '部门名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f25',
                            label: '部门编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f26',
                            label: '项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f27',
                            label: '项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f28',
                            label: '业务类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f29',
                            label: '业务类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f30',
                            label: '销售组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f31',
                            label: '销售组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f32',
                            label: '采购组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f33',
                            label: '采购组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f34',
                            label: '项目组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f35',
                            label: '项目组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f36',
                            label: '产品类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f37',
                            label: '产品类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f38',
                            label: '备注',
                            minWidth: 120
                        },
                        {
                            prop: 'f39',
                            label: '项目名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f40',
                            label: '项目编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f41',
                            label: '业务类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f42',
                            label: '业务类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f43',
                            label: '产品类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f44',
                            label: '产品类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f45',
                            label: '款项类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f46',
                            label: '款项类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f47',
                            label: '款项性质',
                            minWidth: 120
                        },
                        {
                            prop: 'f48',
                            label: '收入名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f49',
                            label: '收入编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f50',
                            label: '收款金额',
                            minWidth: 120
                        },
                        {
                            prop: 'f51',
                            label: '预计还回时间',
                            minWidth: 120
                        },
                        {
                            prop: 'f52',
                            label: '备注-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f53',
                            label: '项目组织名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f54',
                            label: '项目组织编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f55',
                            label: '调整后收入名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f56',
                            label: '调整后收入编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f57',
                            label: '已收金额',
                            minWidth: 120
                        },
                        {
                            prop: 'f58',
                            label: '存货型号名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f59',
                            label: '存货型号编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f60',
                            label: '是否质保金名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f61',
                            label: '是否质保金编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f62',
                            label: '项目是否已验收名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f63',
                            label: '项目是否已验收编码',
                            minWidth: 120
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    dateList: [beginDate, endDate],
                    beginDate: beginDate,
                    endDate: endDate,
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
            },
            'searchParam.dateList'(val) {
                if (val) {
                    this.searchParam.beginDate = val[0]
                    this.searchParam.endDate = val[1]
                } else {
                    this.searchParam.beginDate = null
                    this.searchParam.endDate = null
                }
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
                var res = await financialStatements.pageContractCashPledgeReceipt({
                    ...this.searchParam
                })
                this.dataList = res.data.records
                this.tableData.total = res.data.total
                this.tableData.list = res.data.records
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
                financialStatements.pageContractCashPledgeReceiptExport(data)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
