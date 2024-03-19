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
    import FormConfig from '@/components/FormConfig'

    export default {
        name: 'BaseForm',
        components: {
            FormConfig
        },
        props: {
            isEdit: { type: Boolean, default: true },
            isCreate: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) },
            lockedCustomer: { type: Boolean, default: false } // 锁定客户，无法修改
        },
        data() {
            return {
                model: {
                },
                forms: [
                    {
                        props: ['photoFile'],
                        label: '产品照片',
                        itemType: 'imageUpload',
                        span: 23,
                        placeholderImage: (formData) => {
                            var productType = this.getDict('productType').find(v => v.value === formData.type)
                            if (productType) {
                                return require(`@/assets/image/product/${formData.type}.png`)
                            }
                        }
                    },
                    {
                        prop: 'code',
                        label: '产品编号',
                        itemType: 'input',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请输入产品编号', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'name',
                        label: '产品名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入产品名称', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'type',
                        label: '产品类型',
                        type: 'productType',
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择产品类型', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'supplierName',
                        label: '供应商',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'supplierId',
                        extendParams: {
                            type: 1,
                            lockedProps: ['type']
                        },
                        disabled: this.lockedCustomer || !this.isCreate,
                        rules: [
                            { required: true, message: '请选择供应商', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'unit',
                        label: '产品单位',
                        itemType: 'input'
                    },
                    {
                        prop: 'categoryId',
                        label: '产品种类',
                        type: 'productCategory',
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择产品种类', trigger: 'change' }
                        ],
                        change: () => {
                            this.$emit('data-update', this.getFormData())
                        }
                    },
                    {
                        prop: 'invoiceName',
                        label: '开票信息',
                        itemType: 'input'
                    },
                    {
                      prop: 'qqProductCode',
                      label: '企企产品编码',
                      itemType: 'input'
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
                        prop: 'attachmentFiles',
                        label: '附件',
                        itemType: 'upload',
                        span: 24
                    }
                ]
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
            submit() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.submitHandler((data) => {
                        data = {
                            ...this.insideFormData,
                            ...data
                        }
                        resolve(data)
                    }, (err, data) => {
                        this.$emit('failure')
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

<style scoped>

</style>
