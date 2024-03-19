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
            isCreate: { type: Boolean, default: false }
        },
        data() {
            return {
                forms: []
            }
        },
        computed: {
            insideFormData() {
                return { ...this.formData }
            },
            getForms() {
                return [
                    {
                        disabled: !this.isCreate,
                        prop: 'objectName',
                        label: '供应商',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'objectId',
                        rules: [
                            { required: true, message: '请输入供应商名称', trigger: 'change' }
                        ],
                        extendParams: { type: 1, lockedProps: ['type'], flag: 1 },
                        change: (list) => { this.$emit('supplier', list[0]) }
                    },
                    {
                        prop: 'type',
                        label: '寄修类型',
                        type: 'sendRevisedType',
                        itemType: 'dictSelect',
                        exclude: [1, 2],
                        rules: [
                            { required: true, message: '请选择寄修类型', trigger: 'change' }
                        ]
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
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler() {
                    this.forms = this.getForms
                }
            }
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
