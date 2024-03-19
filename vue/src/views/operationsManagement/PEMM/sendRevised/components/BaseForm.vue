<!--
* @description 基础信息表单
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
            :disabled="!isEdit"
            :form-data="insideFormData"
            :has-default-form-class="false"
            :show-footer="false"
            is-edit
        />
    </div>
</template>

<script>
    // API
    import supplierApi from '@/api/purchase/supplier'
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            isCreate: { type: Boolean, default: false },
            formData: { type: Object }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'expressCode',
                        span: 8,
                        label: '快递单号',
                        itemType: 'input',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请输入快递单号', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'expressId',
                        span: 8,
                        type: 'expressCompany',
                        label: '快递公司',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择快递公司', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'cost',
                        span: 8,
                        type: 'number',
                        label: '快递费用',
                        format: this.isEdit ? '' : 'money',
                        itemType: 'input'
                    },
                    {
                        prop: 'type',
                        span: 8,
                        type: 'sendRevisedType',
                        label: '寄修类型',
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择寄修类型', trigger: 'change' }
                        ],
                        change: () => {
                            this.$emit('data-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'supplierName',
                        span: 8,
                        label: '供应商',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'supplierId',
                        disabled: !this.isCreate,
                        premises: [
                            { prop: 'type', dataKey: 'normal', required: false, message: '请先选择寄修类型' }
                        ],
                        extendParams: {
                            type: 1,
                            lockedProps: ['type']
                        },
                        customRequest: supplierApi.getListCondition,
                        rules: [
                            { required: true, message: '请选择供应商', trigger: 'change' }
                        ],
                        change: () => {
                            this.$emit('data-change', this.getFormData())
                        }
                    },
                    // {
                    //     prop: 'empowerIp',
                    //     span: 8,
                    //     type: 'empowerIp',
                    //     label: '设备维修授权',
                    //     itemType: 'dictSelect',
                    //     rules: [
                    //         { required: true, message: '请选择设备维修授权', trigger: 'change' }
                    //     ]
                    // },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24
                    }
                ],
                model: {}
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
                        this.$message.warning(Object.values(err)[0][0].message)
                        reject(err, data)
                    })
                })
            },
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.validate((valid, err) => {
                        if (valid) {
                            resolve(this.getFormData())
                        } else {
                            this.$message.warning(Object.values(err)[0][0].message)
                            reject(err)
                        }
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
