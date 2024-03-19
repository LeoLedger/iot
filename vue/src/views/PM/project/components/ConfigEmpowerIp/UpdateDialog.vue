<!--
* @description 更新规则
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="500px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="container">
                <FormConfig
                    ref="baseForm"
                    :span="12"
                    :label-width="100"
                    :forms="forms"
                    :scroll="false"
                    :disabled="!isEdit"
                    :form-data="insideFormData"
                    :has-default-form-class="false"
                    :show-footer="false"
                    is-edit
                />
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    // 方法
    // 组件

    export default {
        name: 'UpdateDialog',
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            formData: Object
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        span: 24,
                        prop: 'projectName',
                        label: '选择EO项目',
                        type: 'projectEO',
                        itemType: 'dialogPick',
                        formKey: 'projectId',
                        rules: [
                            { required: true, message: '请选择EO项目', trigger: 'change' }
                        ]
                    },
                    {
                        span: 24,
                        prop: 'projectName',
                        label: '项目名称',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        span: 24,
                        prop: '_period',
                        label: '数据同步周期',
                        itemType: 'daterange',
                        rules: [
                            { required: true, message: '请选择项目周期', trigger: 'blur' }
                        ]
                    }
                ],
                loading: false
            }
        },
        computed: {
            title() {
                return this.formData ? '编辑规则' : '添加规则'
            },
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 获取当前已输入的formdata
            getFormData() {
                if (this.$refs.baseForm) {
                    return this.$refs.baseForm.params
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.$refs.baseForm.submitHandler((data) => {
                    var formData = this.getFormData()
                    var [startDate, endDate] = data._period || []
                    this.$emit('update', {
                        ...this.insideFormData,
                        ...formData,
                        startDate,
                        endDate
                    })
                    this.$emit('update:visible', false)
                }, (err, data) => {
                    this.$message.warning(Object.values(err)[0][0].message)
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.container{
    padding: 15px 25px 15px 15px;
    min-height: 250px;
}
</style>
