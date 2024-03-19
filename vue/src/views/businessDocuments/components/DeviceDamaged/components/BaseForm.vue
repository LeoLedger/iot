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
            :is-edit="true"
        />
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    // 智能设备仓位枚举
    import enums from '@/utils/enum'

    const warehousePlaceEnum = {
        0: '38f6b174-b297-438f-aa1a-ba72e24f2b58', // 寄存设备
        1: '27f5247f-a1ec-47a7-91cc-28402a56f60c', // 旧设备
        2: '92bac0e7-eadd-493a-b6bd-17a5a45d0bbb', // 报损设备
        3: '09509d7b-5be3-4a89-a472-58c14b35cc2c', // 备用设备
        4: '0d6146ff-ab3d-4dde-8584-803e2fc03730' // 全新设备
    }
    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) },
            extendParams: { type: Object }
        },
        data() {
            const that = this
            return {
                model: {},
                forms: [
                    {
                        prop: 'code',
                        label: '单据编号',
                        itemType: 'input',
                        visible: this.disabled,
                        disabled: true
                    },
                    {
                        prop: 'applyDate',
                        label: '提交时间',
                        itemType: 'date',
                        visible: this.disabled,
                        disabled: true
                    },
                    {
                        prop: 'applyUserName',
                        label: '提交人',
                        itemType: 'input',
                        visible: this.disabled,
                        disabled: true
                    },
                    {
                        prop: 'warehousesId',
                        type: enums.productCategoryId.find(v => v.value === 0).id,
                        typeIdKey: 'shippingSpaceTypeId',
                        placeKey: 'shippingSpaceId',
                        label: '仓库',
                        itemType: 'warehouseCascader',
                        clearable: true,
                        canSelectStock: [
                            warehousePlaceEnum[0],
                            warehousePlaceEnum[1],
                            warehousePlaceEnum[3],
                            warehousePlaceEnum[4]
                        ],
                        excludes: [],
                        rules: [
                            { required: true, message: '请选择仓库', trigger: 'change' }
                        ],
                        change: (value) => {
                            this.$emit('warehouses-change', value)
                        }
                    },
                    // {
                    //     prop: 'productCode',
                    //     label: '产品编号',
                    //     type: 'product',
                    //     itemType: 'dialogPick',
                    //     labelKey: 'code',
                    //     formKey: 'productId',
                    //     rules: [
                    //         { required: true, message: '请选择产品', trigger: 'change' }
                    //     ],
                    //     disabled: this.disabled,
                    //     extendParams: {
                    //         ...this.extendParams,
                    //         categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                    //     },
                    //     change: (list) => {
                    //         that.$emit('product', list[0])
                    //     }
                    // },
                    // {
                    //     prop: 'productType',
                    //     label: '产品类型',
                    //     itemType: 'dictSelect',
                    //     type: 'productType',
                    //     disabled: true
                    // },
                    {
                        prop: 'count',
                        label: '报损数量',
                        disabled: true,
                        itemType: 'input',
                        appendRender: () => {
                            const txt = this.disabled ? '查看' : '选'
                            return (
                              <el-button type='primary' onClick={() => { this.$emit('showList') }}>{txt}</el-button>
                            )
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
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {},
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
