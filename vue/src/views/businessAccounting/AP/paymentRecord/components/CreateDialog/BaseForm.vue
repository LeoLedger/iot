<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="false"
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
            isClaim: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => ({})
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
                        disabled: this.disabled,
                        readonly: true,
                        placeholder: '无需填写,系统自动生成'
                    },
                    {
                        prop: 'objectName',
                        label: '付款对象',
                        itemType: 'input',
                        disabled: this.disabled
                    },
                    {
                        prop: 'payObjectName',
                        label: '供应商/客户',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'payObjectId',
                        rules: [
                            { required: true, message: '请选择供应商/客户', trigger: 'change' }
                        ],
                        disabled: this.disabled && !this.isClaim,
                        extendParams: {
                            type: 1,
                            isrecord: true,
                            extendColumns: [
                                {
                                    label: '剩余应付金额(元)',
                                    prop: 'amountUnpaid',
                                    minWidth: 100,
                                    type: 'money'
                                }
                            ]
                        },
                        change: ($event) => {
                            // 如果选中数据有客户级别 customerGrade 则 type = 0 否则 1
                            const item = $event[0]
                            item.payObjectType = item.customerGrade !== undefined ? 0 : 1
                            this.$emit('objectChange', item)
                        },
                        beforePick: ($event) => { return this.confirmChangeObject() }
                    },
                    {
                        prop: 'amountPay',
                        label: '付款金额',
                        // 金额输入框
                        itemType: 'moneyInput',
                        disabled: (this.disabled && !this.isClaim) || !this.formData.payObjectId,
                        unit: '元',
                        max: this.formData.amountUnpaid ? Number(this.formData.amountUnpaid) : 0,
                        maxTip: '付款金额不得超过付款对象的剩余应付金额：' + (Number(this.formData.amountUnpaid) || 0) + '元！',
                        rules: [
                            { required: true, message: '请输入付款金额', trigger: 'blur' }
                        ],
                        input: ($event) => {
                            this.$emit('amountPayChange', $event)
                        }
                    },
                    {
                        prop: 'payDate',
                        label: '付款时间',
                        itemType: 'date',
                        type: 'date',
                        disabled: this.disabled,
                        rules: [
                            { required: true, message: '请选择付款时间', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'payType',
                        label: '付款类型',
                        itemType: 'dictSelect',
                        type: 'paymentRecordType',
                        disabled: this.disabled,
                        rules: [
                            { required: true, message: '请选择付款类型', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24,
                        disabled: this.disabled
                    },
                    {
                        prop: 'files',
                        label: '附件',
                        itemType: 'upload',
                        span: 24,
                        disabled: this.disabled
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
            },
            confirmChangeObject() {
                // 如果已经有付款对象,那么变更时会弹出提醒
                const formData = this.getFormData()
                return new Promise((resolve, reject) => {
                    if (formData.payObjectId) {
                        this.$confirm('修改付款对象将会重置付款明细，请谨慎修改！', '提醒', {
                            confirmButtonText: '好的',
                            cancelButtonText: '返回',
                            type: 'warning',
                            center: true
                        }).then(resolve).catch(reject)
                    } else {
                        resolve()
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>
