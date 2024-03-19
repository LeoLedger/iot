<!--
* @description 登记维修单 - 基础信息
* @author 望浩然
!-->
<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="false"
            :form-data="insideFormData"
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="true"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    import { getPriceFormat } from '@/utils'
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
            remarkIsEdit: { type: Boolean, default: true }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'supplierName',
                        label: '供应商',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'supplierId',
                        rules: [
                            { required: true, message: '请输入供应商名称', trigger: 'change' }
                        ],
                        disabled: this.disabled,
                        extendParams: { type: 1, lockedProps: ['type'], flag: 1 },
                        change: (list) => { this.$emit('supplier', list[0]) }
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        disabled: !this.remarkIsEdit,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24
                    }
                ]
            }
        },
        computed: {
            insideFormData() {
                return { ...this.formData }
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
                    data = { ...data }
                    callback && callback(data)
                    this.$emit('submit', data)
                }, (err, data) => {
                    errorCallback && errorCallback(err, data)
                    this.$message.warning(Object.values(err)[0][0].message)
                })
            },
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
