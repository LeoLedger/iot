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
                <el-dropdown trigger="click" size="small">
                    <el-button
                        size="mini"
                        icon="el-icon-more"
                        title="操作"
                    />
                    <el-dropdown-menu slot="dropdown">
                        <div class="layout-dropdown-item" @click="handleEdit($index, row)">
                            <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                        </div>
                        <div class="layout-dropdown-item" @click="handleDelete($index, row)">
                            <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                        </div>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>
        </TableComponent>
        <InvoiceDialog
            v-if="invoiceDialog.visible"
            :visible.sync="invoiceDialog.visible"
            :row-data="invoiceDialog.rowData"
        />
    </div>
</template>

<script>
    import InvoiceDialog from '@/views/public/InvoiceDialog/Detail'
    import invoiceApi from '@/api/businessDocuments/invoice'
    export default {
        components: {
            InvoiceDialog
        },
        props: {
            dataList: { type: Array, default: () => [] },
            isEdit: {
                type: Boolean,
                default: false
            },
            basicData: { type: Object, default: () => {} }
        },
        data() {
            return {
                // 发票窗口
                invoiceDialog: {
                    visible: false,
                    rowData: null,
                    costType: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '发票代码',
                            fixed: 'left'
                        },
                        {
                            prop: 'number',
                            label: '发票号码',
                            fixed: 'left',
                            isClick: true,
                            onClick: (row) => this.showInvoiceDetail(row)
                        },
                        {
                            prop: 'type',
                            label: '发票类型',
                            type: 'dict',
                            dictType: 'invoiceType'
                        },
                        {
                            prop: 'amount',
                            label: '合计金额',
                            width: 150,
                            align: 'right',
                            type: 'money'
                        },
                        {
                            prop: 'taxRate',
                            label: '税率(%)',
                            width: 100,
                            align: 'right',
                            formatter: (params, formData) => {
                                return params.taxRate ? params.taxRate * 100 + '%' : '0%'
                            }
                        },
                        {
                            prop: 'invoiceDate',
                            label: '开票日期',
                            width: 100,
                            itemType: 'date',
                            type: 'date'
                        }
                    ],
                    options: {
                        height: null,
                        maxHeight: null,
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
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
            showInvoiceDetail(row) {
                if (row.guidId) {
                    invoiceApi.invoiceDetail(row.guidId).then(res => {
                        if (res.success) {
                            this.invoiceDialog.rowData = res.data
                            this.invoiceDialog.visible = true
                        } else this.$message.error('未找到相关数据')
                    })
                } else this.$message.warning('缺少必要参数')
            },
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            },
            handleEdit(index, row) {
                this.$emit('edit', index)
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
