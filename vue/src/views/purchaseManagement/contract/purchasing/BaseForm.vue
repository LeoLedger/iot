<!--
* @description 采购合同表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
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
    import productApi from '@/api/purchase/product'
    // 方法
    import { getPriceFormat } from '@/utils'
    import rigorous from '@/utils/rigorous'
    // 组件
    import FormConfig from '@/components/FormConfig'

    export default {
        components: {
            FormConfig
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) },
            excludes: { type: Array, default: () => [] },
            extendParams: { type: Object }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'productName',
                        label: '产品',
                        type: 'product',
                        itemType: 'dialogPick',
                        formKey: ['productId', 'productCode', 'productType'],
                        dataKey: ['guidId', 'code', 'type'],
                        rules: [
                            { required: true, message: '请选择产品', trigger: 'change' }
                        ],
                        excludes: this.excludes,
                        extendParams: this.extendParams,
                        change: ([data]) => {
                            this.queryProductInfo(data.guidId)
                        }
                    },
                    {
                        prop: 'productType',
                        type: 'productType',
                        label: '产品类型',
                        itemType: 'dictSelect',
                        disabled: true
                    },
                    {
                        prop: 'count',
                        type: 'number',
                        label: '采购数量',
                        itemType: 'input',
                        rules: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        callback(new Error('请输入采购数量'))
                                    } else if (value < 1) {
                                        callback(new Error('采购数量不能小于1'))
                                    } else {
                                        callback()
                                    }
                                },
                                trigger: 'change'
                            }
                        ],
                        input: () => {
                            this.updateMoney()
                        }
                    },
                    {
                        prop: 'unitPrice',
                        type: 'number',
                        label: '采购单价',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入采购单价', trigger: 'change' }
                        ],
                        input: () => {
                            this.updateMoney()
                        }
                    },
                    {
                        prop: '_totalAmount',
                        props: ['totalAmount'],
                        label: '金额',
                        disabled: true,
                        itemType: 'input'
                    },
                    {
                        prop: 'taxRate',
                        label: '税率',
                        type: 'number',
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
                        prop: 'files',
                        label: '附件',
                        itemType: 'upload',
                        span: 24
                    }
                ],
                model: {},
                loading: false
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
            // 获取产品信息
            async queryProductInfo(id) {
                this.loading = true
                var res = await productApi.detail(id)
                var productInfo = res.data.productInfo || {}
                if (res.success) {
                    this.model = {
                        ...this.model,
                        ...this.getFormData(),
                        unitPrice: productInfo.purchaseCost || 0
                    }
                }
                this.loading = false
            },
            // 更新价格
            updateMoney() {
                var data = this.getFormData()
                data.totalAmount = rigorous.floatMul(data.count || 0, data.unitPrice || 0)
                data._totalAmount = getPriceFormat(data.totalAmount)
            },
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.model,
                        ...data
                    }
                    this.forms.forEach(item => {
                        if (item.type === 'number') {
                            data[item.prop] = Number(data[item.prop])
                        }
                    })
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
            setFormConfigProp(key, prop, value) {
                this.$set(this.forms.find(item => item.prop === key), prop, value)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
