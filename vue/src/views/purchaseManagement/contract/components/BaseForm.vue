<!--
* @description 项目信息表单
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
    import resourceApi from '@/api/resource'
    // 方法
    // 组件
    import FormConfig from '@/components/FormConfig'

    export default {
        components: {
            FormConfig
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            var that = this
            return {
                forms: [
                    {
                        prop: 'code',
                        label: '合同编号',
                        itemType: 'input',
                        // appendRender: this.disabled ? null : () => {
                        //     return (
                        //         <el-button
                        //             type='primary'
                        //             onClick={() => { this.handleDistrictActive() }}
                        //         >绑</el-button>
                        //     )
                        // },
                        rules: [
                            { required: true, message: '合同编号不能为空', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'name',
                        label: '合同名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '合同名称不能为空', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'partyA',
                        label: '合同甲方',
                        itemType: 'remoteSelect',
                        method: resourceApi.getDeptList,
                        labelKey: 'deptName',
                        valueKey: 'deptId',
                        filterValueKey: 'deptId',
                        filterLabelKey: 'deptName',
                        defaultSelectFirst: true
                    },
                    {
                        prop: 'partyAContactPersonName',
                        label: '甲方联系人',
                        type: 'people',
                        itemType: 'dialogPick',
                        formKey: 'partyAContactPersonId'
                    },
                    {
                        prop: 'partyBName',
                        label: '合同乙方',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'partyB',
                        extendParams: {
                            type: 1,
                            lockedProps: ['type']
                        },
                        change: ($event, params) => {
                            // 客户改变时清空乙方联系人信息
                            params.partyBContactPersonId = ''
                            params.partyBContactPersonName = ''
                            // 同时清空采购清单
                            that.$emit('partyB-change', this.getFormData())
                        }
                    },
                    {
                        prop: 'partyBContactPersonName',
                        label: '乙方联系人',
                        type: 'contacts',
                        formKey: 'partyBContactPersonId',
                        itemType: 'dialogPick',
                        premises: [
                            {
                                prop: 'partyB',
                                message: '请先选择合同乙方',
                                dataKey: 'customerId',
                                props: [
                                    { formKey: 'partyBName', dataKey: 'customerName' }
                                ]
                            }
                        ],
                        extendParams: { type: 1, lockedCustomer: true }
                    },
                    {
                        prop: '_period',
                        label: '合同有效期',
                        itemType: 'daterange'

                    },
                    {
                        prop: 'signedDate',
                        label: '签订日期',
                        itemType: 'date'

                    },
                    {
                        prop: '_amount',
                        label: '合同金额',
                        append: '元',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'deliveryTime',
                        label: '预计到货时间',
                        itemType: 'date'

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
                    var [beginDate, endDate] = data._period || []
                    data = {
                        ...this.insideFormData,
                        ...data,
                        beginDate,
                        endDate
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
