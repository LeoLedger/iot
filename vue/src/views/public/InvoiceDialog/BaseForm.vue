<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="formData"
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    import FormConfig from '@/components/FormConfig'
    export default {
        name: 'BaseForm',
        components: {
            FormConfig
        },
        props: {
            isEdit: {
                type: Boolean,
                default: true
            },
            disabled: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => ({})
            },
            maxAmount: {
                type: Number,
                default: 0
            },
            costType: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                forms: this.getForms
            }
        },
        computed: {
            getForms() {
                if (this.costType !== 0) {
                    return [{
                                prop: 'code',
                                label: '发票代码',
                                itemType: 'input'
                            },
                            {
                                prop: 'number',
                                label: '发票号码',
                                itemType: 'input'
                            },
                            {
                                prop: 'type',
                                label: '发票类型',
                                itemType: 'dictSelect',
                                type: 'invoiceType',
                                rules: [
                                    { required: true, message: '请选择发票类型', trigger: 'blur' }
                                ]
                            },
                            {
                                prop: 'amount',
                                label: '合计金额',
                                // 金额输入框
                                itemType: 'moneyInput',
                                unit: '元',
                                max: Number(this.maxAmount),
                                rules: [
                                    { required: true, message: '请输入合计金额', trigger: 'blur' }
                                ]
                            },
                            {
                                prop: 'taxRate',
                                label: '税率',
                                type: 'input'
                            },
                            {
                                prop: 'invoiceDate',
                                label: '开票日期',
                                itemType: 'date'
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
                                span: 23
                    }]
                } else {
                    return [
                        {
                            prop: 'code',
                            label: '押金条编号',
                            itemType: 'input',
                            disabled: true
                        },
                        {
                            prop: 'amount',
                            label: '合计金额',
                            format: 'money',
                            itemType: 'input',
                            rules: [
                                { required: true, message: '合计金额不能为空', trigger: 'blur' }
                            ]
                        },
                        {
                            prop: 'invoiceDate',
                            label: '开票日期',
                            itemType: 'date',
                            rules: [
                                { required: true, message: '请选择开票日期', trigger: 'blur' }
                            ]
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
                    ]
                }
            }
        },
        watch: {
            costType: {
                immediate: true,
                handler() {
                    this.forms = this.getForms
                }
            }
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    callback && callback(data)
                    this.$emit('submit', data)
                }, (err, data) => {
                    errorCallback && errorCallback(err, data)
                    this.$message.warning(Object.values(err)[0][0].message)
                })
            },
            // 获取当前已输入的表单数据
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

<style scoped>

</style>
