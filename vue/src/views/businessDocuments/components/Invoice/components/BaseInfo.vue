<!--
* @description 基础信息
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :disabled="!isEdit"
                        @reset-invoice="handleResetInvoice"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">申请开票明细</div>
                    <el-button v-if="isEdit" type="success" size="mini" icon="el-icon-plus" @click="handleAddApply"/>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :page-index.sync="publicParam.pageIndex"
                        :page-size.sync="publicParam.pageSize"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-dropdown v-if="isEdit" trigger="click" size="small">
                                <el-button size="mini" icon="el-icon-more" title="操作" />
                                <el-dropdown-menu slot="dropdown">
                                    <div class="layout-dropdown-item" @click="handleDeleteButton(row)">
                                        <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                    </div>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
            <el-collapse-item v-if="processIndex >= 2" name="3" disabled>
                <div slot="title" class="title">
                    <div class="text">开票信息</div>
                    <el-button v-if="(isApproval && processIndex === 2) || (formData.approvalStatus === 3 && hasCancelInvoice)" type="success" size="mini" icon="el-icon-plus" @click="handleAddInvoice"/>
                </div>
                <div class="body-wrap">
                    <InvoiceInfo
                        ref="InvoiceInfo"
                        :form-data="formData"
                        :is-edit="isEdit"
                        :is-approval="isApproval"
                        :process-index="processIndex"
                        :can-update-files="canUpdateFiles"
                        @handleInvalidate="queryBaseInfo"
                        @reopen="queryBaseInfo"
                    />
                </div>
            </el-collapse-item>
        </el-collapse>
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            title="选择开票账单"
            type="receivables"
            @change="handleSelectDialogChange"
        />
    </div>
</template>

