<!--
* @description 基础表单
* @author yc
!-->
<template>
    <div>
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
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
            formData: { type: Object }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'repairCode',
                        span: 8,
                        label: '维修/寄修单号',
                        itemType: 'input',
                        idKey: 'repairId',
                        isClick: true,
                        dialogType: () => {
                            return ['carTroubleBill', 'sendRevised'][this.formData.type]
                        }
                    },
                    {
                        prop: 'num',
                        span: 8,
                        label: '维修设备数量',
                        itemType: 'input'
                    },
                    {
                        prop: 'supplierName',
                        span: 8,
                        label: '供应商',
                        itemType: 'input'
                    },
                    {
                        prop: 'cost',
                        span: 8,
                        label: '维修费用',
                        itemType: 'input'
                    },
                    {
                        prop: 'companyBearCost',
                        span: 8,
                        label: '公司承担',
                        itemType: 'input'
                    },
                    {
                        prop: 'enterpriseBearCost',
                        span: 8,
                        label: '客户承担',
                        itemType: 'input'
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
