<!--
* @description 收款认领核销列表
* @author 望浩然
!-->
<template>
    <TableComponent
        v-bind="tableData"
        :list="dataList"
        empty-hide-table
    >
        <template slot="操作" slot-scope="{$index, row}">
            <el-button
                size="mini"
                icon="el-icon-delete"
                title="移除"
                @click="handleDelete($index, row)"
            />
        </template>
    </TableComponent>
</template>

<script>
    import { getPriceFormat } from '@/utils'

    export default {
        components: {
        },
        props: {
            dataList: { type: Array, default: () => [] },
            basicData: { type: Object, default: () => {} },
            isEdit: {
                type: Boolean,
                default: true
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
        computed: {
            tableColumns() {
                return [
                    {
                        prop: 'billPayCode',
                        label: '账单编号',
                        fixed: 'left'
                    },
                    {
                        prop: 'payType',
                        label: '费用类型',
                        type: 'dict',
                        dictType: 'payType'
                    },
                    {
                        prop: 'amountUnpaid',
                        label: '剩余应付金额',
                        width: 100,
                        type: 'money'
                    },
                    {
                        prop: 'amount',
                        label: '付款核销金额',
                        width: 150,
                        align: 'right',
                        type: 'money',
                        render: this.isEdit && ((h, { row, column }) => {
                            return (
                              <el-input
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
                ]
            }
        },
        watch: {
            isEdit() {
                this.$set(this.tableData, 'columns', this.tableColumns)
            }
        },
        mounted() {
            console.log(this.isEdit)
            this.tableData.columns = this.tableColumns
        },
        methods: {
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
                // 填写时,自动计算总金额是否大于付款金额
                let amountSum = 0
                this.dataList.map((item, index) => {
                    amountSum += Number(item.amount)
                })
                if (Number(this.basicData.amountPay) < amountSum) {
                    // 如果超过收款金额, 计算不包含本框的总金额与收款金额的差值并赋值
                    // console.log('this.basicData.amountPay', this.basicData.amountPay)
                    const maxAmount = Number(this.basicData.amountPay) - (amountSum - row.amount)
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
                    if (index === 3 || index === 4) {
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
