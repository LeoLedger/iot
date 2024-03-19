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
                        v-model="searchParam.receivableRecordCode"
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
        <!-- 收款认领列表弹窗 -->
        <ClaimListDialog
            v-if="claimListDialog.visible"
            v-bind="claimListDialog"
            :visible.sync="claimListDialog.visible"
        />
    </div>
</template>

<script>
    // API
    import billReceivableApi from '@/api/businessDocuments/billReceivable'
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'
    // 方法
    import enums from '@/utils/enum'
    import { getNumberFormat } from '@/utils'
    // 组件
    import InvoiceInfo from '@/views/public/invoice/InvoiceDialog'
    import ClaimListDialog from '@/views/businessAccounting/AR/receivables/ClaimListDialog'

    export default {
        name: 'PaymentInfo',
        components: {
            InvoiceInfo,
            ClaimListDialog
        },
        props: {
            formData: { type: Object, default: () => ({}) }
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
                    receivableRecordCode: ''
                },
                tabsGroupData: [
                    { label: '应收账款', value: 0, border: true },
                    { label: '已收款', value: 0, border: true },
                    { label: '收款进度', value: '0%', border: false }
                ],
                invoiceInfo: {
                    dataId: null,
                    visible: false
                },
                claimListDialog: {
                    visible: false
                },
                tabsGroupActive: 0,
                invoiceInfoVisible: false
            }
        },
        computed: {
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.searchParam.approvalCode = data.code
                        this.tabsGroupData[0].value = getNumberFormat(data.amount)
                        this.tabsGroupData[1].value = getNumberFormat(data.amountReceived)
                        this.tabsGroupData[2].value = data.amountReceivedRate
                        this.handleFilter()
                    }
                }
            },
            'publicParam.pageSize'() {
                this.getList()
            },
            'publicParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            // 表格配置
            this.TabelConfig = {
                // 应收
                should: [
                    {
                        prop: 'code',
                        label: '账单编号',
                        minWidth: 130
                    },
                    {
                        type: 'dict',
                        dictType: 'costType',
                        prop: 'costType',
                        label: '费用类型',
                        width: 120
                    },
                    {
                        type: 'money',
                        prop: 'amountReceivable',
                        label: '应收金额',
                        width: 110
                    },
                    {
                        type: 'money',
                        prop: 'amountReceived',
                        label: '已收款',
                        width: 110,
                        isCopy: false,
                        isClick: true,
                        onClick: (row) => {
                            this.claimListDialog = {
                                visible: true,
                                dataId: row.guidId,
                                extendParams: {
                                    billReceivableId: row.guidId
                                }
                            }
                        }
                    },
                    {
                        type: 'money',
                        prop: 'amountRemain',
                        label: '剩余应收',
                        width: 110
                    },
                    {
                        type: 'date',
                        prop: 'createTime',
                        label: '生成日期',
                        minWidth: 110
                    }
                ],
                // 已收
                actual: [
                    {
                        label: '账单编号',
                        prop: 'receivableCode',
                        minWidth: 130
                    },
                    {
                        label: '收款流水号',
                        prop: 'receivableRecordCode',
                        width: 150,
                        isClick: true,
                        dialogType: 'collectionRecord',
                        idKey: 'receivableRecordId'
                    },
                    {
                        label: '费用类型',
                        prop: 'costType',
                        width: 100,
                        type: 'dict',
                        dictType: 'costType'
                    },
                    {
                        label: '认领金额(元)',
                        prop: 'amount',
                        width: 100,
                        align: 'right',
                        type: 'money'
                    },
                    {
                        label: '认领人',
                        prop: 'userName',
                        width: 100
                    },
                    {
                        label: '操作日期',
                        prop: 'createTime',
                        width: 100,
                        type: 'date'
                    }
                ]
            }
            this.updateTabelConfig()
        },
        methods: {
            // 请求列表
            async getList() {
                this.tableData.options.loading = true
                try {
                    var res
                    switch (this.tabsGroupActive) {
                    case 0:
                        res = await billReceivableApi.getList({
                            ...this.publicParam,
                            approvalCode: this.formData.code,
                            code: this.searchParam.code
                        })
                        break
                    case 1:
                        res = await claimApi.getList({
                            ...this.publicParam,
                            approvalId: this.formData.guidId,
                            receivableRecordCode: this.searchParam.receivableRecordCode
                        })
                        break
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                } catch (e) {}
                this.tableData.options.loading = false
            },
            // 筛选数据
            handleFilter() {
                if (this.publicParam.pageIndex !== 1) {
                    this.publicParam.pageIndex = 1
                } else {
                    this.getList()
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
                        approvalCode: this.formData.code,
                        code: this.searchParam.code
                    })
                    break
                case 1:
                    claimApi.export({
                        ...data,
                        approvalId: this.formData.guidId,
                        receivableRecordCode: this.searchParam.receivableRecordCode
                    })
                    break
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                switch (this.tabsGroupActive) {
                case 0:
                    this.tableData.columns = this.TabelConfig.should
                    this.tableData.operates.show = false
                    break
                case 1:
                    this.tableData.columns = this.TabelConfig.actual
                    this.tableData.operates.show = false
                    break
                }
            },
            // 点击选项卡组合时触发
            handleTabsGroupChange(data, index) {
                if (data.border && !this.tableData.options.loading) {
                    this.tabsGroupActive = index
                    this.updateTabelConfig()
                    this.handleFilter()
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
