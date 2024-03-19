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
                        @section-change="handleSectionChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">退费清单</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :page-index.sync="pageParam.pageIndex"
                        :page-size.sync="pageParam.pageSize"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-setting"
                                style="height: 28px"
                                @click="handleConfigButton(row)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <ConfigDialog
            v-if="configDialog.visible"
            v-bind="configDialog"
            :visible.sync="configDialog.visible"
            @change="handleConfigDialogChange"
        />
    </div>
</template>

<script>
    // API
    import serviceChargeRefundApi from '@/api/businessDocuments/serviceChargeRefund'
    // 方法
    import moment from 'moment'
    // 组件
    import BaseForm from './BaseForm'
    import ConfigDialog from './ConfigDevice/ConfigDialog'

    export default {
        components: {
            BaseForm,
            ConfigDialog
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
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 100
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 120
                        },
                        {
                            prop: 'count',
                            label: '可退费设备数量',
                            minWidth: 110,
                            isCopy: false,
                            isClick: true,
                            onClick: (data) => {
                                this.configDialog = {
                                    visible: true,
                                    rowData: data,
                                    billsData: this.formData
                                }
                            }
                        },
                        {
                            type: 'dict',
                            dictType: 'salesType',
                            label: '销售类型',
                            prop: 'sectionSalesType',
                            minWidth: 80
                        },
                        {
                            type: 'date',
                            prop: 'serviceEndDate',
                            label: '服务截止日期',
                            width: 100
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '可退服务费',
                            width: 90
                        },
                        {
                            type: 'date',
                            prop: 'serviceChangeEndDate',
                            label: '变更服务截止日期',
                            width: 150,
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <el-date-picker
                                        value={row[key]}
                                        type='date'
                                        format='yyyy-MM-dd'
                                        value-format='yyyy-MM-dd HH:mm:ss'
                                        placeholder='请选择'
                                        clearable={false}
                                        onInput={res => {
                                            this.handleServiceDateChange(row, res)
                                        }}
                                        style='width: 100%'
                                    />
                                )
                            })
                        },
                        {
                            type: 'money',
                            prop: 'applyAmount',
                            label: '申请退款金额',
                            width: 150,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => {
                                            row[column.prop] = res
                                            this.updateBaseFormExpenses()
                                        }}
                                        placeholder='申请退款金额'
                                        min={0}
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
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                pageParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                configDialog: {
                    visible: false
                },
                activeRowData: null,
                collapseValue: ['1', '2']
            }
        },
        computed: {
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            'pageParam.pageSize'() {
                this.filterData()
            },
            'pageParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            async submit() {
                let data = await this.$refs.BaseForm.submit()
                if (this.dataList.findIndex(v => v.serviceChangeEndDate !== v.serviceEndDate) > -1) {
                    this.loading = true
                    try {
                        let res = await serviceChargeRefundApi.update({
                            ...this.formData,
                            ...data,
                            prodList: this.dataList.map(item => {
                                item = { ...item }
                                item.deviceIds = item.deviceIds.filter(v => v.flag === 0).map(v => v.id)
                                return item
                            })
                        })
                        this.getCanApprovalCount()
                        this.$notify({
                            title: '保存成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                    } catch (e) {
                        console.error(e)
                    }
                    this.loading = false
                } else {
                    this.$message.warning('请至少变更一项产品的服务截至日期！')
                    return Promise.reject()
                }
            },
            // 筛选数据
            filterData() {
                var pageSize = this.pageParam.pageSize
                var pageIndex = this.pageParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    let { data: data1 } = await serviceChargeRefundApi.detail(this.dataId)
                    if (this.isEdit) {
                        let { data: data2 } = await serviceChargeRefundApi.getDeviceList(data1.sectionId)
                        this.dataList = data1.prodList.map(prod1 => {
                            let prod2 = data2.find(v => v.productId === prod1.productId && v.sectionSalesType === prod1.sectionSalesType)
                            if (prod2) {
                                prod1.deviceIds = prod2.deviceIds.map(id => {
                                    return {
                                        id,
                                        flag: prod1.deviceIds.includes(id) ? 0 : 1
                                    }
                                })
                            }
                            return prod1
                        })
                    } else {
                        this.dataList = data1.prodList.map(item => {
                            item.deviceIds = item.deviceIds.map(id => {
                                return {
                                    id,
                                    flag: 0
                                }
                            })
                            return item
                        })
                    }
                    this.formData = {
                        ...this.formData,
                        ...data1
                    }
                    this.$emit('data-update', this.formData)
                    this.$emit('update:jsonData', this.dataList.map(item => {
                        return {
                            ...item,
                            deviceIds: item.deviceIds.map(v => v.id)
                        }
                    }))
                    this.filterData()
                    this.updateBaseFormExpenses()
                    this.loading = false
                }
            },
            // 获取设备列表
            async queryDeviceList() {
                this.loading = true
                var res = await serviceChargeRefundApi.getDeviceList(this.formData.sectionId)
                this.dataList = res.data.filter(item => item.serviceEndDate).map(item => {
                    item.deviceIds = item.deviceIds.map(v => {
                        return { id: v, flag: 0 }
                    })
                    item.applyAmount = 0
                    item.dailyServiceFee = item.dailyServiceFee || 0
                    item.serviceEndDate = moment(item.serviceEndDate).format('YYYY-MM-DD HH:mm:ss')
                    item.serviceChangeEndDate = item.serviceEndDate
                    return item
                })
                this.filterData()
                this.updateBaseFormExpenses()
                this.loading = false
            },
            // 更新退款金额
            updateRefundAmount(data) {
                let date1 = moment(data.serviceEndDate)
                let date2 = moment(data.serviceChangeEndDate)
                let day = date1.diff(date2, 'day')
                data.amount = date1.diff(moment(), 'day') * data.dailyServiceFee * data.count
                data.applyAmount = data.dailyServiceFee * data.count * day
                data.applyAmount = Number(data.applyAmount.toFixed(2))
                this.updateBaseFormExpenses()
            },
            // 更新基础表单费用
            updateBaseFormExpenses() {
                this.formData = {
                    ...this.formData,
                    dailyServiceFee: this.dataList.reduce((a, b) => {
                        return a + (b.amount || 0)
                    }, 0),
                    amountApply: this.dataList.reduce((a, b) => {
                        return a + (b.applyAmount || 0)
                    }, 0)
                }
            },
            // 点击配置按钮时触发
            handleConfigButton(data) {
                this.configDialog = {
                    isEdit: true,
                    visible: true,
                    rowData: data,
                    billsData: this.formData
                }
                this.activeRowData = data
            },
            // 标段改变时触发
            handleSectionChange(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.queryDeviceList()
            },
            // 服务日期改变时触发
            handleServiceDateChange(data, value) {
                var date1 = moment(data.serviceEndDate)
                var date2 = moment(value)
                if (date2.isAfter(date1)) {
                    this.$message.warning('变更服务截止日期不能晚于服务截止日期！')
                } else if (date2.isBefore(moment({ h: 0, m: 0, s: 0 }))) {
                    this.$message.warning('变更服务截止日期不能早于今天！')
                } else {
                    data.serviceChangeEndDate = value
                    this.updateRefundAmount(data)
                }
            },
            // 配置退费设备后触发
            handleConfigDialogChange(list) {
                this.activeRowData.count = list.filter(v => v.flag === 0).length
                this.activeRowData.deviceIds = list
                this.updateRefundAmount(this.activeRowData)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
