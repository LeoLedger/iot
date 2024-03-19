<!--
* @description 收款认领核销列表
* @author 望浩然
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            :list="dataList"
            empty-hide-table
        >
            <template slot="操作" slot-scope="{$index, row}">
                <div style="text-align: center">
                    <el-button
                        type=""
                        size="mini"
                        icon="el-icon-delete"
                        title="移除"
                        @click="handleDelete($index, row)"
                    />
                </div>
            </template>
        </TableComponent>
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogVisible"
            v-bind="dialogData"
            :visible.sync="dialogVisible"
        />
        <InvoiceDialog
            v-if="invoiceDialog.visible"
            :visible.sync="invoiceDialog.visible"
            :row-data="invoiceDialog.rowData"
            :cost-type="invoiceDialog.costType"
        />
    </div>
</template>

<script>
    import { getPriceFormat } from '@/utils'
    import enums from '@/utils/enum'
    import InvoiceDialog from '@/views/public/InvoiceDialog/Detail'
    import invoiceApi from '@/api/businessDocuments/invoice'

    export default {
        components: {
            InvoiceDialog
        },
        props: {
            dataList: { type: Array, default: () => [] },
            basicData: { type: Object, default: () => {} },
            isEdit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            var that = this
            return {
                // 详情窗口
                dialogData: {},
                dialogVisible: false,
                // 发票窗口
                invoiceDialog: {
                    visible: false,
                    rowData: {},
                    costType: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'receivableCode',
                            label: '账单编号',
                            minWidth: 100,
                            fixed: 'left'
                        },
                        {
                            prop: 'approvalCode',
                            label: '关联单据',
                            fixed: 'left',
                            minWidth: 100,
                            isClick: true,
                            onClick: ($event) => { this.showDetail($event) }
                        },
                        {
                            prop: 'costType',
                            label: '费用类型',
                            formatter: (params, formData) => {
                                return (that.getDict('costType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'amountUnpaid',
                            label: '剩余应收金额',
                            width: 100,
                            align: 'right',
                            formatter: (params, formData) => {
                                return getPriceFormat(params[formData.prop])
                            }
                        },
                        {
                            prop: 'amount',
                            label: '认领核销金额',
                            width: 120,
                            align: 'right',
                            type: 'money',
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                <el-input
                                  disabled={!this.isEdit}
                                  value={row[column.prop]}
                                  type='number'
                                  onInput={(val) => { this.onInputAmount(val, row.amountUnpaid, row) }}
                                  min='0'
                                  align='right'
                                  class='inner-money-input'
                                />
                              )
                            })
                        },
                        // {
                        //     visible: !this.isEdit,
                        //     label: '开票状态',
                        //     prop: 'invoiceType',
                        //     type: 'status',
                        //     style: 'dot',
                        //     enums: enums.invoiceStatus,
                        //     width: 100,
                        //     isClick: true,
                        //     sortable: 'custom'
                        // },
                        // {
                        //     visible: !this.isEdit,
                        //     label: '开票申请单编号',
                        //     prop: 'approvaInvoiceCode',
                        //     width: 120,
                        //     dialogType: 'invoiceApproval',
                        //     idKey: 'approvaInvoiceId',
                        //     isClick: true
                        // },
                        // {
                        //     visible: !this.isEdit,
                        //     label: '发票编号',
                        //     prop: 'invoiceCode',
                        //     width: 80,
                        //     isClick: true,
                        //     onClick: (row) => this.showInvoiceDetail(row)
                        // },
                        {
                            prop: 'remark',
                            label: '备注说明',
                            width: 150,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                <el-input value={row[column.prop]} onInput={(val) => { row[column.prop] = val }} class='inner-money-input'/>
                              )
                            })
                        }
                    ],
                    options: {
                        height: null,
                        maxHeight: null,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        summaryMethod: this.handleSummary
                    },
                    // 列操作按钮
                    operates: {
                        width: 70,
                        fixed: 'right',
                        show: this.isEdit
                    }
                }
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 查看发票列表
            showInvoiceDetail(row) {
                if (row.invoiceId) {
                    invoiceApi.invoiceDetail(row.invoiceId).then(res => {
                        if (res.success) {
                            this.invoiceDialog.rowData = res.data
                            this.invoiceDialog.visible = true
                            this.invoiceDialog.costType = row.costType
                        } else this.$message.error('未找到相关数据')
                    })
                } else this.$message.warning('缺少必要参数')
            },
            // 详情
            showDetail(row) {
                const dialogType = enums.costType.find(v => v.value === row.costType).dialogType
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
            onInputAmount(val, max, row) {
                if (Number(val) >= 0 && val <= Number(max)) {
                    row.amount = val
                }
                if (Number(val) < 0) {
                    row.amount = 0
                }
                if (val > Number(max)) {
                    row.amount = Number(max)
                }
                // 填写时,自动计算总金额是否大于收款金额
                let amountSum = 0
                this.dataList.map((item, index) => {
                    amountSum += Number(item.amount)
                })
                if (Number(this.basicData.amountReceived) < amountSum) {
                    // 如果超过收款金额, 计算不包含本框的总金额与收款金额的差值并赋值
                    // console.log('this.basicData.amountReceived', this.basicData.amountReceived)
                    const maxAmount = getPriceFormat(Number(this.basicData.amountReceived) - (amountSum - row.amount))
                    // console.log('maxAmount', maxAmount)
                    if (maxAmount <= max) {
                        row.amount = maxAmount
                    } else row.amount = max
                }
            },
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            },
            handleSummary({ columns, data }) {
                const sums = []
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '合计'
                        return
                    }
                    if (index === 4 || index === 5) {
                        const values = data.map(item => Number(item[column.property]))
                        if (!values.every(value => isNaN(value))) {
                            sums[index] = values.reduce((prev, curr) => {
                                const value = Number(curr)
                                if (!isNaN(value)) {
                                    return prev + curr
                                } else {
                                    return prev
                                }
                            }, 0)
                            sums[index] = getPriceFormat(sums[index]) + ' 元'
                        } else {
                            sums[index] = '--'
                        }
                    }
                })
                return sums
            }
        }
    }
</script>

<style lang='scss'>
.inner-money-input {
  /deep/ .el-input--mini .el-input__inner, .el-range-editor--mini.el-input__inner {
    text-align: right;
  }
}
</style>
