<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="getForms"
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
    import resourceApi from '@/api/resource'
    import FormConfig from '@/components/FormConfig'
    import enums from '@/utils/enum'
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
            isCreate: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => ({})
            },
            relDeptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {}
        },
        computed: {
            getForms() {
                return [
                    {
                        prop: 'name',
                        label: '客户名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入客户名称', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'customerType',
                        label: '客户类型',
                        type: 'customerType',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择客户类型', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'customerGrade',
                        label: '客户级别',
                        type: 'customerGrade',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择客户级别', trigger: 'change' }
                        ]
                    },
                    {
                        prop: '_region',
                        label: '所属区域',
                        itemType: 'regionCascader'
                    },
                    {
                        prop: 'peopleName',
                        label: '客户联系人',
                        type: 'contacts',
                        itemType: 'dialogPick',
                        dataKey: ['guidId', 'phone'],
                        formKey: ['peopleId', 'phone'],
                        visible: !this.isCreate,
                        props: ['guidId'],
                        premises: [
                            {
                                prop: 'guidId',
                                dataKey: 'customerId',
                                props: [
                                    { formKey: 'name', dataKey: 'customerName' }
                                ]
                            }
                        ],
                        extendParams: {
                            type: 0,
                            lockedCustomer: true,
                            relDeptId: this.relDeptId
                        }
                    },
                    {
                        prop: 'peopleName',
                        label: '联系人名称',
                        itemType: 'input',
                        visible: this.isCreate
                    },
                    {
                        prop: 'phone',
                        label: '联系号码',
                        itemType: 'input',
                        disabled: !this.isCreate
                    },
                    {
                        prop: 'corporateAccount',
                        label: '对公账号',
                        itemType: 'input'
                    },
                    {
                        prop: 'bankOfDeposit',
                        label: '开户银行',
                        itemType: 'input'
                    },
                    {
                        prop: 'uniformSocialCreditCode',
                        label: '统一信用代码',
                        itemType: 'input'
                    },
                    {
                        prop: 'address',
                        props: ['address', 'point'],
                        label: '客户地址',
                        itemType: 'addressInput',
                        span: 24,
                        readonly: false,
                        isEditInput: !this.disabled,
                        isEdit: this.isEdit
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
                        label: '营业执照',
                        itemType: 'upload',
                        span: 23
                    }
                ]
            }
        },
        watch: {
        },
        mounted() {

        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    const [provinceId, cityId, areaId] = data._region || []
                    data = {
                        ...this.formData,
                        ...data,
                        areaId,
                        cityId,
                        provinceId
                    }
                    delete data._region
                    if (!data.fileId || data.fileId.length < 1) {
                        delete data.fileId
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
