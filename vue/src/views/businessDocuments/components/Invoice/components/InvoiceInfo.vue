<!--
* @description 发票列表
* @author yc
!-->
<template>
    <div v-loading="loading" class="invoice-info">
        <InvoiceList
            :data-list="dataList"
            :is-edit="isApproval && processIndex === 2"
            :invoice-type="formData.invoiceType"
            :is-update-files="canUpdateFiles && processIndex > 2"
            :show-replace-btn="formData.approvalStatus === 3"
            @delete="handleDelete"
            @update="handleUpdate"
            @submitFiles="handleSubmitFiles"
            @handleInvalidate="handleInvalidate"
        />
        <InvoiceDialog
            v-if="invoiceDialog.visible"
            v-bind="invoiceDialog"
            :visible.sync="invoiceDialog.visible"
            @update="handleInvoiceDialogUpdate"
            @reopen="$emit('reopen')"
        />
    </div>
</template>

<script>
    // API
    import invoiceApi from '@/api/businessDocuments/invoice'
    // 方法
    import rigorous from '@/utils/rigorous'
    // 组件
    import InvoiceList from '@/views/public/invoice/InvoiceList'
    import InvoiceDialog from '@/views/public/invoice/InvoiceDialog'

    export default {
        components: {
            InvoiceList,
            InvoiceDialog
        },
        props: {
            isEdit: { type: Boolean, default: true },
            formData: { type: Object, default: () => ({}) },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            canUpdateFiles: Boolean
        },
        data() {
            return {
                loading: false,
                dataList: [],
                invoiceDialog: {
                    visible: false
                },
                activeRowData: null
            }
        },
        computed: {
        },
        watch: {
            formData: {
                immediate: true,
                handler(data) {
                    if (Array.isArray(data.invoiceList)) {
                        this.dataList = data.invoiceList.map(v => v)
                    } else {
                        this.dataList = []
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            validate() {
                return new Promise((resolve, reject) => {
                    if (this.dataList.length) {
                        let total = 0
                        let { invoiceType, invoiceAmount } = this.formData
                        switch (invoiceType) {
                        case 2:
                            total = this.dataList.reduce((a, b) => {
                                return rigorous.floatAdd(a, b.amount)
                            }, 0)
                            break
                        default:
                            total = this.dataList.reduce((a, b) => {
                                return rigorous.floatAdd(a, b.levied)
                            }, 0)
                            break
                        }
                        if (total !== invoiceAmount) {
                            this.$message.warning('发票总金额必须等于单据申请开票金额！')
                            return reject()
                        }
                    } else {
                        this.$message.warning('请录入开票信息！')
                        return reject()
                    }
                    resolve(this.dataList)
                })
            },
            // 获取更新后的核销明细列表
            getVerificationList(excludes = [], isReopen) {
                // 计算核销金额合计
                let amounts = this.formData.claimList.map(item => {
                    return {
                        guidId: item.guidId,
                        amountApply: this.dataList.reduce((a, b) => {
                            if (excludes.findIndex(v => v === b) === -1) {
                                let data = (b.invoiceDetailList || []).find(v => v.guidId === item.guidId)
                                if (data) {
                                    return rigorous.floatAdd(a, data.amountVerification)
                                }
                            }
                            return a
                        }, 0)
                    }
                })
                // 申请开票金额减去核销金额合计得到剩余开票金额
                return JSON.parse(JSON.stringify(this.formData.claimList)).map(item => {
                    let data = amounts.find(v => v.guidId === item.guidId)
                    // 重开剩余可核销金额 = 可开票 - 申请开票
                    if (isReopen) {
                        item._surplusAmount = rigorous.floatSub(item.amountUninvoice, item.amountApply)
                    } else {
                        item._surplusAmount = rigorous.floatSub(item.amountApply, data.amountApply)
                    }
                    item.amountVerification = 0
                    return item
                })
            },
            // 新增or编辑发票信息时触发
            // isReopen 是否重开发票
            handleUpdate(data, isReopen = false) {
                let { invoiceType } = this.formData
                let params = {
                    type: invoiceType,
                    isEdit: (this.isApproval && this.processIndex === 2) || (this.formData.approvalStatus === 3 && isReopen),
                    visible: true
                }
                if (data) {
                    let formList = this.getVerificationList([data])
                    let invoiceDetailList = data.invoiceDetailList
                    if (data.guidId) {
                        params.dataId = data.guidId
                    } else {
                        params.formData = data
                    }
                    // 更新申请开票金额
                    formList.forEach(item => {
                        let data = invoiceDetailList.find(v => v.guidId === item.guidId)
                        if (data) {
                            item.amountVerification = data.amountVerification
                        }
                    })
                    params.formList = formList
                } else {
                    if (isReopen) {
                        let formList = this.getVerificationList([], isReopen)
                        params.formList = formList.filter(v => v._surplusAmount > 0)
                        params.isReopen = true
                        params.approvalGuidId = this.formData.guidId
                    } else {
                        let formList = this.getVerificationList()
                        if (formList.find(v => v._surplusAmount > 0)) {
                            params.formList = formList
                        } else {
                            return this.$message.warning('已无可开票金额！')
                        }
                    }
                }
                this.activeRowData = data
                this.invoiceDialog = params
            },
            // 点击删除按钮时触发
            async handleDelete(index) {
                await this.$confirm('此操作将删除此发票信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.dataList.splice(index, 1)
            },
            // 开票信息更新时触发
            handleInvoiceDialogUpdate(data) {
                if (this.activeRowData) {
                    Object.keys(data).forEach(key => {
                        this.activeRowData[key] = data[key]
                    })
                } else {
                    this.dataList.push(data)
                }
            },
            // 上传附件，替换发票
            async handleSubmitFiles(row) {
                const params = {
                    invoiceId: row.guidId,
                    files: row.files
                }
                const { success } = await invoiceApi.replace(params)
                if (success) {
                    this.$message.success('操作成功')
                }
            },
            // 作废发票
            async handleInvalidate(data) {
                await invoiceApi.cancel({ invoiceId: data.guidId })
                this.$emit('handleInvalidate')
            }
        }
    }
</script>

<style lang='scss' scoped>
.invoice-list {
    display: flex;
    flex-wrap: wrap;
    width: calc(100% + 10px);
    margin-left: -5px;
    .item {
        width: 50%;
        padding: 5px;
    }
    .item-wrap {
        padding: 0 10px;
        border: solid 1px #e0e0e0;
        .head {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            align-items: center;
            border-bottom: solid 1px #f1f1f1;
            line-height: 1.4em;
        }
        .body {
            padding: 6px 0;
            overflow: auto;
            &.type1 {
                height: 116px;
            }
            &.type2 {
                height: 64px;
            }
            .rows {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                line-height: 26px;
                .bold {
                    font-weight: bold;
                }
            }
        }
        .foot {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 10px 0;
            border-top: solid 1px #f1f1f1;
            .el-link {
                line-height: 1em;
                & + .el-link {
                    position: relative;
                    margin-left: 16px;
                    &::before {
                        content: '';
                        position: absolute;
                        left: -8px;
                        top: 0;
                        bottom: 0;
                        border-left: solid 1px #e0e0e0;
                    }
                }
            }
        }
    }
}
</style>
