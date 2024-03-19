<!--
* @description 来料批次检测信息表单
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
    import enums from '@/utils/enum'
    import baseFromMixin from '@/mixin/baseFromMixin'
    // 组件

    export default {
        name: 'BaseForm',
        mixins: [baseFromMixin],
        data() {
            return {
                forms: [
                    {
                        prop: 'productCode',
                        label: '产品',
                        type: 'product',
                        itemType: 'dialogPick',
                        formKey: ['productId', 'supplierName', 'productType'],
                        dataKey: ['guidId', 'supplierName', 'type'],
                        rules: [
                            { required: true, message: '请选择产品', trigger: 'change' }
                        ],
                        extendParams: {
                            ...this.extendParams,
                            categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
                            _typeExclude: [
                                '2F83D18B-6434-4DCD-B536-A1E5B5D161D6',
                                'FFAAA298-44C1-4B23-B106-BEEF72B9FFA5'
                            ]
                        },
                        change: () => {
                            this.$emit('data-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'productTestType',
                        type: 'checkType',
                        label: '检测类型',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择检测类型', trigger: 'change' }
                        ],
                        disabled: this.lockedProps.includes('productTestType'),
                        change: () => {
                            this.$emit('data-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'productType',
                        type: 'productType',
                        label: '产品类型',
                        itemType: 'dictSelect',
                        disabled: true
                    },
                    {
                        prop: 'supplierName',
                        label: '供应商',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'count',
                        label: '抽检数量',
                        type: 'number',
                        itemType: 'input',
                        disabled: true,
                        rules: [
                            {
                                validator: (rule, value, callback) => {
                                    if (value > 0) {
                                        callback()
                                    } else {
                                        callback(new Error('请至少添加一项抽检明细'))
                                    }
                                },
                                trigger: 'blur'
                            }
                        ]
                    },
                    {
                        prop: 'countInvalid',
                        label: '不良品数',
                        type: 'number',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'checkResult',
                        label: '抽检结果',
                        itemType: 'radio',
                        options: enums.spotCheckResult,
                        rules: [
                            { required: true, message: '请选择抽检结果', trigger: 'change' }
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
                ]
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
