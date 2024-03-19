<!--
* @description 基础表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="110"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="insideFormData"
            :has-default-form-class="!isEdit"
            :show-footer="false"
            :is-edit="isEdit"
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
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'code',
                        label: '单据编号',
                        itemType: 'input',
                        visible: this.disabled
                    },
                    {
                        prop: 'applyDate',
                        label: '提交时间',
                        itemType: 'date',
                        visible: this.disabled
                    },
                    {
                        prop: 'applyUserName',
                        label: '提交人',
                        itemType: 'input',
                        visible: this.disabled
                    },
                    {
                        prop: 'sectionName',
                        label: '标段',
                        type: 'sections',
                        itemType: 'dialogPick',
                        dataKey: ['guidId', 'projectId', 'projectName', 'customerId', 'customerName'],
                        formKey: ['sectionId', 'projectId', 'projectName', 'customerId', 'customerName'],
                        rules: [
                            { required: true, message: '请选择标段', trigger: 'change' }
                        ],
                        extendParams: {
                            fromServiceApproval: true
                        },
                        change: () => {
                            this.$emit('section-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'projectName',
                        label: '项目',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'customerName',
                        label: '企业',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'dailyServiceFee',
                        label: '可退服务费',
                        format: 'money',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'amountApply',
                        label: '申请退款金额',
                        format: 'money',
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
                    },
                    {
                        prop: 'files',
                        label: '附件',
                        itemType: 'upload',
                        span: 24
                    }
                ],
                loading: false
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