<script>
    // API
    import invoiceApi from '@/api/businessDocuments/invoice'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import BaseForm from './BaseForm'
    import InvoiceInfo from './InvoiceInfo'
    import SelectDialog from '@/components/SelectDialog'

    export default {
        components: {
            BaseForm,
            InvoiceInfo,
            SelectDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            canUpdateFiles: Boolean
        },
        data() {
            return {
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'approvalCode',
                            label: '关联单据',
                            minWidth: 130,
                            idKey: ({ row }) => row.costType === 5 ? 'approvalIds' : 'approvalId',
                            isClick: true,
                            dialogType: ({ row }) => {
                                return (enums.costType.find(v => v.value === row.costType) || {}).dialogType
                            }
                        },
                        {
                            label: '提供产品',
                            prop: 'productProvide',
                            minWidth: 160
                        },
                        {
                            type: 'dict',
                            dictType: 'costType',
                            prop: 'costType',
                            label: '费用类型',
                            width: 100
                        },
                        {
                            type: 'money',
                            prop: 'amountUninvoice',
                            label: '可开票',
                            width: 100
                        },
                        {
                            type: 'money',
                            prop: 'amountApply',
                            label: '申请开票',
                            width: 130,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        onChange={() => {
                                            this.updateFormData()
                                        }}
                                        placeholder='请输入'
                                        min={0}
                                        max={row.amountUninvoice}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        }
                    ],
                    options: {
                        rules: {
                            invoiceCode: { required: true, message: '请配置开票明细第${index}行的发票信息', trigger: 'change' }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                dataList: [],
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                },
                isEditInvoice: false,
                activeRowData: null,
                collapseValue: ['1', '2', '3'],
                invoiceInfoVisible: false
            }
        },
        computed: {
            activeInvoiceData() {
                var invoice
                if (this.activeRowData) {
                    invoice = this.activeRowData.invoice
                }
                if (!invoice) {
                    invoice = {}
                    var invoiceType = this.formData.invoiceType
                    if (invoiceType !== 2) {
                        // 如果没有发票信息,且发票类型不为押金条，自动填充基础表单的发票类型
                        invoice.type = invoiceType
                    }
                    if (this.formData.isMerge === 0) {
                        // 如果为合并开票，自动填充金额
                        invoice.amount = this.formData.invoiceAmount
                    }
                }
                return invoice
            },
            // 是否有作废发票
            hasCancelInvoice() {
                return this.formData.invoiceList.some(item => item.cancellation === 1)
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            processIndex: {
                immediate: true,
                handler() {
                    this.updateTabelConfig()
                }
            },
            'publicParam.pageSize'() {
                this.filterData()
            },
            'publicParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    var data = await this.$refs.BaseForm.submit()
                    if (this.dataList.length) {
                        var res = await invoiceApi.update({
                            ...this.formData,
                            ...data,
                            claimList: this.dataList
                        })
                        this.getCanApprovalCount()
                        return this.$notify({
                            title: '保存成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                    } else {
                        this.$message.warning('开票明细不能为空！')
                    }
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
                return Promise.reject()
            },
            // 审批验证
            validateApproval() {
                return this.$refs.InvoiceInfo.validate()
            },
            // 筛选数据
            filterData() {
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await invoiceApi.detail(this.dataId)
                    this.dataList = res.data.claimList || []
                    await this.queryNewestAmount()
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.$emit('data-update', this.formData)
                    this.filterData()
                    this.loading = false
                }
            },
            // 更新可开票金额
            async queryNewestAmount() {
                if (this.dataId && this.isEdit) {
                    let res = await invoiceApi.getNewestAmount({
                        guids: this.dataList.map(v => v.guidId)
                    })
                    res.data.forEach(item => {
                        let data = this.dataList.find(v => v.guidId === item.guidId)
                        if (data) {
                            data.amountUninvoice = item.amountUninvoice
                        }
                    })
                }
            },
            // 更新基础表单数据
            updateFormData() {
                this.formData = {
                    ...this.formData,
                    ...this.$refs.BaseForm.getFormData(),
                    invoiceAmount: this.dataList.reduce((a, b) => {
                        return a + b.amountApply
                    }, 0)
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                this.tableData.operates.show = this.isEdit
            },
            // 新增申请开票
            handleAddApply() {
                this.$refs.BaseForm.validate().then(data => {
                    this.formData = {
                        ...this.formData,
                        ...data
                    }
                    var selectDialog = {
                        value: this.dataList,
                        visible: true,
                        multiple: true,
                        extendParams: {
                            customerId: data.customerId,
                            applyInvoiceType: this.formData.invoiceType,
                            fromApprovalInvoice: true
                        }
                    }
                    this.selectDialog = selectDialog
                })
            },
            // 新增开票信息
            handleAddInvoice() {
                this.$refs.InvoiceInfo.handleUpdate(null, this.hasCancelInvoice)
            },
            // 点击查看发票按钮时触发
            handleShowInvoice(data) {
                if (!data.invoice) {
                    this.activeRowData = data
                    this.tableData.options.loading = true
                    invoiceApi.invoiceDetail(data.invoiceId).then(res => {
                        data.invoice = res.data
                        this.invoiceInfoVisible = true
                    }).finally(() => {
                        this.tableData.options.loading = false
                    })
                }
            },
            // 重置开票明细
            handleResetInvoice(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.dataList = []
                this.publicParam.pageIndex = 1
                this.filterData()
            },
            // 点击删除按钮时触发
            handleDeleteButton(data) {
                this.dataList.splice(this.dataList.indexOf(data), 1)
                this.filterData()
            },
            // 点击配置按钮时触发
            handleConfigButton(data) {
                this.isEditInvoice = true
                this.activeRowData = data
                this.invoiceInfoVisible = true
            },
            // 发票信息更新时触发
            handleInvoiceUpdate(data) {
                this.activeRowData.invoice = data
                this.activeRowData.invoiceCode = data.code
                this.$emit('update:jsonData', this.dataList)
            },
            // 选择收款认领数据后触发
            handleSelectDialogChange(list) {
                list = list.filter(item => {
                    return this.dataList.findIndex(v => v.guidId === item.guidId) === -1
                })
                this.dataList = this.dataList.concat(list)
                this.updateFormData()
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
