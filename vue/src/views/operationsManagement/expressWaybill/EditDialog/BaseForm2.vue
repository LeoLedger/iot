<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="insideFormData"
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="isEdit"
            @ready="onReady"
        />
    </div>
</template>

<script>
    import FormConfig from '@/components/FormConfig'
    import moment from 'moment'

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
            }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'expressCode',
                        label: '快递单号',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入快递单号', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'expressId',
                        label: '快递公司',
                        type: 'expressCompany',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择快递公司', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'cost',
                        label: '快递费用',
                        itemType: 'moneyInput',
                        unit: '元',
                        moneyInWords: false,
                        rules: [
                            { required: true, message: '请填写快递费', trigger: 'blur' }
                        ]
                    },
                    {
                        label: '单据创建时间',
                        prop: 'sendTime',
                        itemType: 'date',
                        rules: [
                            { required: true, message: '请选择寄件时间', trigger: 'change' }
                        ]
                    },
                    {
                        label: '单据创建人',
                        prop: 'sendUserName',
                        itemType: 'dialogPick',
                        type: 'people',
                        idKey: 'guidId',
                        formKey: 'sendUserId',
                        rules: [
                            { required: true, message: '请选择寄件人', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'objectName',
                        label: '供应商',
                        itemType: 'dialogPick',
                        formKey: 'objectId',
                        type: 'company',
                        idKey: 'guidId',
                        rules: [
                            { required: true, message: '请选择收件方', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'businessType',
                        label: '业务类型',
                        itemType: 'dictSelect',
                        type: 'expressBusinessType',
                        rules: [
                            { required: true, message: '请选择业务类型', trigger: 'change' }
                        ]
                    },
                    {
                        visible: true,
                        prop: 'approvalCode',
                        label: '寄修单号',
                        itemType: 'dialogPick',
                        labelKey: 'code',
                        formKey: 'approvalId',
                        type: 'expressBill',
                        extendParams: { status: 2 },
                        idKey: 'guidId',
                        rules: [
                            { required: true, message: '请选择关联单据', trigger: 'change' }
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
                        span: 23
                    }
                ],
                model: {
                    sendTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                },
                isReady: false
            }
        },
        computed: {
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {},
        mounted() {
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.insideFormData,
                        ...data
                    }
                    callback && callback(data)
                    this.$emit('submit', data)
                }, (err, data) => {
                    errorCallback && errorCallback(err, data)
                    this.$message.warning(Object.values(err)[0][0].message)
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

<style scoped>

</style>
