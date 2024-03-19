<!--
* @description 收款信息
* @author yc
!-->
<template>
    <div class="payment-info">
        <div class="tabs-group">
            <div
                v-for="(item, index) in tabsGroupData"
                :key="index"
                :class="{border: item.border, active: tabsGroupActive === index}"
                class="item"
                @click="handleTabsGroupChange(item, index)"
            >
                <div class="value">{{ item.value }}</div>
                <div class="label">{{ item.label }}</div>
            </div>
        </div>
        <div class="body-wrap">
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template slot="button">
                    <el-button
                        v-waves
                        :disabled="!tableData.total"
                        size="mini"
                        class="filter-button"
                        type="warning"
                        icon="el-icon-download"
                        @click="handleExport"
                    >导出</el-button>
                </template>
                <template slot="filter">
                    <el-input
                        v-if="tabsGroupActive === 0"
                        v-model="searchParam.code"
                        size="mini"
                        placeholder="账单编号"
                        clearable
                        class="filter-item"
                        @change="handleFilter"
                    />
                    <el-input
                        v-else-if="tabsGroupActive === 1"
                        v-model="searchParam.recordCode"
                        size="mini"
                        placeholder="收款流水号"
                        clearable
                        class="filter-item"
                        @change="handleFilter"
                    />
                </template>
                <template slot="table">
                    <TableComponent
                        v-bind="tableData"
                        :page-index.sync="publicParam.pageIndex"
                        :page-size.sync="publicParam.pageSize"
                        empty-hide-table
                    >
                        <template v-if="row.invoiceType === 2" slot="操作" slot-scope="{row}">
                            <span class="link-text" @click="handleShowInvoice(row)">查看</span>
                        </template>
                    </TableComponent>
                </template>
            </layout-filter>
        </div>
        <InvoiceInfo
            v-if="invoiceInfo.visible"
            v-bind="invoiceInfo"
            :visible.sync="invoiceInfo.visible"
        />
        <!-- 付款记录列表弹窗 -->
        <PaidListDialog
            v-if="paidListDialog.visible"
            v-bind="paidListDialog"
            :visible.sync="paidListDialog.visible"
        />
    </div>
</template>

