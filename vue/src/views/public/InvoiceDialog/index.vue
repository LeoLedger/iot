<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        :title="isEdit?'编辑发票':'添加发票'"
        width="820px"
        append-to-body>
        <BaseForm
            ref="BaseForm"
            :is-edit="true"
            :disabled="false"
            :form-data="formData"
            :max-amount="maxAmount"
        />
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
            <el-button size="mini" type="primary" @click="handleSubmit">保 存</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import BaseForm from './BaseForm'
    import invoiceApi from '@/api/businessDocuments/billPayRecord'
    export default {
        name: 'InvoiceDialog',
        components: { BaseForm },
        props: {
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            },
            isEdit: {
                type: Boolean,
                default: false
            },
            rowData: {
                type: Object,
                default: () => {}
            },
            // 发票金额最大值, 一般传入剩余应收金额/剩余应付金额
            maxAmount: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                formData: {}
            }
        },
        watch: {
            rowData: {
                handler(val) {
                    if (this.isEdit && val) {
                        this.formData = val
                    }
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            // 关闭窗口
            handleCancel() {
                this.$emit('close', false)
            },
            handleSubmit() {
                this.$refs.BaseForm.submit((data) => {
                    const params = { ...this.formData, ...data }
                    this.$notify({ title: '保存成功', type: 'success', duration: 2000 })
                    this.$emit('confirm', params)
                    this.$emit('close', true)
                })
            }
        }
    }
</script>

<style scoped>

</style>
