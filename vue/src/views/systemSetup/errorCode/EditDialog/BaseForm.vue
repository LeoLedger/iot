<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="getForms"
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
    import resourceApi from '@/api/resource'
    import FormConfig from '@/components/FormConfig'
    import enums from '@/utils/enum'
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
            formData: {
                type: Object,
                default: () => ({})
            },
            type: {
                type: Number,
                default: 3
            }
        },
        data() {
            return {}
        },
        computed: {
            getForms() {
                return [
                    {
                        prop: 'name',
                        label: '标题',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入标题', trigger: 'blur' }
                        ]
                    },
                    {
                        visible: this.type === 3,
                        prop: 'code',
                        label: '故障代码',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入故障代码', trigger: 'blur' }
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
        },
        mounted() {

        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.formData,
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

<style scoped>

</style>
