<!--
* @description 修改密码
* @author yc
!-->
<template>
    <div class="update-password-dialog">
        <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="修改密码"
            width="400px"
            class="not-padding"
            append-to-body
            @close="handleCancel"
        >
            <div v-loading="loading" class="container">
                <FormConfig
                    ref="FormConfig"
                    :span="12"
                    :label-width="110"
                    :forms="formConfig"
                    :scroll="false"
                    :disabled="false"
                    :form-data="formData"
                    :has-default-form-class="false"
                    :show-footer="false"
                    is-edit
                />
            </div>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import { updatePassword } from '@/api/user'
    // 方法
    // 组件

    export default {
        name: 'UpdatePasswordDialog',
        components: {
        },
        props: {
            visible: { type: Boolean, default: false }
        },
        data() {
            return {
                formData: {},
                formConfig: [
                    {
                        span: 24,
                        prop: 'newPassword',
                        label: '新密码',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入新密码', trigger: 'change' },
                            { min: 6, message: '密码长度最少6位', trigger: 'change' }
                        ],
                        change: () => {
                            this.formData = {
                                ...this.getFormData()
                            }
                        }
                    },
                    {
                        span: 24,
                        prop: 'confirmPassword',
                        label: '确认新密码',
                        itemType: 'input',
                        rules: [
                            {
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        callback(new Error('请再次输入密码'))
                                    } else if (value !== this.formData.newPassword) {
                                        callback(new Error('两次输入密码不一致!'))
                                    } else {
                                        callback()
                                    }
                                },
                                trigger: 'change'
                            }
                        ]
                    }
                ],
                loading: false
            }
        },
        computed: {
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 提交表单
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.FormConfig.submitHandler((data) => {
                        resolve({
                            ...this.formData,
                            ...data
                        })
                    }, (err, data) => {
                        reject(err, data)
                    })
                })
            },
            // 获取当前已输入的formdata
            getFormData() {
                return this.$refs.FormConfig.params
            },
            // 点击取消按钮时触发
            handleCancel() {
                this.$emit('update:visible', false)
                this.$refs.FormConfig.$refs.baseForm.resetFields()
            },
            // 提交数据
            async handleSubmit() {
                this.loading = true
                // 验证表格内的表单
                try {
                    await this.validate()
                    let res = await updatePassword(this.formData)
                    this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.handleCancel()
                } catch (e) {
                    console.error(e)
                }
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 30px 30px 30px 0;
}
</style>
