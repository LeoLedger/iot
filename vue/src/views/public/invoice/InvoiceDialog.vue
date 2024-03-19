<!--
* @description 发票信息
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :title="title"
        :before-close="handleDialogClose"
        :close-on-click-modal="!isEdit"
        width="760px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <div class="layout-detail-container">
            <el-collapse v-model="collapseValue" class="layou-collapse" v-loading="loading">
                <el-collapse-item name="1" disabled>
                    <div slot="title" class="title">
                        <div class="text">基础信息</div>
                    </div>
                    <div class="body-wrap base-info">
                        <FormConfig
                            ref="FormConfig"
                            :span="12"
                            :label-width="115"
                            :forms="forms"
                            :scroll="false"
                            :disabled="!isEdit && !isUpdateFiles"
                            :form-data="insideFormData"
                            :has-default-form-class="false"
                            :show-footer="false"
                            is-edit
                        />
                    </div>
                </el-collapse-item>
                <el-collapse-item name="2" disabled>
                    <div slot="title" class="title">
                        <div class="text">核销明细</div>
                    </div>
                    <div class="body-wrap">
                        <TableComponent
                            ref="TableComponent"
                            v-bind="tableData"
                            empty-hide-table
                        />
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
        <span slot="footer">
            <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit" v-if="isEdit">保 存</el-button>
            <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmitFiles" v-else-if="isUpdateFiles">提交</el-button>
        </span>
    </el-dialog>
</template>

