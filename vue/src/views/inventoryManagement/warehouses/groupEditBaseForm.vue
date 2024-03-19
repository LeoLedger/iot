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
            :has-default-form-class="false"
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
            isEdit: {
                type: Boolean,
                default: true
            },
            disabled: {
                type: Boolean,
                default: false
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'name',
                        label: '仓库名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入仓库名称', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'type',
                        label: '仓库类型',
                        type: 'warehousesType',
                        itemType: 'dictSelect'
                    },
                    {
                        prop: 'adminName',
                        label: '仓库管理员',
                        type: 'people',
                        itemType: 'dialogPick',
                        formKey: 'adminUserid'
                    },
                    {
                        prop: 'sort',
                        label: '排序',
                        itemType: 'input'
                    },
                    {
                        prop: 'address',
                        label: '详细地址',
                        itemType: 'input'
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
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
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

<style scoped>

</style>
