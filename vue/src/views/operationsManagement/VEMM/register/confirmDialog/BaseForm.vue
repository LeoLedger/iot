<!--
* @description 维修单 - 维修确认 - 基础信息
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
            :disabled="disabled"
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
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                forms: [
                    {
                        label: '单据编号',
                        prop: 'code',
                        type: 'input',
                        span: 8
                    },
                    {
                        prop: 'supplierName',
                        label: '供应商',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'supplierId',
                        extendParams: { type: 1 },
                        span: 8
                    },
                    {
                        label: '创建时间',
                        prop: 'createTime',
                        type: 'input',
                        span: 8
                    },
                    {
                        label: '创建人',
                        prop: 'userName',
                        type: 'input',
                        span: 8
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
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