<script>
    // API
    import resourceApi from '@/api/resource'
    import invoiceApi from '@/api/businessDocuments/invoice'
    // 方法
    import enums from '@/utils/enum'
    import moment from 'moment'
    import rigorous from '@/utils/rigorous'
    // 组件

    export default {
        name: 'UpdateDialog',
        components: {
        },
        props: {
            type: { type: Number, default: 0 },
            dataId: String,
            isEdit: Boolean,
            visible: Boolean,
            formData: Object,
            formList: Array,
            isUpdateFiles: Boolean,
            isReopen: Boolean, // 判断是否重开发票
            approvalGuidId: String // 单据guidId
        },
        data() {
            return {
                forms: [],
                model: {
                    type: this.type,
                    invoiceDate: ''
                },
                loading: false,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'approvalCode',
                            label: '关联单据',
                            minWidth: 130,
                            idKey: 'approvalId',
                            isClick: true,
                            dialogType: ({ row }) => {
                                return (enums.costType.find(v => v.value === row.costType) || {}).dialogType
                            }
                        },
                        {
                            label: '提供产品',
                            prop: 'productProvide',
                            minWidth: 160
                        },
                        {
                            type: 'dict',
                            dictType: 'costType',
                            prop: 'costType',
                            label: '费用类型',
                            width: 100
                        },
                        {
                            type: 'money',
                            prop: 'amountApply',
                            label: '申请开票',
                            width: 100,
                            visible: !this.isReopen
                        },
                        {
                            type: 'money',
                            prop: '_surplusAmount',
                            label: '剩余可核销金额',
                            width: 120,
                            visible: this.isEdit
                        },
                        {
                            type: 'money',
                            prop: 'amountVerification',
                            label: '核销金额',
                            width: 130,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        placeholder='请输入'
                                        min={0}
                                        max={row._surplusAmount}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    }
                },
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                collapseValue: ['1', '2']
            }
        },
        computed: {
            title() {
                if (this.formData || this.dataId) {
                    return this.isEdit ? '编辑发票信息' : '发票信息查看'
                }
                return '录入发票信息'
            },
            invoiceType() {
                return this.formData ? this.formData.type : this.type
            },
            insideFormData() {
                return { ...this.model, ...this.formData }
            }
        },
        mounted() {
            if (this.isEdit && !this.formData) {
                this.model.invoiceDate = moment().format('yyyy-MM-DD') + ' 00:00:00'
            }
            if (Array.isArray(this.formList)) {
                this.tableData.list = this.formList
            }
            this.queryBaseInfo()
            this.handleUpdateFormConfig()
        },
        methods: {
            submit() {
                return new Promise((resolve, reject) => {
                    this.$refs.FormConfig.submitHandler((data) => {
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
            // 获取押金条编号
            async queryCode() {
                if (this.isEdit && !this.formData) {
                    this.loading = true
                    var res = await invoiceApi.getDepositCode()
                    this.model = {
                        ...this.model,
                        ...this.$refs.FormConfig.params,
                        code: res.data,
                        type: 2
                    }
                    this.loading = false
                }
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await invoiceApi.invoiceDetail(this.dataId)
                    this.model = {
                        ...this.model,
                        ...res.data
                    }
                    this.tableData.list = res.data.invoiceDetailList
                    this.handleUpdateFormConfig()
                    this.loading = false
                }
            },
            // 获取发票文件信息
            async identifyInvoice(fileId) {
                this.loading = true
                try {
                    let data = await resourceApi.identifyInvoice(fileId)
                    data = JSON.parse(data.data)
                    if (Array.isArray(data.VatInvoiceInfos)) {
                        let formData = {}
                        data.VatInvoiceInfos.forEach(({ Name, Value }) => {
                            switch (Name) {
                            case '发票代码':
                                formData.code = Value
                                break
                            case '发票号码':
                                formData.number = Value.replace(/^No/i, '')
                                break
                            case '校验码':
                                formData.checkCode = Value
                                break
                            case '开票日期':
                                formData.invoiceDate = moment(Value.replace(/[^\d+]/g, ' ').trim().replace(/[ ]/g, '-')).format('YYYY-MM-DD HH:mm:ss')
                                break
                            case '合计金额':
                                formData.amount = Value.replace(/[^\d+.]/, '')
                                break
                            case '合计税额':
                                formData.tax = Value.replace(/[^\d+.]/, '')
                                break
                            case '小写金额':
                                formData.levied = Value.replace(/[^\d+.]/, '')
                                break
                            }
                        })
                        if (this.isUpdateFiles && formData.levied !== this.formData.levied) {
                            return this.$message.success('识别的发票金额与原发票金额不一致！')
                        }
                        this.model = {
                            ...this.model,
                            ...this.$refs.FormConfig.params,
                            ...formData
                        }
                        this.$message.success('已从该文件上识别到发票信息')
                    }
                } catch (err) {
                    console.error(err)
                }
                this.loading = false
            },
            // 更新基础表单数据
            updateFormData() {
                let data = this.$refs.FormConfig.params
                data.levied = rigorous.floatAdd(data.amount || 0, data.tax || 0)
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                let data = await this.submit()
                let amountVerification = this.tableData.list.reduce((a, b) => {
                    return rigorous.floatAdd(a, b.amountVerification)
                }, 0)
                switch (this.invoiceType) {
                case 2:
                    if (amountVerification !== data.amount) {
                        return this.$message.warning('"核销金额"合计必须等于"合计金额"！')
                    }
                    break
                default:
                    // 核销明细列表中填写的核销金额合计，必需等于录入的发票价税合计金额
                    if (amountVerification !== data.levied) {
                        return this.$message.warning('"核销金额"合计必须等于"价税合计"！')
                    }
                    break
                }
                const params = { ...this.insideFormData,
                                 ...data,
                                 invoiceDetailList: this.tableData.list.filter(v => v.amountVerification)
                }
                // 重开发票
                if (this.isReopen) {
                    params.invoiceDetailList = params.invoiceDetailList.map(item => {
                        item.amountApply = item.amountVerification
                        return item
                    })
                    // return
                    await invoiceApi.again(params, this.approvalGuidId)
                    this.$emit('reopen')
                } else {
                    this.$emit('update', params)
                }
                this.$emit('update:visible', false)
            },
            // 更新发票信息
            async handleSubmitFiles() {
                const data = await this.submit()
                this.$emit('submitFiles', data)
                this.$emit('update:visible', false)
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                if (this.isEdit) {
                    this.$confirm('确认放弃本次操作？').then(_ => {
                        this.$emit('update:visible', false)
                    }).catch(_ => {
                        return false
                    })
                } else {
                    this.$emit('update:visible', false)
                }
            },
            // 更新表单配置
            handleUpdateFormConfig() {
                let disabled = {
                    base: !this.isEdit
                }
                switch (this.model.type) {
                case 2:
                    this.forms = [
                        {
                            prop: 'approvalInvoiceCode',
                            label: '申请单据',
                            itemType: 'input',
                            visible: !this.isEdit,
                            isClick: true,
                            dialogType: 'invoiceApproval',
                            idKey: 'approvalInvoiceId',
                            disabled: disabled.base
                        },
                        {
                            prop: 'customerName',
                            label: '发票抬头',
                            itemType: 'input',
                            visible: !this.isEdit,
                            disabled: disabled.base
                        },
                        {
                            prop: 'code',
                            label: '押金条编号',
                            itemType: 'input',
                            rules: [
                                { required: true, message: '押金条编号不能为空', trigger: 'blur' }
                            ],
                            disabled: disabled.base
                        },
                        {
                            prop: 'amount',
                            type: 'number',
                            label: '合计金额',
                            format: 'money',
                            itemType: 'input',
                            rules: [
                                { required: true, message: '合计金额不能为空', trigger: 'blur' }
                            ],
                            disabled: disabled.base
                        },
                        {
                            prop: 'invoiceDate',
                            label: '开票日期',
                            itemType: 'date',
                            rules: [
                                { required: true, message: '请选择开票日期', trigger: 'blur' }
                            ],
                            disabled: disabled.base
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            itemType: 'textarea',
                            numLimit: 100,
                            placeholder: '请填写备注, 不超过100字',
                            span: 24,
                            disabled: disabled.base
                        },
                        {
                            prop: 'files',
                            label: '附件',
                            itemType: 'upload',
                            span: 24,
                            disabled: disabled.base
                        }
                    ]
                    break
                default:
                    this.forms = [
                        {
                            prop: 'approvalInvoiceCode',
                            label: '申请单据',
                            itemType: 'input',
                            visible: !this.isEdit,
                            isClick: true,
                            dialogType: 'invoiceApproval',
                            idKey: 'approvalInvoiceId',
                            disabled: disabled.base
                        },
                        {
                            prop: 'customerName',
                            label: '发票抬头',
                            itemType: 'input',
                            visible: !this.isEdit,
                            disabled: disabled.base
                        },
                        {
                            prop: 'type',
                            type: 'invoiceType',
                            label: '发票类型',
                            exclude: [2],
                            itemType: 'dictSelect',
                            disabled: disabled.base,
                            rules: [
                                { required: true, message: '请选择发票类型', trigger: 'blur' }
                            ]
                        },
                        {
                            prop: 'code',
                            label: '发票代码',
                            itemType: 'input',
                            disabled: disabled.base,
                            rules: [
                                { required: true, message: '发票代码不能为空', trigger: 'blur' }
                            ]
                        },
                        {
                            prop: 'number',
                            label: '发票号码',
                            itemType: 'input',
                            rules: [
                                { required: true, message: '发票号码不能为空', trigger: 'blur' }
                            ],
                            disabled: disabled.base
                        },
                        {
                            prop: 'checkCode',
                            label: '校验码',
                            itemType: 'input',
                            disabled: disabled.base
                        },
                        {
                            prop: 'invoiceDate',
                            label: '开票日期',
                            itemType: 'date',
                            disabled: disabled.base,
                            rules: [
                                { required: true, message: '请选择开票日期', trigger: 'blur' }
                            ]
                        },
                        {
                            prop: 'amount',
                            type: 'number',
                            label: '金额合计(不含税)',
                            format: 'money',
                            itemType: 'input',
                            disabled: disabled.base,
                            rules: [
                                { required: true, message: '金额合计(不含税)不能为空', trigger: 'blur' }
                            ],
                            input: () => {
                                this.updateFormData()
                            }
                        },
                        {
                            prop: 'tax',
                            type: 'number',
                            label: '税额',
                            format: 'money',
                            itemType: 'input',
                            disabled: disabled.base,
                            rules: [
                                { required: true, message: '税额不能为空', trigger: 'blur' }
                            ],
                            input: () => {
                                this.updateFormData()
                            }
                        },
                        {
                            prop: 'levied',
                            type: 'number',
                            label: '价税合计(含税)',
                            format: 'money',
                            itemType: 'input',
                            disabled: true
                        },
                        {
                            span: 24,
                            prop: 'remark',
                            label: '备注',
                            itemType: 'textarea',
                            numLimit: 100,
                            placeholder: '请填写备注, 不超过100字',
                            disabled: disabled.base
                        },
                        {
                            prop: 'files',
                            label: '附件',
                            itemType: 'upload',
                            span: 24,
                            change: (data) => {
                                this.identifyInvoice(data.fileId)
                            }
                        }
                    ]
                    break
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.base-info {
    padding-right: 20px;
}
</style>
