<!--
* @description 联系人信息表单
* @author yc
!-->
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
        name: 'BaseForm',
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            isCreate: Boolean,
            disabled: Boolean,
            formData: { type: Object, default: () => ({}) },
            historyRenew: Boolean,
            permissionProps: Array,
            isImport: Boolean
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'code',
                        label: '合同编号',
                        itemType: 'input',
                        visible: this.disabled,
                        disabled: !this.checkPermissionProps('code')
                    },
                    {
                        prop: 'name',
                        label: '合同名称',
                        itemType: 'input',
                        disabled: !this.checkPermissionProps('name'),
                        rules: [
                            { required: true, message: '合同名称不能为空', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'type',
                        type: 'contractType',
                        label: '合同类型',
                        itemType: 'dictSelect',
                        clearable: false,
                        disabled: this.isImport || this.historyRenew || !this.isCreate && !this.checkPermissionProps('type'),
                        change: () => {
                            this.$emit('update-product', this.getFormData())
                        },
                        rules: [
                            { required: true, message: '请选择合同类型', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'customerName',
                        label: '客户',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'customerId',
                        disabled: !this.checkPermissionProps('customerName'),
                        extendParams: {
                            type: 0,
                            lockedProps: ['type']
                        },
                        rules: [
                            { required: true, message: '请选择客户', trigger: 'change' }
                        ],
                        change: ($event, params) => {
                            // 客户改变时清空标段信息
                            params.sectionId = ''
                            params.sectionName = ''
                        }
                    },
                    this.historyRenew
                        ? {
                            // 历史续费合同
                            prop: 'sectionNames',
                            label: '标段',
                            type: 'sections',
                            itemType: 'dialogPick',
                            formKey: 'sectionIds',
                            premises: [
                                { prop: 'customerId', required: true, message: '请先选择客户' }
                            ],
                            multiple: true,
                            extendParams: {
                                lockedProps: ['customerId']
                            },
                            rules: [
                                { required: true, message: '请选择标段', trigger: 'change' }
                            ],
                            change: () => {
                                this.$emit('update-product', this.getFormData())
                            }
                        } : {
                            // 正常合同
                            prop: 'sectionName',
                            label: '标段',
                            type: 'sections',
                            itemType: 'dialogPick',
                            dataKey: ['guidId', 'projectId', 'projectName', 'customerId', 'customerName'],
                            formKey: ['sectionId', 'projectId', 'projectName', 'customerId', 'customerName'],
                            disabled: !this.checkPermissionProps('sectionName'),
                            premises: [
                                { prop: 'customerId', required: false }
                            ],
                            extendParams: {
                                lockedProps: ['customerId']
                            },
                            rules: [
                                { required: true, message: '请选择标段', trigger: 'change' }
                            ],
                            change: () => {
                                this.$emit('update-product', this.getFormData())
                            }
                        },
                    {
                        prop: '_period',
                        label: '合同期限',
                        itemType: 'daterange',
                        disabled: !this.checkPermissionProps('_period'),
                        rules: [
                            { required: true, message: '请选择合同期限', trigger: 'blur' }
                        ],
                        change: () => {
                            this.$emit('update', this.getFormData())
                        }
                    },
                    {
                        prop: '_amount',
                        label: '合同总金额',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'signedDate',
                        label: '签订日期',
                        itemType: 'date',
                        disabled: !this.checkPermissionProps('signedDate'),
                        rules: [
                            { required: true, message: '请选择签订日期', trigger: 'blur' }
                        ],
                        change: () => {
                            this.$emit('update', this.getFormData())
                        }
                    },
                    {
                        prop: 'isStamp',
                        type: 'contractSeal',
                        label: '有无盖章',
                        itemType: 'dictSelect',
                        disabled: !this.checkPermissionProps('contractSeal')
                    },
                    {
                        prop: 'isProject',
                        type: 'isProjectContract',
                        label: '是否项目合同',
                        itemType: 'dictSelect',
                        disabled: !this.checkPermissionProps('isProject'),
                        rules: [
                            { required: true, message: '请选择是否项目合同', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'isVirtual',
                        type: 'isVirtualContract',
                        label: '是否虚拟合同',
                        itemType: 'dictSelect',
                        disabled: !this.checkPermissionProps('isVirtual'),
                        rules: [
                            { required: true, message: '请选择是否虚拟合同', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'isHistoryDevice',
                        type: 'isDeviceHistoryContract',
                        label: '是否历史设备合同',
                        itemType: 'dictSelect',
                        disabled: !this.checkPermissionProps('isHistoryDevice'),
                        rules: [
                            { required: true, message: '请选择是否历史设备合同', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24,
                        disabled: !this.checkPermissionProps('remark')
                    },
                    {
                        prop: 'fileList',
                        label: '附件',
                        itemType: 'upload',
                        span: 24,
                        disabled: !this.checkPermissionProps('fileList')
                    }
                ],
                model: {
                }
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
            if (this.isImport) {
                this.formData.type = 3
            }
        },
        methods: {
            // 提交表单
            submit() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.submitHandler((data) => {
                        var [startDate, endDate] = data._period
                        data = {
                            ...this.insideFormData,
                            ...data,
                            startDate,
                            endDate
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
