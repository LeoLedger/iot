<!--
* @description 项目信息表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="80"
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
                        prop: 'projectName',
                        label: '项目',
                        type: 'project',
                        itemType: 'dialogPick',
                        formKey: 'projectId',
                        rules: [
                            { required: true, message: '请选择项目', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'productName',
                        label: '产品',
                        type: 'product',
                        itemType: 'dialogPick',
                        formKey: 'productId',
                        dataKey: 'guidId',
                        rules: [
                            { required: true, message: '请选择产品', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'purchaseCount',
                        type: 'number',
                        label: '需求数量',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入需求数量', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'purchaseDate',
                        label: '需求日期',
                        itemType: 'date',
                        rules: [
                            { required: true, message: '请选择需求日期', trigger: 'change' }
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
        },
        mounted() {
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.insideFormData,
                        ...data
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

<style lang='scss' scoped>
</style>
