<!--
* @description  应付账款 - 列表
* @author 望浩然
!-->
<template>
    <div class="section-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.accountsPayable.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.accountsPayable.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <DictSelect
                    v-model="searchParam.completeFlag"
                    type="amountCompleteFlag"
                    placeholder="收款状态"
                    width="150px"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                    @change="handleSearch"
                />
                <el-input
                    v-model="searchParam.code"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="账单编号"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="关联单据">
                    <el-input
                        v-model="searchParam.approvalCode"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="关联单据"/>
                </layout-filter-item>
                <layout-filter-item label="客户/供应商">
                    <el-input
                        v-model="searchParam.payObjectName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="客户/供应商名称"/>
                </layout-filter-item>
                <layout-filter-item label="付款类型">
                    <DictSelect
                        v-model="searchParam.payType"
                        type="payType"
                        placeholder="费用类型"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="生成日期">
                    <el-date-picker
                        v-model="searchParam.generateDate"
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
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                />
            </template>
        </layout-template>
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogVisible"
            v-bind="dialogData"
            :visible.sync="dialogVisible"
        />
        <!-- 付款记录列表弹窗 -->
        <PaidListDialog
            v-if="paidDialog.visible"
            :visible.sync="paidDialog.visible"
            :data-id="paidDialog.dataId"
            :extend-params="paidDialog.extendParams"
        />
        <MaintainListDialog
            v-if="listDialogVisible"
            :visible.sync="listDialogVisible"
            :data-id="listDialogData.dataId"
            :extend-params="listDialogData"
        />
    </div>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    // API
    import billPayApi from '@/api/businessDocuments/billPay'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    import { getPriceFormat } from '@/utils'
    // 组件
    import PaidListDialog from './PaidListDialog'
    import MaintainListDialog from './MaintainListDialog'
    export default {
        components: {
            PaidListDialog,
            MaintainListDialog
        },
        props: {},
        data() {
            const that = this
            return {
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
                // 详情窗口
                dialogData: {},
                dialogVisible: false,
                // 收款记录窗口
                paidDialog: {
                    visible: false,
                    extendParams: {},
                    dataId: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
                        fit: true,
                        loading: false,
                        curRowKey: 'id' // 高亮当前判断的 key
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: false
                    },
                    columns: [
                        {
                            label: '账单编号',
                            prop: 'code',
                            minWidth: 120
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            width: 200,
                            isClick: true,
                            onClick: ($event) => { this.showDetail($event) }
                        },
                        {
                            label: '客户/供应商',
                            prop: 'payObjectName',
                            width: 200
                        },
                        {
                            label: '付款类型',
                            prop: 'payType',
                            width: 120,
                            formatter: (params, formData) => {
                                return (that.getDict('payType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            label: '应付金额(元)',
                            prop: 'amountPay',
                            dbProp: 'c_amount_pay',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '已付金额(元)',
                            prop: 'amountPaid',
                            dbProp: 'c_amount_paid',
                            width: 150,
                            isClick: true,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money',
                            render: (h, { row, column }) => {
                                return <div class='link-text' onClick={() => { this.showPaidList(row) }}>{getPriceFormat(row.amountPaid)}</div>
                            }
                        },
                        {
                            label: '未付金额(元)',
                            prop: 'amountUnpaid',
                            dbProp: 'c_amount_unpaid',
                            width: 150,
                            align: 'right',
                            sortable: 'custom',
                            type: 'money'
                        },
                        {
                            label: '生成日期',
                            prop: 'generateDate',
                            dbProp: 'c_generate_date',
                            width: 150,
                            type: 'date'
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                },
                listDialogVisible: false,
                listDialogData: {
                    dataId: null,
                    approvalIds: null
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
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                this.getList()
            },
            /** 加载数据 */
            // 获取客户列表数据
            async getList() {
                this.tableData.options.loading = true
                const params = {
                    ...this.searchParam
                }
                const res = await billPayApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            /** 事件处理 */
            showPaidList(row) {
                this.paidDialog.extendParams = {
                    billPayId: row.guidId
                }
                this.paidDialog.dataId = row.guidId
                this.paidDialog.visible = true
            },
            // 详情
            showDetail(row) {
                if (row.approvalCode && row.approvalIds) {
                    this.listDialogData.dataId = row.guidId
                    this.listDialogData.approvalIds = row.approvalIds
                    this.listDialogVisible = true
                    return
                }
                const dialogType = enums.payType.find(v => v.value === row.payType).dialogType
                if (!dialogType) {
                    this.$message({ type: 'warning', message: '暂不支持查看本单据详情' })
                }
                this.dialogData = {
                    type: dialogType,
                    dataId: row.approvalId,
                    rowData: row,
                    extendParams: {}
                }
                this.dialogVisible = true
            },
            // 搜索
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                billPayApi.export(this.searchParam)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
