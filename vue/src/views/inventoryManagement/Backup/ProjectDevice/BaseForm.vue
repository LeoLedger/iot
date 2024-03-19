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
            }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'standbyProjectName',
                        label: '项目名称',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'productName',
                        label: '产品名称',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'productType',
                        label: '产品类型',
                        type: 'productType',
                        itemType: 'dictSelect',
                        disabled: true
                    },
                    {
                        prop: 'ratio',
                        label: '备用比例(%)',
                        itemType: 'input',
                        disabled: this.disabled
                    },
                    {
                        prop: 'earlyWarningType',
                        label: '预警值',
                        itemType: 'select',
                        options: [
                            { label: '等于', value: 1 },
                            { label: '小于等于', value: 0 }
                        ],
                        appendRender: () => {
                            return (
                            <el-input value={this.earlyWarningValue} onInput={this.handleInput} disabled={this.disabled} style='width: 150px'>
                              <span slot='append'>%</span>
                            </el-input>
                          )
                        },
                        disabled: this.disabled
                    }
                ],
                earlyWarningValue: 1
            }
        },
        watch: {
            formData: {
                handler() {
                    this.earlyWarningValue = this.formData.earlyWarningValue || 1
                }
            }
        },
        mounted() {
            this.earlyWarningValue = this.formData.earlyWarningValue || 1
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.formData,
                        ...data,
                        earlyWarningValue: this.earlyWarningValue
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
