<!--
* @description 联系人信息表单
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
            :disabled="disabled"
            :form-data="formData"
            :has-default-form-class="!isEdit"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import FormConfig from '@/components/FormConfig'

    export default {
        name: 'BaseForm',
        components: {
            FormConfig
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) },
            lockedCustomer: { type: Boolean, default: false }, // 锁定客户，无法修改,
            customerType: { type: [Number, String] }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'name',
                        label: '姓名',
                        itemType: 'input',
                        clearable: true,
                        rules: [
                            { required: true, message: '姓名不能为空', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'customerName',
                        label: '所属单位/公司',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: ['customerId', 'type', 'relDeptId'],
                        dataKey: ['guidId', '_companyType', 'relDeptId'],
                        disabled: this.lockedCustomer,
                        extendParams: { type: this.customerType },
                        rules: [
                            { required: true, message: '请选择所属单位/公司', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'deptName',
                        label: '所属部门',
                        itemType: 'input'
                    },
                    {
                        prop: 'position',
                        label: '职务',
                        itemType: 'input'
                    },
                    {
                        prop: 'sex',
                        label: '性别',
                        itemType: 'radio',
                        options: enums.sex
                    },
                    {
                        prop: 'bornTime',
                        label: '出生日期',
                        itemType: 'date'

                    },
                    {
                        prop: 'phone',
                        label: '联系电话',
                        itemType: 'input'
                    },
                    {
                        prop: 'email',
                        label: '电子邮箱',
                        itemType: 'input'
                    },
                    {
                        prop: 'qq',
                        label: 'QQ号码',
                        itemType: 'input'
                    },
                    {
                        prop: 'wx',
                        label: '微信号',
                        itemType: 'input'
                    },
                    {
                        prop: 'address',
                        label: '家庭住址',
                        itemType: 'input',
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
                        label: '照片',
                        itemType: 'upload',
                        span: 24
                    }
                ]
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
