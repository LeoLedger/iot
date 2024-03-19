<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="120"
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
    import enums from '@/utils/enum'

    // 智能产品种类id
    var IntelligentCategoryId = enums.productCategoryId.find(v => v.value === 0).id

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) },
            category: { type: null, default: '' }
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'purchaseCost',
                        type: 'number',
                        label: '参考采购成本',
                        itemType: 'input'
                    },
                    {
                        prop: 'purchaseTaxRate',
                        type: 'number',
                        label: '采购税率',
                        itemType: 'input'
                    },
                    {
                        prop: 'trafficFeeYear',
                        type: 'number',
                        label: '年流量费',
                        itemType: 'input'
                    },
                    {
                        prop: 'trafficFeeTaxRateYear',
                        type: 'number',
                        label: '流量税率',
                        itemType: 'input'
                    },
                    {
                        prop: 'maintenanceCostSecond',
                        type: 'number',
                        label: '第二年维护成本',
                        itemType: 'input'
                    },
                    {
                        prop: 'maintenanceCostThird',
                        type: 'number',
                        label: '第三年维护成本',
                        itemType: 'input'
                    },
                    {
                        prop: 'maintenanceTaxRate',
                        type: 'number',
                        label: '维护费税率',
                        itemType: 'input'
                    },
                    {
                        prop: 'installCost',
                        type: 'number',
                        label: '安装成本',
                        itemType: 'input'
                    },
                    {
                        prop: 'installTaxRate',
                        type: 'number',
                        label: '安装费税率',
                        itemType: 'input'
                    },
                    {
                        prop: 'costCycle',
                        type: 'number',
                        label: '采购成本分摊周期',
                        itemType: 'input',
                        append: '月'
                    },
                    {
                        prop: 'salesUnitPrice',
                        type: 'number',
                        label: '销售单价',
                        itemType: 'input'
                    },
                    {
                        prop: 'salesFeeYear',
                        type: 'number',
                        label: '销售年服务费',
                        itemType: 'input'
                    },
                    {
                        prop: 'rentalUnitPrice',
                        type: 'number',
                        label: '租用单价',
                        itemType: 'input'
                    },
                    {
                        prop: 'rentalFeeYear',
                        type: 'number',
                        label: '租用年服务费',
                        itemType: 'input'
                    },
                    {
                        prop: 'shelfLife',
                        type: 'number',
                        label: '质保月份',
                        itemType: 'input'
                    },
                    {
                        prop: 'outboundAuth',
                        label: '出库授权',
                        itemType: 'switch',
                        activeValue: 0,
                        inactiveValue: 1
                    },
                    {
                        prop: 'empowerName',
                        label: '产品测试授权IP',
                        type: 'empowerIp',
                        itemType: 'dialogPick',
                        formKey: 'empowerIp',
                        validatePremise: [
                            { prop: 'outboundAuth', includes: [0] }
                        ],
                        rules: [
                            { required: true, message: '请选择产品测试授权IP', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'imeiLength',
                        type: 'number',
                        label: '设备号长度',
                        itemType: 'input',
                        append: '位',
                        rules: [
                            { required: true, message: '设备号长度不能为空', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'complementChar',
                        label: '补齐字符',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '补齐字符不能为空', trigger: 'change' }
                        ]
                    }
                ]
            }
        },
        computed: {
            insideFormData() {
                return { outboundAuth: 0, ...this.formData, ...this.model }
            }
        },
        watch: {
            category: {
                immediate: true,
                handler(category) {
                    if (category === IntelligentCategoryId) {
                        this.setFormConfigProp('costCycle', 'rules', [
                            { required: true, message: '请输入采购成本分摊周期', trigger: 'change' }
                        ])
                    } else {
                        this.setFormConfigProp('costCycle', 'rules', void 0)
                    }
                }
            }
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
                        this.$emit('failure')
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

<style scoped>

</style>
