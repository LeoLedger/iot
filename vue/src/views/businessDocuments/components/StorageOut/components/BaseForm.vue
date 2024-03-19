<!--
* @description 基础信息表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="95"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="insideFormData"
            :has-default-form-class="false"
            :show-footer="false"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import moment from 'moment'
    // 组件

    export default {
        components: {
        },
        props: {
            today: String,
            isEdit: Boolean,
            isCreate: Boolean,
            formData: { type: Object, default: () => ({}) },
            isApproval: Boolean,
            processIndex: Number
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'outType',
                        label: '出库类型',
                        type: 'storageOutType',
                        exclude: [2, 3],
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择出库类型', trigger: 'change' }
                        ],
                        change: () => {
                            this.$emit('out-type-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'contractCode',
                        label: '销售合同',
                        type: 'salesContract',
                        itemType: 'dialogPick',
                        formKey: 'contractId',
                        disabled: !this.isCreate,
                        extendParams: {
                            outType: 0,
                            isAllOut: 0,
                            // 剔除续费合同
                            typeAnti: 3,
                            approvalStatus: 3
                        },
                        rules: [
                            { required: true, message: '请选择销售合同', trigger: 'change' }
                        ],
                        change: ([data]) => {
                            this.$emit('contract-change', {
                                guidId: data.guidId,
                                formData: this.getFormData()
                            })
                        }
                    },
                    {
                        prop: 'contractName',
                        label: '合同名称',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'contractType',
                        type: 'contractType',
                        label: '合同类型',
                        itemType: 'dictSelect',
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
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: '_period',
                        label: '合同有效期',
                        itemType: 'daterange',
                        disabled: true
                    },
                    {
                        prop: 'signedDate',
                        label: '签订日期',
                        itemType: 'date',
                        disabled: true
                    },
                    {
                        prop: 'outWarehouseTime',
                        label: '出库日期',
                        itemType: 'date',
                        visible: false,
                        disabled: !this.isApproval,
                        pickerOptions: {
                            disabledDate: (date) => {
                                const today = this.today || this.formData.applyDate // 默认出库时间(貌似已经没有)或者申请时间
                                return moment(date).isBefore(moment(today).startOf('month').subtract(1, 'months')) ||
                                    moment(date).isAfter(moment(today))
                            }
                        },
                        rules: [
                            { required: true, message: '请选择出库日期', trigger: 'change' }
                        ],
                        change: () => {
                            this.$emit('change', {
                                prop: 'outWarehouseTime',
                                data: this.getFormData()
                            })
                        }
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24,
                        disabled: !this.isEdit
                    },
                    {
                        prop: 'files',
                        label: '附件',
                        itemType: 'upload',
                        span: 24,
                        disabled: !this.isEdit
                    }
                ],
                loading: false
            }
        },
        computed: {
            disabled() {
                if (this.isEdit) return false
                if (this.processIndex === 4 && this.isApproval) return false
                return true
            },
            insideFormData() {
                return {
                    outType: 0,
                    ...this.formData,
                    ...this.model
                }
            }
        },
        watch: {
            processIndex: {
                immediate: true,
                handler() {
                    let outWarehouseTime = this.forms.find(v => v.prop === 'outWarehouseTime')
                    this.$set(outWarehouseTime, 'visible', this.processIndex >= 4)
                }
            }
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
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.validate((valid, err) => {
                        if (valid) {
                            resolve(this.getFormData())
                        } else {
                            this.$message.warning(Object.values(err)[0][0].message)
                            reject(err)
                        }
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
