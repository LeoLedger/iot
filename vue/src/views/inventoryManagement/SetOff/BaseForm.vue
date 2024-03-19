<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
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
            formData: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                forms: [],
                hasSection: false
            }
        },
        computed: {
            getForms() {
                return [
                    {
                        prop: 'imei',
                        label: '设备IMEI',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'projectName',
                        label: '项目',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'customerName',
                        label: '企业',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'sectionName',
                        label: '标段',
                        minWidth: 160,
                        type: 'sections',
                        itemType: 'dialogPick',
                        dialogType: 'sections',
                        dataKey: ['guidId', 'projectId', 'projectName', 'customerId', 'customerName'],
                        formKey: ['sectionId', 'projectId', 'projectName', 'customerId', 'customerName'],
                        disabled: this.hasSection,
                        rules: [
                            { required: true, message: '请选择所属标段', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'frmLossReason',
                        label: '挂起原因',
                        type: 'textarea',
                        span: 24,
                        rules: [
                            { required: true, message: '请填写挂起原因', trigger: 'blur' }
                        ]
                    }
                ]
            }
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler() {
                    this.hasSection = !!this.formData.sectionId
                    this.forms = this.getForms
                }
            }
        },
        mounted() {},
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
            },
            handleInput(val) {
                this.earlyWarningValue = val
            }
        }
    }
</script>

<style scoped>

</style>
