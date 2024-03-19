<template>
    <div class="dialog-container Sfix">
        <el-dialog
            :title="title"
            :visible.sync="visible"
            :before-close="simpleClose"
            append-to-body
            with="520px"
        >
            <el-form
                ref="dataForm"
                class="dataForm"
                :model="formData"
                label-width="80px"
            >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="名称">
                            <el-input v-model="formData.name" />
                        </el-form-item>
                        <el-form-item label="编码">
                            <el-input v-model="formData.code" />
                        </el-form-item>
                        <el-form-item label="标志">
                            <el-input v-model="formData.identifier" disabled />
                        </el-form-item>
                        <el-form-item label="运行服务">
                            <el-input v-model="formData.runtimeService" />
                        </el-form-item>
                        <el-form-item label="版本">
                            <el-input v-model="formData.version" />
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input v-model="formData.remark" />
                        </el-form-item>
                        <el-form-item label="排序">
                            <el-input v-model="formData.orderNum" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="footer">
                    <el-button icon="el-icon-close">
                        关 闭
                    </el-button>
                    <el-button
                        type="primary"
                        icon="el-icon-check"
                        @click="save"
                    >
                        保 存
                    </el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'WorkflowInfo',
        props: {
            visible: { type: Boolean, default: false },
            title: { type: String, default: '' },
            workflowInfo: { type: Object, default: () => {} }
        },
        data() {
            return {
                formData: {
                    name: '',
                    code: '',
                    identifier: '',
                    runtimeService: '',
                    version: '',
                    remark: '',
                    orderNum: ''
                }
            }
        },
        watch: {
            workflowInfo: {
                deep: true,
                immediate: true,
                handler() {
                    this.formData = { ...this.formData, ...this.workflowInfo }
                }
            }
        },
        methods: {
            workflowInit(obj) {
                this.workflowInfo = obj
            },
            simpleClose() {
                this.$emit('closeWorkflowInfo', false)
            },
            save() {
                this.$emit('saveWorkFlowInfo', this.formData)
            }
        }
    }
</script>

<style scoped>

</style>
