<!--
* @description  标的明细行
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
    import { filterList } from '@/utils'
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
                            label: '合同编号',
                            minWidth: 120
                        },
                        {
                            prop: 'f3',
                            label: '销售组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f4',
                            label: '销售组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f5',
                            label: '项目组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f6',
                            label: '项目组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f7',
                            label: '合同类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f8',
                            label: '合同类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f9',
                            label: '单据名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f10',
                            label: '单据编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f11',
                            label: '版本号',
                            minWidth: 120
                        },
                        {
                            prop: 'f12',
                            label: '合同签订状态名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f13',
                            label: '合同签订状态编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f14',
                            label: '名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f15',
                            label: '合同类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f16',
                            label: '合同类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f17',
                            label: '合同分类名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f18',
                            label: '合同分类编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f19',
                            label: '所属项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f20',
                            label: '所属项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f21',
                            label: '标段名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f22',
                            label: '标段编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f23',
                            label: '销售经理姓名',
                            minWidth: 120
                        },
                        {
                            prop: 'f24',
                            label: '销售经理编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f25',
                            label: '销售部门名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f26',
                            label: '销售部门编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f27',
                            label: '销售成本中心名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f28',
                            label: '销售成本中心编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f29',
                            label: '客户名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f30',
                            label: '客户编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f31',
                            label: '甲方名称名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f32',
                            label: '甲方名称编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f33',
                            label: '合同签订日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f34',
                            label: '项目经理姓名',
                            minWidth: 120
                        },
                        {
                            prop: 'f35',
                            label: '项目经理编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f36',
                            label: '实施成本中心名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f37',
                            label: '实施成本中心编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f38',
                            label: '合同开始日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f39',
                            label: '合同结束日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f40',
                            label: '立账方式',
                            minWidth: 120
                        },
                        {
                            prop: 'f41',
                            label: '是否虚拟合同',
                            minWidth: 120
                        },
                        {
                            prop: 'f42',
                            label: '是否项目合同',
                            minWidth: 120
                        },
                        {
                            prop: 'f43',
                            label: '有无盖章',
                            minWidth: 120
                        },
                        {
                            prop: 'f44',
                            label: '是否历史设备',
                            minWidth: 120
                        },
                        {
                            prop: 'f45',
                            label: '区域名称',
                            minWidth: 120
                        },

                        {
                            prop: 'f46',
                            label: '区域编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f47',
                            label: '业务类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f48',
                            label: '业务类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f49',
                            label: '产品类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f50',
                            label: '产品类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f51',
                            label: '发票类型',
                            minWidth: 120
                        },
                        {
                            prop: 'f52',
                            label: '备注',
                            minWidth: 120
                        },

                        {
                            prop: 'f53',
                            label: '单价允差值',
                            minWidth: 120
                        },
                        {
                            prop: 'f54',
                            label: '数量允差值',
                            minWidth: 120
                        },
                        {
                            prop: 'f55',
                            label: '管理费',
                            minWidth: 120
                        },
                        {
                            prop: 'f56',
                            label: '合同行号',
                            minWidth: 120
                        },
                        {
                            prop: 'f57',
                            label: '项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f58',
                            label: '项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f59',
                            label: '业务类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f60',
                            label: '业务类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f61',
                            label: '产品类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f62',
                            label: '产品类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f63',
                            label: '物料名称名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f64',
                            label: '物料名称编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f65',
                            label: '设备名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f66',
                            label: '设备编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f67',
                            label: '规格',
                            minWidth: 120
                        },
                        {
                            prop: 'f68',
                            label: '数量',
                            minWidth: 120
                        },
                        {
                            prop: 'f69',
                            label: '含税单价',
                            minWidth: 120
                        },
                        {
                            prop: 'f70',
                            label: '税率',
                            minWidth: 120
                        },
                        {
                            prop: 'f71',
                            label: '税额',
                            minWidth: 120
                        },
                        {
                            prop: 'f72',
                            label: '价税合计',
                            minWidth: 120
                        },
                        {
                            prop: 'f73',
                            label: '押金单价',
                            minWidth: 120
                        },
                        {
                            prop: 'f74',
                            label: '赠品',
                            minWidth: 120
                        },
                        {
                            prop: 'f75',
                            label: '备注-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f76',
                            label: '收入名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f77',
                            label: '收入编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f78',
                            label: '收入确认方式',
                            minWidth: 120
                        },
                        {
                            prop: 'f79',
                            label: '收入确认方案名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f80',
                            label: '收入确认方案编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f81',
                            label: '开始日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f82',
                            label: '结束日期',
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
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
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
                var res = await financialStatements.pageContractTenderDetail({
                    ...this.searchParam
                })
                this.dataList = res.data.records
                this.filterData()
                this.tableData.options.loading = false
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = filterList(this.dataList, this.searchParam, [
                    { name: 'productCode', type: 'string' },
                    { name: 'productName', type: 'string' },
                    { name: 'productType', type: 'same' }
                ])
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                this.tableData.total = list.length
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                    this.getList()
                } else {
                    this.getList()
                    // this.filterData()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                financialStatements.export(data)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
