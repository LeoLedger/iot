<!--
* @description 基础表单
* @author yc
!-->
<template>
    <FormConfig
        ref="baseForm"
        :span="12"
        :label-width="80"
        :forms="forms"
        :scroll="false"
        :disabled="!isEdit"
        :form-data="insideFormData"
        :has-default-form-class="false"
        :show-footer="false"
        is-edit
    />
</template>

<script>
    // API
    import sectionApi from '@/api/PM/section'
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            isCreate: { type: Boolean, default: true },
            formData: { type: Object }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'code',
                        span: 8,
                        label: '故障单号',
                        itemType: 'input',
                        disabled: true,
                        visible: !this.isEdit
                    },
                    {
                        prop: 'regisTime',
                        span: 8,
                        label: '创建时间',
                        itemType: 'date',
                        disabled: true,
                        visible: !this.isEdit
                    },
                    {
                        prop: 'regisUserName',
                        span: 8,
                        label: '创建人',
                        itemType: 'input',
                        disabled: true,
                        visible: !this.isEdit
                    },
                    {
                        prop: 'sectionName',
                        span: 8,
                        label: '标段',
                        type: 'sections',
                        itemType: 'dialogPick',
                        dataKey: ['guidId', 'projectId', 'projectName', 'customerId', 'customerName'],
                        formKey: ['sectionId', 'projectId', 'projectName', 'customerId', 'customerName'],
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择标段', trigger: 'change' }
                        ],
                        customRequest: sectionApi.getListCondition,
                        change: ([{ guidId }]) => {
                            var data = this.getFormData()
                            this.$emit('section-change', {
                                data,
                                guidId
                            })
                        }
                    },
                    {
                        prop: 'projectName',
                        span: 8,
                        label: '项目',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'customerName',
                        span: 8,
                        label: '企业',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24
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
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.setFormConfigProp('customerName', 'extendParams', {
                            type: 0,
                            projectId: data.projectId
                        })
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
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
                            resolve()
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
