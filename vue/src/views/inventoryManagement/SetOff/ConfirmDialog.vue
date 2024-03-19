<template>
    <el-dialog
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="填写挂起原因"
        class=""
        width="800px"
        append-to-body>
        <div class="layout-detail-container" style="height: 300px">
          <BaseForm
            ref="BaseForm"
            slot="BaseForm"
            :disabled="false"
            :form-data="formData"
          />
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
            <el-button
                v-prereclick
                :loading="loading"
                size="mini"
                type="primary"
                @click="handleSubmit"
            >保 存
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
    import BaseForm from '@/views/inventoryManagement/SetOff/BaseForm'
    import deviceApi from '@/api/inventory/device'
    export default {
        name: 'ConfirmDialog',
        components: { BaseForm },
        props: {
            visible: false,
            // 被选择的挂机设备数据
            rowData: null
        },
        data() {
            return {
                formData: {},
                loading: false
            }
        },
        watch: {
            rowData: {
                handler() {
                    this.formData = {
                        imei: this.rowData.imei,
                        sectionId: this.rowData.sectionId,
                        sectionName: this.rowData.sectionName,
                        guidId: this.rowData.guidId,
                        frmLossReason: '',
                        // 以下仅供展示
                        projectId: this.rowData.projectId,
                        projectName: this.rowData.projectName,
                        customerId: this.rowData.customerId,
                        customerName: this.rowData.customerName
                    }
                },
                immediate: true
            }
        },
        methods: {
            handleCancel() {
                this.$emit('update:visible', false)
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    deviceApi.hangup({
                        ...this.formData,
                        ...data
                    }).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('submit')
                            this.$emit('update:visible', false)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            }
        }
    }
</script>

<style scoped>

</style>
