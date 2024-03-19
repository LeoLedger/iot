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
            },
            isCreate: {
              type: Boolean,
              default: false
            }
        },
        data() {
            return {
                dialogType: {
                    '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D': 'expressBill', // 寄出维修设备
                    '0B6FF336-4733-4B10-856F-F83F771D8295': 'storageOut', // 寄出出库设备
                    'D9BF5AC5-B7E3-4BF8-BC4B-4E536D5D7C9D': 'invoice', // 寄出发票
                    '78271167-332A-4DD5-A4D7-3456E6A2835B': 'salesContract', // 寄出合同
                    'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB': 'maintainBill' // 寄出替换设备
                },
                extendParams: {
                    '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D': { statusList: [1, 2] }, // 寄出维修设备
                    '0B6FF336-4733-4B10-856F-F83F771D8295': {
                        approvalStatus: 3,
                        sendFlag: true
                    }, // 寄出出库设备
                    'D9BF5AC5-B7E3-4BF8-BC4B-4E536D5D7C9D': { approvalStatus: 3, sendFlag: true }, // 寄出发票
                    '78271167-332A-4DD5-A4D7-3456E6A2835B': { approvalStatus: 3, sendFlag: true }, // 寄出合同
                    'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB': { statusList: [1, 2], sendFlag: true } // 寄出替换设备
                },
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
                        label: '快递费',
                        itemType: 'moneyInput',
                        unit: '元',
                        moneyInWords: false,
                        rules: [
                            { required: true, message: '请填写快递费', trigger: 'blur' }
                        ]
                    },
                    {
                        label: '寄件时间',
                        prop: 'sendTime',
                        itemType: 'date',
                        rules: [
                            { required: true, message: '请选择寄件时间', trigger: 'change' }
                        ]
                    },
                    {
                        label: '寄件人',
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
                        label: '收件方',
                        itemType: 'dialogPick',
                        formKey: 'objectId',
                        type: 'company',
                        idKey: 'guidId',
                        disabled: !this.isCreate,
                        clearable: true,
                        rules: [
                            { required: true, message: '请选择收件方', trigger: 'change' }
                        ],
                        change: (val) => this.$emit('objectChange', val),
                        clear: () => this.$emit('clearObject')
                    },
                    {
                        prop: 'businessType',
                        label: '业务类型',
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        exclude: this.disabled === false ? ['9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D'] : [],
                        type: 'expressBusinessType',
                        rules: [
                            { required: true, message: '请选择业务类型', trigger: 'change' }
                        ],
                        change: (val) => this.handleTypeChange(val)
                    },
                    {
                        visible: this.approvalInputIsVisible,
                        prop: 'approvalCode',
                        label: '关联单据',
                        itemType: 'dialogPick',
                        labelKey: 'code',
                        formKey: 'approvalId',
                        disabled: !this.isCreate,
                        type: this.approvalInputDialogType,
                        extendParams: this.approvalInputExtendParams,
                        idKey: 'guidId',
                        clearable: true,
                        rules: [
                            { required: true, message: '请选择关联单据', trigger: 'change' }
                        ],
                        beforePick: () => { return this.handleBeforePick() },
                        change: (val) => this.$emit('approvalChange', val),
                        clear: () => this.handleClear()
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
                if (this.formData.sendTime) {
                    return { ...this.model, ...this.formData }
                } else return { ...this.formData, ...this.model }
            },
            approvalInputIsVisible() {
                const formData = this.getFormData()
                return [
                    'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB', // 寄出替换设备
                    '0B6FF336-4733-4B10-856F-F83F771D8295', // 寄出出库设备
                    'D9BF5AC5-B7E3-4BF8-BC4B-4E536D5D7C9D', // 寄出发票
                    '78271167-332A-4DD5-A4D7-3456E6A2835B' // 寄出合同
                ].includes(formData.businessType)
            },
            approvalInputDialogType() {
                const formData = this.getFormData()
                return this.dialogType[formData.businessType] || ''
            },
            approvalInputExtendParams() {
                const formData = this.getFormData()
                const params = this.extendParams[formData.businessType] || {}
                params.customerId = formData.objectId
                return params
            },
            approvalInputDisabled() {
                const formData = this.getFormData()
                console.log('disabled:', !formData.businessType)
                return !formData.businessType
            }
        },
        watch: {},
        mounted() {
        },
        methods: {
            onReady(params) {
                const formData = this.getFormData()
                if (formData.businessType && !this.isReady) {
                    this.isReady = true
                    this.handleTypeChange(formData.businessType, false)
                }
            },
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
            },
            handleTypeChange(val, clear = true) {
                if (clear) {
                    this.$emit('typeChange')
                }
                const visible = [
                    'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB', // 寄出替换设备
                    '0B6FF336-4733-4B10-856F-F83F771D8295', // 寄出出库设备
                    'D9BF5AC5-B7E3-4BF8-BC4B-4E536D5D7C9D', // 寄出发票
                    '78271167-332A-4DD5-A4D7-3456E6A2835B' // 寄出合同
                ].includes(val)
                const extendParams = this.extendParams[val] || {}
                extendParams.customerId = this.$refs.baseForm.params.objectId
                const dialogType = this.dialogType[val] || ''
                const item = this.forms.find(item => item.label === '关联单据')
                if (item) {
                    this.$set(item, 'visible', visible)
                    this.$set(item, 'type', dialogType)
                    this.$set(item, 'extendParams', extendParams)
                    this.$set(item, 'disabled', !this.isCreate)
                }
            },
            handleBeforePick() {
                const item = this.forms.find(item => item.label === '关联单据')
                if (item) {
                    item.extendParams.customerId = this.$refs.baseForm.params.objectId
                    this.$set(item, 'extendParams', item.extendParams)
                }
                return true
            },
            handleClear() {
                const item = this.forms.find(item => item.label === '关联单据')
                if (item) {
                    item.extendParams.customerId = null
                    this.$set(item, 'extendParams', item.extendParams)
                }
            }
        }
    }
</script>

<style scoped>

</style>
