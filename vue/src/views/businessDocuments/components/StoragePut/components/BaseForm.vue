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
            :has-default-form-class="!isEdit"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    // API
    import storagePutApi from '@/api/businessDocuments/storagePut'
    // 方法
    import { mapGetters } from 'vuex'
    import { isEmpty } from '@/utils'
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            isCreate: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) },
            extendParams: { type: Object }
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'contractCode',
                        label: '采购合同',
                        type: 'purchaseContract',
                        itemType: 'dialogPick',
                        formKey: ['purchaseContractId', 'contractName'],
                        dataKey: ['guidId', 'name'],
                        rules: [
                            { required: true, message: '请选择采购合同', trigger: 'change' }
                        ],
                        disabled: !this.isCreate,
                        extendParams: {
                            ...this.extendParams,
                            fromAdviceIn: true
                        },
                        change: ([data]) => {
                            this.queryWarehouse(data.guidId).then((warehouses) => {
                                this.$emit('contract-change', {
                                    data: this.getFormData(),
                                    guidId: data.guidId,
                                    warehouses
                                })
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
                        prop: 'supplierName',
                        label: '供应商',
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
                        prop: 'deliveryTime',
                        label: '预计到货时间',
                        itemType: 'date',
                        disabled: true
                    },
                    {
                        prop: 'costCenterId',
                        type: 'costCenter',
                        label: '成本中心',
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择成本中心', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'warehousesId',
                        label: '入库仓库',
                        itemType: 'select',
                        clearable: false,
                        change: (guidId) => {
                            this.$emit('warehouse-change', {
                                data: this.getFormData(),
                                guidId
                            })
                        }
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
                loading: false
            }
        },
        computed: {
            ...mapGetters(['userInfo']),
            insideFormData() {
                return {
                    costCenterId: this.userInfo.costCenterId,
                    ...this.formData,
                    ...this.model
                }
            }
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data && data.purchaseContractId) {
                        this.queryWarehouse(data.purchaseContractId)
                    }
                }
            }
        },
        mounted() {
            if (this.isCreate) {
                this.forms.find(v => v.prop === 'costCenterId').disabled = !isEmpty(this.userInfo.costCenterId)
            }
        },
        methods: {
            // 获取仓库列表
            async queryWarehouse(contractId) {
                this.loading = true
                var res = await storagePutApi.getWarehouse(contractId)
                var options = res.data.map(item => ({ label: item.name, value: item.guidId }))
                this.setFormConfigProp('warehousesId', 'options', options)
                this.loading = false
                return res.data
            },
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
