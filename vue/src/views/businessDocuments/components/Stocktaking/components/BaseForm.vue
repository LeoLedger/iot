<!--
* @description 基础表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="110"
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
    import { isEmpty } from '@/utils'
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'code',
                        label: '单据编号',
                        itemType: 'input',
                        visible: this.disabled
                    },
                    {
                        prop: 'applyDate',
                        label: '提交时间',
                        itemType: 'date',
                        visible: this.disabled
                    },
                    {
                        prop: 'applyUserName',
                        label: '提交人',
                        itemType: 'input',
                        visible: this.disabled
                    },
                    {
                        prop: 'productCategoryId',
                        label: '产品种类',
                        type: 'productCategory',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择产品种类', trigger: 'change' }
                        ],
                        change: () => {
                            var data = this.getFormData()
                            var config = this.forms.find(v => v.prop === 'warehousesId')
                            this.$set(config, 'type', data.productCategoryId)
                            this.$set(config, 'disabled', false)
                            this.$nextTick(() => {
                                data.warehousesId = ''
                                data.shippingSpaceId = ''
                                this.$emit('reset-list', data)
                            })
                        }
                    },
                    {
                        prop: 'warehousesId',
                        placeKey: 'shippingSpaceId',
                        label: '仓库',
                        itemType: 'warehouseCascader',
                        disabled: true,
                        rules: [
                            { required: true, message: '请选择仓库', trigger: 'change' }
                        ],
                        change: () => {
                            this.$emit('warehouses-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'planDate',
                        label: '计划盘点时间',
                        itemType: 'date',
                        rules: [
                            { required: true, message: '请选择计划盘点时间', trigger: 'blur' }
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
                ],
                loading: false
            }
        },
        computed: {
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        var config = this.forms.find(v => v.prop === 'warehousesId')
                        if (!isEmpty(data.productCategoryId)) {
                            this.$set(config, 'type', data.productCategoryId)
                            this.$set(config, 'disabled', false)
                        }
                    }
                }
            }
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
