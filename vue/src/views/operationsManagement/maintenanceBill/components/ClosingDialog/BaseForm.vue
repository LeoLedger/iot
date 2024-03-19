<!--
* @description 基础表单
* @author yc
!-->
<template>
    <div>
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :form-data="insideFormData"
            :show-footer="false"
            :disabled="!isEdit"
            is-edit
        />
    </div>
</template>

<script>
    // API
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: false },
            formData: { type: Object }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'code',
                        span: 8,
                        label: '单号',
                        itemType: 'input',
                        disabled: true,
                        visible: !this.isEdit
                    },
                    {
                        prop: 'confirmationUserName',
                        span: 8,
                        label: '确认人',
                        itemType: 'input',
                        disabled: true,
                        visible: !this.isEdit
                    },
                    {
                        prop: 'confirmationTime',
                        span: 8,
                        label: '确认时间',
                        itemType: 'date',
                        disabled: true,
                        visible: !this.isEdit
                    },
                    {
                        prop: 'cost',
                        span: 8,
                        label: '维修费用',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'companyBearCost',
                        span: 8,
                        label: '公司承担',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'enterpriseBearCost',
                        span: 8,
                        label: '客户承担',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        placeholder: '请填写备注, 不超过100字',
                        span: 24,
                        disabled: !this.isEdit
                    }
                ],
                model: {}
            }
        },
        computed: {
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 提交表单
            submit() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.submitHandler((data) => {
                        data = {
                            ...this.insideFormData,
                            ...data
                        }
                        resolve(data)
                    }, (err, data) => {
                        this.$message.warning(Object.values(err)[0][0].message)
                        reject(err, data)
                    })
                })
            },
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.validate((valid, err) => {
                        if (valid) {
                            resolve(this.getFormData())
                        } else {
                            this.$message.warning(Object.values(err)[0][0].message)
                            reject(err)
                        }
                    })
                })
            },
            // 获取当前已输入的formdata
            getFormData() {
                return this.$refs.baseForm.params
            },
            // 设置form配置
            setFormConfigProp(key, prop, value) {
                this.$set(this.forms.find(item => item.prop === key), prop, value)
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