<script>
    // API
    import billPayApi from '@/api/businessDocuments/billPay'
    import billPayRecordApi from '@/api/businessDocuments/billPayRecord'
    import contractApi from '@/api/purchase/contract'
    // 方法
    import enums from '@/utils/enum'
    import { getNumberFormat } from '@/utils'
    // 组件
    import InvoiceInfo from '@/views/public/invoice/InvoiceDialog'
    import PaidListDialog from '@/views/businessAccounting/AP/accountsPayable/PaidListDialog'

    export default {
        name: 'PaymentInfo',
        components: {
            InvoiceInfo,
            PaidListDialog
        },
        props: {
            dataId: null
        },
        data() {
            return {
                loading: false,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        onePageHidePagination: true
                    },
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: true
                    }
                },
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                searchParam: {
                    code: '',
                    recordCode: ''
                },
                tabsGroupData: [
                    { label: '应付账款', value: 0, border: true },
                    { label: '已付款', value: 0, border: true },
                    { label: '收款进度', value: '0%', border: false }
                ],
                invoiceInfo: {
                    dataId: null,
                    visible: false
                },
                paidListDialog: {
                    visible: false
                },
                tabsGroupActive: 0,
                invoiceInfoVisible: false
            }
        },
        computed: {
        },
        watch: {
            dataId() {
                this.handleFilter()
            },
            'publicParam.pageSize'() {
                this.getList()
            },
            'publicParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.queryInfo()
            this.queryList()
            this.updateTabelConfig()
        },
        methods: {
            // 获取付款状态
            async queryInfo() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    try {
                        var { data } = await contractApi.getPayStatus(this.dataId)
                        this.tabsGroupData[0].value = getNumberFormat(data.amountPay)
                        this.tabsGroupData[1].value = getNumberFormat(data.amountPaid)
                        this.tabsGroupData[2].value = data.rate + '%'
                    } catch (e) {
                        console.log(e)
                    }
                    this.tableData.options.loading = false
                }
            },
            // 请求列表
            async queryList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    try {
                        var res
                        switch (this.tabsGroupActive) {
                        case 0:
                            res = await billPayApi.getList({
                                ...this.publicParam,
                                approvalId: this.dataId,
                                code: this.searchParam.code
                            })
                            break
                        case 1:
                            res = await billPayRecordApi.getClaimList({
                                ...this.publicParam,
                                approvalId: this.dataId,
                                recordCode: this.searchParam.recordCode
                            })
                            break
                        }
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    } catch (e) {
                        console.log(e)
                    }
                    this.tableData.options.loading = false
                }
            },
            // 筛选数据
            handleFilter() {
                if (this.publicParam.pageIndex !== 1) {
                    this.publicParam.pageIndex = 1
                } else {
                    this.queryList()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                switch (this.tabsGroupActive) {
                case 0:
                    billReceivableApi.export({
                        ...data,
                        approvalId: this.dataId,
                        code: this.searchParam.code
                    })
                    break
                case 1:
                    claimApi.export({
                        ...data,
                        approvalId: this.dataId,
                        recordCode: this.searchParam.recordCode
                    })
                    break
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                switch (this.tabsGroupActive) {
                case 0:
                    // 应付
                    this.tableData.columns = [
                        {
                            prop: 'code',
                            label: '账单编号',
                            minWidth: 130
                        },
                        {
                            type: 'dict',
                            dictType: 'payType',
                            prop: 'payType',
                            label: '费用类型',
                            width: 120
                        },
                        {
                            type: 'money',
                            prop: 'amountPay',
                            label: '应付金额',
                            width: 110,
                            dbProp: 'c_amount_pay',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'amountPaid',
                            label: '已付款',
                            width: 110,
                            dbProp: 'c_amount_paid',
                            isCopy: false,
                            isClick: true,
                            onClick: (data) => {
                                this.paidListDialog = {
                                    dataId: data.guidId,
                                    visible: true,
                                    extendParams: {
                                        billPayId: data.guidId
                                    }
                                }
                            }
                        },
                        {
                            type: 'money',
                            prop: 'amountUnpaid',
                            label: '未付金额',
                            width: 110,
                            dbProp: 'c_amount_unpaid'
                        },
                        {
                            type: 'date',
                            prop: 'generateDate',
                            label: '生成日期',
                            minWidth: 110
                        }
                    ]
                    this.tableData.operates.show = false
                    break
                case 1:
                    // 已付
                    this.tableData.columns = [
                        {
                            label: '账单编号',
                            prop: 'billPayCode',
                            minWidth: 120
                        },
                        {
                            label: '付款流水号',
                            prop: 'recordCode',
                            width: 140,
                            isClick: true,
                            dialogType: 'paymentRecord',
                            idKey: 'billPayRecordId',
                            dbProp: 'tbpr.c_bill_pay_record_code',
                            sortable: 'custom'
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            width: 140,
                            idKey: 'approvalId',
                            isClick: ({ row }) => enums.payType.findIndex(v => v.value === row.payType) > -1,
                            dialogType: ({ row }) => enums.payType.find(v => v.value === row.payType).dialogType
                        },
                        {
                            label: '供应商/客户',
                            prop: 'payObjectName',
                            width: 150
                        },
                        {
                            label: '费用类型',
                            prop: 'payType',
                            width: 100,
                            type: 'dict',
                            dictType: 'payType'
                        },
                        {
                            label: '认领金额(元)',
                            prop: 'amount',
                            width: 120,
                            align: 'right',
                            type: 'money',
                            dbProp: 'tbprrpt.c_amount',
                            sortable: 'custom'
                        },
                        {
                            label: '认领人',
                            prop: 'userName',
                            width: 100
                        },
                        {
                            label: '操作日期',
                            prop: 'createTime',
                            width: 120,
                            type: 'date',
                            dbProp: 'tbprrpt.c_create_time',
                            sortable: 'custom'
                        }
                    ]
                    this.tableData.operates.show = false
                    break
                }
            },
            // 点击选项卡组合时触发
            handleTabsGroupChange(data, index) {
                if (data.border && !this.tableData.options.loading) {
                    this.tabsGroupActive = index
                    this.handleFilter()
                    this.updateTabelConfig()
                }
            },
            // 点击查看发票按钮时触发
            handleShowInvoice(data) {
                this.invoiceInfo = {
                    dataId: data.invoiceId,
                    visible: true
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.payment-info {
    .tabs-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        .item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 5px 0;
            min-width: 80px;
            color: #aaa;
            text-align: center;
            user-select: none;
            transition: .1s ease-in-out;
            &.border {
                min-width: 120px;
                cursor: pointer;
                border: 1px solid #cccccc;
                &:hover {
                    color: #409eff;
                    border-color: #409eff;
                }
                &.active {
                    border-color: #409eff;
                    color: #409eff;
                    background-color: #ecf5ff;
                }
            }
            & + .item {
                margin-left: 10px;
            }
            .value {
                font-size: 14px;
                line-height: 16px;
            }
            .label {
                font-size: 12px;
                line-height: 14px;
                margin-top: 4px;
            }
        }
    }
    .body-wrap {
        margin-top: 10px;
        border-top: solid 1px #eee;
        padding-top: 10px;
    }
}
</style>
