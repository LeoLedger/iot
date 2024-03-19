<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="getForms"
            :scroll="false"
            :disabled="disabled"
            :form-data="insideFormData"
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    import FormConfig from '@/components/FormConfig'
    export default {
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
            return {
                formDataCopy: null,
                defaultForm: {
                    name: '',
                    type: 1
                }
            }
        },
        computed: {
            insideFormData() {
                return Object.assign({}, this.defaultForm, this.formData)
            },
            getForms() {
                return [
                    {
                        prop: 'name',
                        label: '供应商名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入供应商名称', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'unifiedCreditCode',
                        label: '统一信用代码',
                        itemType: 'input'
                    },
                    {
                        prop: 'peopleName',
                        label: '主要联系人',
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
                        extendParams: { type: 1, lockedCustomer: true, relDeptId: this.relDeptId }
                    },
                    {
                        prop: 'peopleName',
                        label: '主要联系人',
                        itemType: 'input',
                        visible: this.isCreate
                    },
                    {
                        prop: 'phone',
                        label: '联系电话',
                        itemType: 'input',
                        disabled: !this.isCreate
                    },
                    {
                        prop: 'publicBankAccount',
                        label: '对公账号',
                        itemType: 'input'
                    },
                    {
                        prop: 'bankAccountId',
                        label: '开户银行',
                        itemType: 'input'
                    },
                    {
                        prop: '_region',
                        label: '所属区域',
                        itemType: 'regionCascader'
                    },
                    {
                        prop: 'address',
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
                        label: '附件',
                        itemType: 'upload',
                        span: 24
                    }
                ]
            }
        },
        watch: {
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    const [provinceId, cityId, areaId] = data._region || []
                    data = {
                        ...this.insideFormData,
                        ...data,
                        areaId,
                        cityId,
                        provinceId
                    }
                    delete data._region
                    if (!data.files || data.files.length < 1) {
                        delete data.files
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
