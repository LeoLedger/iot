<!--
*   发票列表
    望浩然
-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="true"
        title="发票信息"
        width="800px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)">
        <div class="layout-detail-container">
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleSearch"
            >
                <template slot="filter">
                    <el-input
                        v-model="searchParam.code"
                        size="mini"
                        placeholder="发票代码"
                        clearable
                        class="filter-item"
                        @change="handleSearch"
                    />
                </template>
                <template slot="table">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @refreshList="handleSearch"
                    />
                </template>
            </layout-filter>
        </div>
        <span slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">关 闭</el-button>
        </span>
        <InvoiceDialog
            v-if="invoiceDialog.visible"
            :visible.sync="invoiceDialog.visible"
            :row-data="invoiceDialog.rowData"
            :cost-type="invoiceDialog.costType"
        />
    </el-dialog>
</template>

<script>
    import invoiceListApi from '@/api/businessDocuments/billPayRecord'
    import invoiceDetailApi from '@/api/businessDocuments/invoice'
    import InvoiceDialog from '@/views/public/InvoiceDialog/Detail'
    export default {
        components: {
            InvoiceDialog
        },
        props: {
            visible: { type: Boolean, default: false },
            // 传此ID用来监听数据刷新
            dataId: { type: String, default: null },
            // 里面必须包含 type(0表示收款 1表示付款) invoiceId(收款时传此字段) billPayRecordId(付款时传此字段)
            extendParams: { type: Object, required: true }
        },
        data() {
            const this_ = this
            return {
                invoiceDialog: {
                    visible: false,
                    rowData: null,
                    costType: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    columns: [
                        {
                            prop: 'code',
                            label: '发票代码',
                            minWidth: 120,
                            disabled: true
                        },
                        {
                            prop: 'number',
                            label: '发票号码',
                            minWidth: 120,
                            disabled: true,
                            isClick: true,
                            onClick: (row) => { this_.showInvoiceDetail(row) }
                        },
                        {
                            prop: 'type',
                            label: '发票类型',
                            minWidth: 120,
                            disabled: true,
                            type: 'dict',
                            dictType: 'invoiceType'
                        },
                        {
                            prop: 'amount',
                            label: '合计金额',
                            minWidth: 120,
                            disabled: true,
                            type: 'money'
                        },
                        {
                            prop: 'taxRate',
                            label: '税率',
                            minWidth: 120,
                            disabled: true,
                            align: 'right'
                        },
                        {
                            prop: 'invoiceDate',
                            label: '开票日期',
                            minWidth: 120,
                            disabled: true,
                            type: 'date'
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 120,
                            disabled: true
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right',
                        show: false
                    },
                    options: {
                        loading: false
                    }
                },
                searchParam: {
                    code: '123',
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        watch: {
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.getList()
                }
            }
        },
        methods: {
            showInvoiceDetail(row) {
                if (row.guidId) {
                    invoiceDetailApi.invoiceDetail(row.guidId).then(res => {
                        if (res.success) {
                            this.invoiceDialog.rowData = res.data
                            this.invoiceDialog.visible = true
                        } else this.$message.error('未找到相关数据')
                    })
                } else this.$message.warning('缺少必要参数')
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
            // 请求列表数据
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = false
                    const res = await invoiceListApi.getInvoiceList({ ...this.searchParam, ...this.extendParams })
                    if (res.success) {
                        res.data.map((v, index) => {
                            if (v) {
                                return v
                            } else res.data.splice(index)
                        })
                        this.tableData.list = res.data
                        this.tableData.total = res.data.length
                    }
                    this.tableData.options.loading = false
                }
            }
        }
    }
</script>

<style scoped>

</style>
