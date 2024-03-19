<!--
* @description 退还押金
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
                        :disabled="!isCreate && !isUpdate"
                        :extend-params="extendParams"
                        @section="handleSectionChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">押金退还明细</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        empty-hide-table
                    />
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 配置退库清单 -->
        <ReturnListDialog
            v-if="returnListDialog.visible"
            :row-data="activeRowData"
            :basic-data="formData"
            :visible.sync="returnListDialog.visible"
            :show-action="false"
            :is-approval="false"
            :process-index="processIndex"
            :is-create="false"
        />
    </div>
</template>

<script>
    // API
    import mainApi from '@/api/businessDocuments/returnCashPledge'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import ReturnListDialog from './ReturnListDialog'
    import { getNumberFormat } from '@/utils'

    export default {
        components: {
            BaseForm,
            ReturnListDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isUpdate: { type: Boolean, default: false },
            jsonData: { type: [Object, Array] },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: false
                    }
                },
                collapseValue: ['1', '2'],
                activeRowData: null,
                returnListDialog: {
                    visible: false
                }
            }
        },
        computed: {
            // 是否可以修改列表
            isEditList() {
                return this.isCreate || this.isUpdate || ((this.processIndex === 1 || this.processIndex === 2) && this.isApproval)
            },
            isCreate() {
                return !this.dataId
            },
            tableColumns() {
                return [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 100
                    },
                    {
                        prop: 'productType',
                        label: '产品类型',
                        minWidth: 100,
                        type: 'dict',
                        dictType: 'productType'
                    },
                    {
                        prop: 'countApply',
                        label: '清点退库数量',
                        width: 100,
                        isCopy: false,
                        isClick: true,
                        onClick: (row) => {
                            this.handleApplyDevice(row)
                        },
                        align: 'right'
                    },
                    {
                        prop: 'amountCashPledge',
                        label: '设备合同押金(元)',
                        width: 120,
                        align: 'right',
                        type: 'money'
                    },
                    {
                        prop: 'amountActual',
                        label: '实收押金(元)',
                        width: 90,
                        align: 'right',
                        type: 'money'
                    },
                    {
                        prop: 'amountDeduct',
                        label: '扣除押金(元)',
                        width: 110,
                        align: 'right',
                        type: 'money',
                        render: this.isEditList && ((h, { row, column }) => {
                            const form = {
                                min: 0,
                                prop: 'amountDeduct',
                                moneyInWords: false
                            }
                            return (
                            <money-input
                              params={row}
                              form={form}
                              disabled={!this.isEditList}
                              placeholder={'请输入' + column.label}
                              onInput={(val) => { this.updateRowDeductAmount(row, column.prop, val) }}
                            />
                          )
                        })
                    },
                    {
                        prop: 'amount',
                        label: '申请退还(元)',
                        width: 90,
                        align: 'right',
                        type: 'money'
                    }
                ]
            }
        },
        watch: {
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            processIndex() {
                this.$set(this.tableData, 'columns', this.tableColumns)
            }
        },
        mounted() {
            this.$set(this.tableData, 'columns', this.tableColumns)
        },
        methods: {
            // 点击提交按钮时触发
            submit(callback, errorCallback) {
                if (this.tableData.list.length) {
                    this.loading = true
                    this.$refs.BaseForm.submit((data) => {
                        mainApi.update({
                            ...this.formData,
                            ...data,
                            prodList: this.tableData.list
                        }).then(res => {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.getCanApprovalCount()
                            callback && callback()
                        }).catch(() => {
                            errorCallback && errorCallback()
                        }).finally(() => {
                            this.loading = false
                        })
                    }, () => {
                        this.loading = false
                        errorCallback && errorCallback()
                    })
                } else {
                    this.$message.warning('无可退押金，无法提交')
                    errorCallback && errorCallback()
                }
            },
            // 获取基础信息
            async queryBaseInfo() {
                console.log()
                // 如果是创建,则从标段接口中获取列表
                if (!this.dataId) {
                    if (this.formData.sectionId) {
                        this.loading = true
                        const res = await mainApi.getProdList(this.formData.sectionId)
                        // 初始的可退库数量默认填充
                        this.tableData.list = res.data.map(item => {
                            return { ...item, countApply: item.count - item.countIng, deviceList: [], countApply_: 0 }
                        })
                        this.$emit('data-update', this.formData)
                        this.loading = false
                    }
                } else {
                    // 如果是编辑,则从详情接口获取列表
                    this.loading = true
                    var res = await mainApi.detail(this.dataId)
                    if (res.success) {
                        // 获取清单下的设备列表
                        this.formData = {
                            ...this.formData,
                            ...res.data
                        }
                        this.tableData.list = res.data.prodList
                        this.$emit('data-update', this.formData)
                        this.$emit('update:jsonData', this.tableData.list)
                    }
                    this.loading = false
                }
            },
            // 标段发生改变
            handleSectionChange(item) {
                console.log(item)
                // 标段改变,自动改变项目和企业
                const formData = this.$refs.BaseForm.getFormData()
                const newData = {
                    sectionId: item.guidId,
                    sectionName: item.name,
                    projectId: item.projectId,
                    projectName: item.projectName,
                    customerId: item.customerId,
                    customerName: item.customerName
                }
                this.formData = { ...formData, ...newData }
                // 标段改变,自动获取标段下的可退库产品列表
                this.loading = true
                mainApi.getProdList(item.guidId).then(res => {
                    // 更新列表显示
                    this.tableData.list = res.data
                    if (res.data && res.data.length) {
                        // // 更新总押金
                        let applyAmount = 0
                        res.data.map(item => {
                            applyAmount += Number(item.amount)
                        })
                        this.formData.applyAmount = Number(applyAmount).toFixed(2)
                        // 更新列表项
                        this.$set(this.tableData, 'columns', this.tableColumns)
                        this.$message({ type: 'success', message: '已获取到该标段下的可退押金列表' })
                    } else {
                        this.formData.applyAmount = 0
                        // 更新列表项
                        this.$set(this.tableData, 'columns', this.tableColumns)
                        this.$message({ type: 'warning', message: '该标段下没有可退押金' })
                    }
                    this.loading = false
                })
            },
            // 查看申请退库设备列表
            handleApplyDevice(row) {
                this.activeRowData = row
                if (row.approvalDeviceReturnProdId) {
                    mainApi.getDeviceList(row.approvalDeviceReturnProdId).then(res => {
                        this.activeRowData.deviceList = res.data
                        this.returnListDialog.visible = true
                    })
                }
            },
            // 更新行总价
            updateRowDeductAmount(row, prop, val) {
                // 数据绑定
                row[prop] = val
                // 更新退还金额=实收押金-扣除押金
                let amount = Number(row.amountActual) - Number(row.amountDeduct)
                if (amount <= 0) {
                    amount = 0
                }
                row.amount = Number(amount).toFixed(2)
                // this.$set(row, 'amount', Number(amount).toFixed(2))
                // 更新表单总价
                this.updateBase()
            },
            updateBase() {
                // 计算
                let applyAmount = 0
                this.tableData.list.map(item => {
                    applyAmount += Number(item.amount)
                })
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData, applyAmount: Number(applyAmount).toFixed(2) }
                this.$emit('data-update', this.formData)
                this.$emit('update:jsonData', this.tableData.list)
            }
        }
    }
</script>

<style lang='scss' scoped>
.input-dialog {
    padding: 20px 0;
    .text {
        margin-bottom: 15px;
    }
}
</style>
