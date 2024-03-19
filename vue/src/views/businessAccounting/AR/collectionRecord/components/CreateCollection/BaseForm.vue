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
            :is-edit="true"
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
            customerIsRequired: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                forms: this.getForms
            }
        },
        computed: {
            getForms() {
                return [
                    {
                        prop: 'code',
                        label: '流水号',
                        itemType: 'input',
                        disabled: !this.isEdit,
                        readonly: true,
                        placeholder: '无需填写,系统自动生成'
                    },
                    {
                        prop: 'objectName',
                        label: '收款对象',
                        itemType: 'input',
                        disabled: !this.isEdit
                    },
                    {
                        prop: 'customerName',
                        label: '客户',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'customerId',
                        // disabled: !this.isEdit,
                        rules: [
                            { required: this.customerIsRequired, message: '请选择客户', trigger: 'change' }
                        ],
                        extendParams: {
                            type: 0,
                            lockedProps: ['type'],
                            isBill: true,
                            extendColumns: [
                                {
                                    prop: 'amountRemain',
                                    label: '剩余应收',
                                    minWidth: 100,
                                    type: 'money'
                                }
                            ]
                        },
                        change: (list) => { this.$emit('customer', list[0]) }
                    },
                    {
                        prop: 'amountReceived',
                        label: '收款金额',
                        disabled: !this.formData.customerId,
                        // 金额输入框
                        itemType: 'moneyInput',
                        max: this.formData.amountRemain ? Number(this.formData.amountRemain) : 0,
                        maxTip: '收款金额不得超过客户的剩余应收金额：' + (Number(this.formData.amountRemain) || 0) + '元！',
                        unit: '元',
                        blur: (val) => { this.$emit('amount', val) },
                        rules: [
                            { required: true, message: '请输入收款金额', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'payDate',
                        label: '到账时间',
                        itemType: 'date',
                        disabled: !this.isEdit,
                        rules: [
                            { required: true, message: '请选择到账时间', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'receivableType',
                        label: '收款类型',
                        itemType: 'dictSelect',
                        type: 'paymentRecordType',
                        rules: [
                            { required: true, message: '请选择收款类型', trigger: 'change' }
                        ]
                    },
                    {
                      prop: 'bankName',
                      label: '收款银行名称',
                      itemType: 'input',
                      placeholder: '请填写收款银行名称, 不超过200字',
                      disabled: !this.isEdit
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24,
                        disabled: !this.isEdit
                    },
                    {
                        prop: 'files',
                        label: '附件',
                        itemType: 'upload',
                        span: 24,
                        disabled: !this.isEdit
                    }
                ]
            }
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(newFormData, oldFormData) {
                    this.forms = this.getForms
                }
            }
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    console.log('data', data)
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
