<!--
* @description  销售出库单
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
                start-placeholder="出库单审核通过开始日期"
                end-placeholder="出库单审核通过结束日期"
                clearable
            />
           <el-date-picker
                v-model="searchParam.submitTimeList"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="出库单提交开始日期"
                end-placeholder="出库单审提交结束日期"
                clearable
            />
            <el-select v-model="searchParam.approvalStatus" placeholder="审核状态" clearable>
                <el-option v-for="(item, index) in approvalStatusEnum" :key="index" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="searchParam.hasAmount" placeholder="合同总金额是否为零" clearable>
                <el-option v-for="(item, index) in hasAmountEnum" :key="index" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="searchParam.outType" placeholder="新旧设备" clearable>
                <el-option v-for="(item, index) in outTypeEnum" :key="index" :label="item.label" :value="item.value" />
            </el-select>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
            />
        </template>
        <Approval
            v-if="approvalDialogVisible"
            :data-id="activeRowId"
            :row-data="activeRowData"
            :visible.sync="approvalDialogVisible"
            :only-show="!canHandle"
            @update="getList"
        />
    </layout-template>
</template>
<script>
    // 工具
    // import mixin from '@/views/businessDocuments/components/mixin.js'
    import mixin from './mixin.js'
    // API
    import financialStatements from '@/api/statisticsReport/financialStatements.js'
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 组件
    import Approval from '@/views/businessDocuments/components/StorageOut/components/Approval.vue'

    export default {
        components: {
            Approval
        },
        mixins: [mixin],
        data() {
            let myDate = new Date()
            let month = myDate.getMonth() + 1
            month = month < 10 ? '0' + month : month // 格式化月份，补0
            let day = myDate.getDate()
            day = day < 10 ? '0' + day : day
            let beginDate = myDate.getFullYear().toString() + '-' + month + '-01 00:00:00' // 月初
            let endDate = myDate.getFullYear().toString() + '-' + month + '-' + day + ' 23:59:59'
            return {
                approvalStatusEnum: [
                    {
                        label: '审批中',
                        value: 0
                    },
                    {
                        label: '已通过',
                        value: 3
                    },
                    {
                        label: '全部',
                        value: null
                    }
                ],
                hasAmountEnum: [
                    {
                        label: '否',
                        value: 1
                    },
                    {
                        label: '是',
                        value: 0
                    }
                ],
                outTypeEnum: [
                    {
                        label: '全新出库',
                        value: 0
                    },
                    {
                        label: '旧设备出库',
                        value: 1
                    }
                ],
                dataList: [],
                guidIdKey: 'contractId',
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'f0',
                            label: '库存组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f1',
                            label: '库存组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f1_2',
                            label: '新旧设备类型',
                            minWidth: 120
                        },
                        {
                            prop: 'f2',
                            label: '单据编码',
                            minWidth: 165,
                            disabled: true,
                            isClick: true,
                            onClick: row => {
                                this.guidIdKey = 'deviceOutId'
                                this.handleApproval(row)
                            }
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
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            idKey: 'contractId',
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'contractAmount',
                            label: '合同总金额（元）',
                            minWidth: 120
                        },
                        {
                            prop: 'f8',
                            label: '销售合同名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f9',
                            label: '业务日期',
                            minWidth: 120
                        },
                        {
                            prop: 'f10',
                            label: '项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f11',
                            label: '项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f12',
                            label: '标段名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f13',
                            label: '标段编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f14',
                            label: '仓库名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f15',
                            label: '仓库编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f16',
                            label: '客户名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f17',
                            label: '客户编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f18',
                            label: '甲方名称名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f19',
                            label: '甲方名称编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f20',
                            label: '结算方式名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f21',
                            label: '结算方式编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f22',
                            label: '出入库类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f23',
                            label: '出入库类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f24',
                            label: '单据方向',
                            minWidth: 120
                        },
                        {
                            prop: 'f25',
                            label: '结算组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f26',
                            label: '结算组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f27',
                            label: '销售组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f28',
                            label: '销售组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f29',
                            label: '联系人',
                            minWidth: 120
                        },
                        {
                            prop: 'f30',
                            label: '联系电话',
                            minWidth: 120
                        },
                        {
                            prop: 'f31',
                            label: '销售部门名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f32',
                            label: '销售部门编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f33',
                            label: '送货地址',
                            minWidth: 120
                        },
                        {
                            prop: 'f34',
                            label: '备注',
                            minWidth: 120
                        },
                        {
                            prop: 'f35',
                            label: '业务类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f36',
                            label: '业务类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f37',
                            label: '产品类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f38',
                            label: '产品类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f39',
                            label: '项目组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f40',
                            label: '项目组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f41',
                            label: '核算组织名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f42',
                            label: '核算组织编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f43',
                            label: '核算项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f44',
                            label: '核算项目编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f45',
                            label: '项目名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f46',
                            label: '项目编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f47',
                            label: '业务类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f48',
                            label: '业务类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f49',
                            label: '产品类型名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f50',
                            label: '产品类型编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f51',
                            label: '企企物料编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f52',
                            label: '物料名称',
                            minWidth: 120
                        },
                        {
                            prop: 'productCode',
                            label: '环卫系统产品编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f53',
                            label: '企企规格型号',
                            minWidth: 120
                        },
                        {
                            prop: 'f54',
                            label: '企企物料单位',
                            minWidth: 120
                        },
                        {
                            prop: 'f55',
                            label: '销售单位编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f56',
                            label: '销售数量',
                            minWidth: 120
                        },
                        {
                            prop: 'f57',
                            label: '无税单价',
                            minWidth: 120
                        },
                        {
                            prop: 'f58',
                            label: '无税金额',
                            minWidth: 120
                        },
                        {
                            prop: 'f59',
                            label: '仓库名称-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f60',
                            label: '仓库编码-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f61',
                            label: '税率',
                            minWidth: 120
                        },
                        {
                            prop: 'f62',
                            label: '备注-子表',
                            minWidth: 120
                        },
                        {
                            prop: 'f63',
                            label: '存货成本单价',
                            minWidth: 120
                        },
                        {
                            prop: 'f64',
                            label: '存货成本金额',
                            minWidth: 120
                        },
                        {
                            prop: 'f65',
                            label: '业务的类型名称',
                            minWidth: 120
                        },
                        {
                            prop: 'f66',
                            label: '业务的类型编码',
                            minWidth: 120
                        },
                        {
                            prop: 'f67',
                            label: '成本单价',
                            minWidth: 120
                        },
                        {
                            prop: 'f68',
                            label: '成本金额',
                            minWidth: 120
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                requestApi: storageOutApi,
                searchParam: {
                    dateList: [beginDate, endDate],
                    beginDate: beginDate,
                    endDate: endDate,
                    submitTimeStart: null,
                    submitTimeEnd: null,
                    pageSize: 15,
                    pageIndex: 1,
                    approvalStatus: null,
                    hasAmount: null
                }
            }
        },
        computed: {
        },
        watch: {
            'searchParam.pageSize'() {
                this.getListHere()
            },
            'searchParam.pageIndex'() {
                this.getListHere()
            },
            'searchParam.dateList'(val) {
                if (val) {
                    this.searchParam.beginDate = val[0]
                    this.searchParam.endDate = val[1]
                } else {
                    this.searchParam.beginDate = null
                    this.searchParam.endDate = null
                }
                this.getListHere()
            },
            'searchParam.submitTimeList'(val) {
                if (val) {
                    this.searchParam.submitTimeStart = val[0]
                    this.searchParam.submitTimeEnd = val[1]
                } else {
                    this.searchParam.submitTimeStart = null
                    this.searchParam.submitTimeEnd = null
                }
                this.getListHere()
            },
            'searchParam.approvalStatus'() {
                this.getListHere()
            },
            'searchParam.hasAmount'() {
                this.getListHere()
            },
            'searchParam.outType'() {
                this.getListHere()
            }
        },
        mounted() {
            this.getListHere()
        },
        methods: {
            // 请求列表数据
            async getListHere() {
                this.tableData.options.loading = true
                var res = await financialStatements.pageSaleOutMenu({
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
                    this.getListHere()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                financialStatements.pageSaleOutMenuExport(data)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
