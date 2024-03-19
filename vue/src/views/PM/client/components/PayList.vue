<!--
* @description 供应商 - 付款记录列表
* @author
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['xxx'])"
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
        <template v-if="activeTab !== null" slot="filter-top">
            <div class="group-type-list">
                <div
                    v-for="(item, index) in amountTabList"
                    :class="{active: activeTab === item.type}"
                    :key="index"
                    class="group-type-item"
                    @click="activeTab = item.type">
                    <div>{{ getPriceFormat(item.money) }}</div>
                    <div>{{ item.name }}</div>
                </div>
            </div>
        </template>
        <template slot="filter">
            <el-input
                v-if="activeTab === 0"
                v-model="searchParam.recordCode"
                placeholder="付款流水号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-if="activeTab === 1"
                v-model="searchParam.receivableRecordCode"
                placeholder="收款流水号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                v-if="!tableData.loading"
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
        <InvoiceListDialog
            v-if="invoiceDialog.visible"
            :visible.sync="invoiceDialog.visible"
            :data-id="invoiceDialog.dataId"
            :extend-params="invoiceDialog.extendParams"
        />
    </layout-filter>
</template>

<script>
    // 方法
    import { getPriceFormat } from '@/utils'
    import enums from '@/utils/enum'
    // API
    import payApi from '@/api/businessDocuments/billPayRecordPayable'
    // 认领核销API
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'
    import customerApi from '@/api/PM/customer'
    // 组件
    import InvoiceListDialog from '@/views/public/invoice/InvoiceListDialog'
    export default {
        components: { InvoiceListDialog },
        props: {
            dataId: {
                type: String,
                default: null
            },
            // 单位对象类型 0:客户 1:供应商
            objectType: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showPagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 98,
                        fixed: 'right',
                        show: false
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                // 类型按钮列表
                amountTabList: [],
                // 当前类型
                activeTab: null,
                // 发票窗口
                invoiceDialog: {
                    visible: false,
                    dataId: null,
                    extendParams: {}
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
            dataId: {
                handler() {
                    this.getAmountTabList()
                },
                immediate: true
            },
            objectType: {
                handler() {
                    this.getAmountTabList()
                },
                immediate: true
            },
            activeTab(val) {
                this.handleTabChange(val)
            }
        },
        methods: {
            getPriceFormat,
            // 请求列表数据
            async getList() {
                if (this.dataId && this.activeTab > -1) {
                    this.tableData.options.loading = true
                    // 1: 收款 0: 付款
                    const api = this.activeTab === 1 ? claimApi : payApi
                    const params = this.activeTab === 1 ? { customerId: this.dataId } : { payObjectId: this.dataId }
                    const res = await api.getList({
                        ...this.searchParam,
                        ...params
                    })
                    if (res.success) {
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                }
            },
            // 请求顶部付款类型切换按钮的列表
            async getAmountTabList() {
                if (this.dataId) {
                    const res = await customerApi.billList(this.dataId)
                    if (res.success) {
                        // 如果是供应商
                        if (this.objectType === 1 && res.data && res.data.length) {
                            const item = res.data.find(item => item.type === 0)
                            item.name = '总付款'
                            this.amountTabList = [item]
                        } else {
                            // 如果是客户
                            this.amountTabList = res.data
                        }
                    }
                    if (this.amountTabList && this.amountTabList.length > 0) {
                        this.activeTab = this.amountTabList[0].type
                    } else this.activeTab = null
                }
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击切换类型
            handleTabChange(val) {
                this.activeTab = val
                this.getColumns(val)
                this.searchParam.pageIndex = 1
                this.getList()
            },
            // 点击导出按钮时触发
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                const api = this.activeTab === 1 ? claimApi : payApi
                api.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            // 查看发票列表
            showInvoiceDialog(item, type) {
                if (type === 0) {
                    this.invoiceDialog.dataId = item.invoiceId
                    this.invoiceDialog.extendParams = {
                        invoiceId: item.invoiceId,
                        type: type
                    }
                }
                if (type === 1) {
                    this.invoiceDialog.dataId = item.billPayRecordId
                    this.invoiceDialog.extendParams = {
                        billPayRecordId: item.billPayRecordId,
                        type: type
                    }
                }
                this.invoiceDialog.visible = true
            },
            // 获取收付款列表
            getColumns(val) {
                this.tableData.options.loading = true
                this.$set(this.tableData, 'columns', [])
                let data = []
                if (val === 0) {
                    data = [
                        {
                            label: '付款流水',
                            prop: 'recordCode',
                            minWidth: 120,
                            isClick: true,
                            fixed: 'left',
                            dialogType: 'paymentRecord',
                            idKey: 'billPayRecordId'
                        },
                        {
                            type: 'dict',
                            dictType: 'payType',
                            prop: 'payType',
                            label: '费用类型',
                            width: 100
                        },
                        {
                            label: '付款日期',
                            prop: 'createTime',
                            dbProp: 'c_create_time',
                            width: 90,
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            prop: 'amount',
                            label: '付款核销金额',
                            width: 120,
                            align: 'right',
                            type: 'money'
                        }
                        // {
                        //     label: '开票状态',
                        //     prop: 'invoiceStatus',
                        //     type: 'status',
                        //     style: 'dot',
                        //     enums: [
                        //         { label: '未开票', value: 0, color: '#555' },
                        //         { label: '已开票', value: 1, color: '#67c23a' }
                        //     ],
                        //     width: 100,
                        //     isClick: true,
                        //     sortable: 'custom',
                        //     dbProp: 'c_invoice_status'
                        // }
                        // {
                        //     prop: 'createTime',
                        //     label: '开票日期',
                        //     width: 80,
                        //     type: 'date'
                        // },
                        // {
                        //     prop: '_showInvoice',
                        //     label: '查看发票',
                        //     width: 90,
                        //     fixed: 'right',
                        //     render: (h, { row, column }) => {
                        //         if (row.billPayRecordId) {
                        //             return (<el-button type='text' icon='el-icon-search' onClick={() => this.showInvoiceDialog(row, 1)}>查看</el-button>)
                        //         } else return (<span/>)
                        //     }
                        // }
                    ]
                } else {
                    data = [
                        {
                            label: '收款流水',
                            prop: 'receivableRecordCode',
                            minWidth: 120,
                            isClick: true,
                            fixed: 'left',
                            dialogType: 'collectionRecord',
                            idKey: 'receivableRecordId'
                        },
                        {
                            type: 'dict',
                            dictType: 'costType',
                            prop: 'costType',
                            label: '费用类型',
                            width: 100
                        },
                        {
                            label: '收款日期',
                            prop: 'createTime',
                            dbProp: 'c_create_time',
                            width: 90,
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            prop: 'amount',
                            label: '认领收款金额',
                            width: 100,
                            align: 'right',
                            type: 'money'
                        }
                        // {
                        //     label: '开票状态',
                        //     prop: 'invoiceType',
                        //     type: 'status',
                        //     style: 'dot',
                        //     enums: [
                        //         { label: '未开票', value: 0, color: '#555' },
                        //         { label: '已开票', value: 1, color: '#67c23a' }
                        //     ],
                        //     width: 100,
                        //     isClick: true,
                        //     sortable: 'custom',
                        //     dbProp: 'c_invoice_type'
                        // },
                        // {
                        //     prop: 'invoiceDate',
                        //     label: '开票日期',
                        //     width: 90,
                        //     type: 'date'
                        // },
                        // {
                        //     prop: '_showInvoice',
                        //     label: '查看发票',
                        //     width: 90,
                        //     fixed: 'right',
                        //     render: (h, { row, column }) => {
                        //         if (row.invoiceId) {
                        //             return (<el-button type='text' icon='el-icon-search' onClick={() => this.showInvoiceDialog(row, 0)}>查看</el-button>)
                        //         } else return (<span/>)
                        //     }
                        // }
                    ]
                }
                setTimeout(() => {
                    this.$set(this.tableData, 'columns', data)
                    this.tableData.options.loading = false
                }, 10)
                this.$nextTick(() => {
                    this.$forceUpdate()
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.flex-align-center {
    display: flex;
    align-items: center;
    .flex {
        flex: 1;
    }
    .separator {
        margin: 0 8px;
        font-size: 12px;
    }
    /deep/ {
        .el-input__inner {
            text-align: center;
        }
    }
}
.group-type-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  .group-type-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3px;
    width: 120px;
    border: 1px solid #c0c4cc;
    color: #c0c4cc;
    text-align: center;
    font-size: 12px;
    margin-right: 10px;
    cursor: pointer;
    &.disabled {
      border: 1px solid #cccccc;
      color: #cccccc;
    }
    &.active {
      border-color: #409eff;
      color: #409eff;
      background-color: #ecf5ff;
    }
    &:hover {
      color: #409eff;
      border-color: #409eff;
    }
  }
}
</style>
