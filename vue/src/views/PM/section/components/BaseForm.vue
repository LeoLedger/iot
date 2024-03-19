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
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    import enums from '@/utils/enum'
    import FormConfig from '@/components/FormConfig'
    import customerApi from '@/api/PM/customer'
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
            isCreate: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => ({})
            },
            extendParams: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                forms: [
                    {
                        prop: 'name',
                        label: '标段名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入标段名称', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'projectName',
                        label: '所属项目',
                        type: 'project',
                        itemType: 'dialogPick',
                        formKey: 'projectId',
                        rules: [
                            { required: true, message: '请选择所属项目', trigger: 'change' }
                        ],
                        extendParams: { status: 1 }
                    },
                    {
                        prop: 'customerName',
                        label: '服务企业',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'customerId',
                        extendParams: { type: 0 },
                        rules: [
                            { required: true, message: '请选择服务企业', trigger: 'change' }
                        ],
                        change: ($event) => {
                            this.handleCustomerChange($event)
                        },
                        beforePick: ($event) => { return this.confirmChangeCustomer() }
                    },
                    {
                        prop: 'managementUnit',
                        label: '主管单位',
                        itemType: 'input'
                    },
                    {
                        prop: 'projectManagerUserName',
                        label: '项目经理',
                        type: 'contacts',
                        itemType: 'dialogPick',
                        formKey: ['projectManagerUserId', 'phone'],
                        dataKey: ['guidId', 'phone'],
                        premises: [
                            { prop: 'customerId', message: '请先选择服务企业!' }
                        ],
                        change: ($event) => {
                            this.handleManagerUserChange($event)
                        },
                        extendParams: this.extendParams
                    },
                    {
                        prop: 'type',
                        type: 'sectionType',
                        label: '标段类型',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择标段类型', trigger: 'change' }
                        ]
                    },
                    {
                        prop: '_period',
                        label: '服务周期',
                        itemType: 'daterange'

                    },
                    {
                        prop: 'address',
                        props: ['address', 'point'],
                        label: '项目部地址',
                        itemType: 'addressInput',
                        readonly: false,
                        isEditInput: !this.disabled,
                        isEdit: this.isEdit
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24
                    }
                ],
                defaultForm: {
                    name: '',
                    managementUnit: '',
                    projectManagerUserId: '',
                    address: null,
                    remark: null
                }
            }
        },
        computed: {
            insideFormData() {
                return Object.assign({}, this.defaultForm, this.formData)
            }
        },
        mounted() {
            console.log('extend', this.extendParams)
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    const [startDate, endDate] = data._period || []
                    console.log('this.insideFormData', this.insideFormData)
                    data = {
                        ...this.insideFormData,
                        ...data,
                        startDate,
                        endDate
                    }
                    console.log('data', data)
                    delete data._period
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
            confirmChangeCustomer() {
                // 如果已经有服务企业,那么变更时会弹出提醒
                return new Promise((resolve, reject) => {
                    if (this.formData.customerId) {
                        this.$confirm('修改标段的服务企业将会重置标段成员，请谨慎修改！', '提醒', {
                            confirmButtonText: '好的',
                            cancelButtonText: '返回',
                            type: 'warning',
                            center: true
                        }).then(resolve).catch(reject)
                    } else resolve()
                })
            },
            // 客户企业修改时, 更新项目经理的列表extendParams参数以配置默认企业, 并返回给成员列表组件用来配置添加成员时的默认企业
            handleCustomerChange($event) {
                const formData = this.getFormData()
                // 清除原联系人
                this.$emit('customerChange', $event)
                console.log('customerChange', $event)
                if (formData.customerId) {
                    this.forms.map(item => {
                        if (item.prop === 'projectManagerUserName') {
                            this.$set(item, 'extendParams', { ...this.extendParams, customerId: formData.customerId, customerName: formData.customerName })
                        }
                    })
                }
            },
            // 项目经理修改时, 自动创建一个成员对象, 返回给标段成员组件
            handleManagerUserChange(list) {
                if (list && list.length) {
                    const people = {
                        memberUserId: list[0].guidId,
                        memberType: '4FB4CDE0-0B21-4470-8964-5D81FC3FEE0A',
                        name: list[0].name,
                        phone: list[0].phone,
                        email: list[0].email
                    }
                    this.$emit('managerUserChange', people)
                }
            }
        }
    }
</script>

<style scoped>

</style>
