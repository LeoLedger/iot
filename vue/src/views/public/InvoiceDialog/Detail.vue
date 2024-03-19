<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="查看发票"
        width="820px"
        append-to-body>
        <div style="height: 400px">
            <BaseForm
                ref="BaseForm"
                :is-edit="true"
                :disabled="true"
                :form-data="formData"
                :cost-type="costType"
            />
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import BaseForm from './BaseForm'
    export default {
        name: 'InvoiceDialog',
        components: { BaseForm },
        props: {
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            },
            dataId: {
                type: String,
                default: null
            },
            rowData: {
                type: Object,
                default: () => {}
            },
            // 押金条是单据生成的, 因此根据costType识别是不是押金条, 如果是收款从costType字段中拿, 如果是付款从payType中拿
            costType: {
                type: Number,
                default: null
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
                    if (val) {
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
                this.$emit('update:visible', false)
                this.$emit('close', false)
            }
        }
    }
</script>

<style scoped>

</style>
