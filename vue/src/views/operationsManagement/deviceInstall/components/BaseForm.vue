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
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'code',
                        label: '单据编号',
                        itemType: 'input'
                    },
                    {
                        prop: 'regisTime',
                        label: '提交时间',
                        itemType: 'date'
                    },
                    {
                        prop: 'regisUserName',
                        label: '提交人',
                        itemType: 'input'
                    },
                    {
                        prop: 'supplierName',
                        label: '供应商',
                        itemType: 'input'
                    },
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        itemType: 'input'
                    },
                    {
                        prop: 'productName',
                        label: '产品名称',
                        itemType: 'input'
                    },
                    {
                        prop: 'count',
                        label: '申请安装数量',
                        itemType: 'input'
                    },
                    {
                        prop: 'startDate',
                        label: '计划开始时间',
                        itemType: 'date'
                    },
                    {
                        prop: 'endDate',
                        label: '计划完成时间',
                        itemType: 'date'
                    },
                    {
                        prop: 'contactPerson',
                        label: '联系人',
                        itemType: 'input'
                    },
                    {
                        prop: 'contactPhone',
                        label: '联系电话',
                        itemType: 'input'
                    },
                    {
                        prop: 'address',
                        label: '联系地址',
                        itemType: 'textarea',
                        placeholder: '请填写联系地址',
                        span: 24
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
