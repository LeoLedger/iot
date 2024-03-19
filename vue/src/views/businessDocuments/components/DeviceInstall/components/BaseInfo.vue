<!--
* @description 基础信息
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :disabled="!isEdit"
                        @reset-list="handleResetList"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">申请安装清单</div>
                    <el-button v-if="isEdit" type="success" size="mini" icon="el-icon-plus" @click="handleAddButton"/>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :page-index.sync="publicParam.pageIndex"
                        :page-size.sync="publicParam.pageSize"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-dropdown v-if="isEdit" trigger="click" size="small">
                                <el-button size="mini" icon="el-icon-more" title="操作" />
                                <el-dropdown-menu slot="dropdown">
                                    <div class="layout-dropdown-item" @click="handleDeleteButton(row)">
                                        <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                    </div>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            @change="handleSelectDialogChange"
        />
    </div>
</template>

<script>
    // API
    import deviceInstallApi from '@/api/businessDocuments/deviceInstall'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import SelectDialog from '@/components/SelectDialog/index'

    export default {
        components: {
            BaseForm,
            SelectDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false,
                formData: {},
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 130,
                            idKey: 'contractId',
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 120
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 120
                        },
                        {
                            prop: 'canInstallNumber',
                            label: '剩余可安装数量',
                            width: 110
                        },
                        {
                            prop: 'applyInstallNumber',
                            label: '申请安装数量',
                            width: 130,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => {
                                            row[column.prop] = res
                                            this.handleUpdateCount()
                                        }}
                                        placeholder='请输入'
                                        size='mini'
                                        min={0}
                                        max={row.canInstallNumber}
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        }
                    ],
                    options: {
                        rules: {
                            invoiceCode: { required: true, message: '请配置开票明细第${index}行的发票信息', trigger: 'change' }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                },
                activeRowData: null,
                collapseValue: ['1', '2'],
                invoiceInfoVisible: false
            }
        },
        computed: {
            activeInvoiceData() {
                if (this.activeRowData) {
                    return this.activeRowData.invoice
                }
                return null
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            'publicParam.pageSize'() {
                this.filterData()
            },
            'publicParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    var data = await this.$refs.BaseForm.submit()
                    if (this.dataList.length) {
                        if (this.dataList.findIndex(v => v.applyInstallNumber > 0) > -1) {
                            var res = await deviceInstallApi.update({
                                ...this.formData,
                                ...data,
                                details: this.dataList.filter(v => v.applyInstallNumber)
                            })
                            this.getCanApprovalCount()
                            return this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                        } else {
                            this.$message.warning('至少一项合同的申请安装数量大于0')
                        }
                    } else {
                        this.$message.warning('申请安装清单不能为空！')
                    }
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
                return Promise.reject()
            },
            // 筛选数据
            filterData() {
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await deviceInstallApi.detail(this.dataId)
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.dataList = (res.data.details || [])
                    this.$emit('data-update', this.formData)
                    this.filterData()
                    this.loading = false
                }
            },
            // 清空安装清单
            handleResetList(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.dataList = []
                this.publicParam.pageIndex = 1
                this.filterData()
            },
            // 点击新增按钮时触发
            handleAddButton() {
                this.$refs.BaseForm.validate().then(data => {
                    this.formData = {
                        ...this.formData,
                        ...data
                    }
                    this.selectDialog = {
                        type: 'salesContract',
                        title: '选择销售合同',
                        value: this.dataList.map(item => {
                            return {
                                guidId: item.contractId,
                                code: item.contractCode,
                                name: item.contractName,
                                customerId: item.customerId,
                                customerName: item.customerName,
                                sectionId: item.sectionId,
                                sectionName: item.sectionName
                            }
                        }),
                        visible: true,
                        multiple: true,
                        extendParams: {
                            productId: data.productId,
                            approvalStatus: 3,
                            filterHaveUninstallDevice: true
                        }
                    }
                })
            },
            // 更新申请安装数量
            handleUpdateCount() {
                this.formData = {
                    ...this.formData,
                    ...this.$refs.BaseForm.getFormData(),
                    count: this.dataList.reduce((a, b) => {
                        return a + b.applyInstallNumber
                    }, 0)
                }
            },
            // 点击删除按钮时触发
            handleDeleteButton(data) {
                this.dataList.splice(this.dataList.indexOf(data), 1)
                this.filterData()
            },
            // 选择合同后触发
            async handleSelectDialogChange(list) {
                this.loading = true
                try {
                    // 获取剩余可安装数量
                    let { productId } = this.formData
                    let data = await Promise.all(list.map(item => {
                        return deviceInstallApi.getCanInstallCount({
                            approvalInstallId: this.dataId,
                            contractId: item.guidId,
                            productId
                        })
                    }))
                    let dataList = list.map((item, index) => {
                        let old = this.dataList.find(v => v.contractId === item.guidId)
                        return {
                            contractId: item.guidId,
                            contractCode: item.code,
                            contractName: item.name,
                            customerId: item.customerId,
                            customerName: item.customerName,
                            sectionId: item.sectionId,
                            sectionName: item.sectionName,
                            canInstallNumber: data[index].data,
                            applyInstallNumber: old ? old.applyInstallNumber || 0 : 0
                        }
                    })
                    this.dataList = dataList
                    this.filterData()
                } catch (e) {
                    console.error(e)
                }
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
