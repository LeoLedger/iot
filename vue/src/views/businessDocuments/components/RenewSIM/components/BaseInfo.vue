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
                        :disabled="!isUpdate && !isCreate"
                        @supplier="handleSupplierChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">续期明细</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-button
                                type=""
                                size="mini"
                                icon="el-icon-setting"
                                @click="handleConfigButton(row, true)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 配置续期SIM卡清单 -->
        <RenewListDialog
            v-if="renewListDialog.visible"
            :row-data="activeRowData"
            :basic-data="formData"
            :visible.sync="renewListDialog.visible"
            :show-action="renewListDialog.showAction"
            :is-approval="isApproval"
            :process-index="processIndex"
            :is-create="isCreate"
            @change="handleListChange"
        />
    </div>
</template>

<script>
    // API
    import mainApi from '@/api/businessDocuments/renewSIM'
    import productApi from '@/api/purchase/product'
    // 方法
    import { getNumberFormat } from '@/utils'
    // 组件
    import BaseForm from './BaseForm'
    import RenewListDialog from '@/views/businessDocuments/components/RenewSIM/components/RenewListDialog'

    export default {
        components: {
            BaseForm,
            RenewListDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
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
                    columns: [
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
                            prop: 'count',
                            label: '续期数量',
                            width: 100,
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.handleConfigButton(row, false)
                            },
                            align: 'center'
                        },
                        {
                            prop: 'renewalYear',
                            label: '续期时长(年)',
                            width: 100,
                            render: (h, { row, column }) => {
                                return (
                            <el-input-number
                              style='width: 100%'
                              disabled={!this.isCreate && !this.isUpdate}
                              controls={false}
                              step={1}
                              value={row[column.prop]}
                              // onInput={(val) => { this.updateRowTotalAmount(row, column.prop, val) }}
                            />
                          )
                            }
                        },
                        {
                            prop: 'unitPrice',
                            label: '单价(元)',
                            width: 100,
                            render: (h, { row, column }) => {
                                const form = {
                                    min: 0,
                                    prop: 'unitPrice',
                                    moneyInWords: false
                                }
                                return (
                                <money-input
                                  params={row}
                                  form={form}
                                  disabled={!this.isCreate && !this.isUpdate}
                                  placeholder={'请输入' + column.label}
                                  onInput={(val) => { this.updateRowTotalAmount(row, column.prop, val) }}
                                />
                              )
                            }
                        },
                        {
                            prop: 'totalAmount',
                            label: '总价(元)',
                            width: 120,
                            type: 'money'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isUpdate || this.isCreate
                    }
                },
                activeRowData: null,
                collapseValue: ['1', '2'],
                renewListDialog: {
                    visible: false,
                    showAction: false
                }
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                    this.tableData.operates.show = this.isUpdate || this.isCreate
                }
            },
            processIndex: {
                immediate: true,
                handler() {
                    this.updateTableConfig()
                }
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            submit(callback, errorCallback) {
                this.loading = true
                // 判断续期数量是否大于0
                const validateCount = this.tableData.list.findIndex(item => item.count > 0) > -1
                // 判断续期费用是否大于0
                const validateAmount = this.tableData.list.findIndex(item => item.totalAmount > 0) > -1
                if (!validateCount || !validateAmount) {
                    errorCallback && errorCallback()
                    this.loading = false
                    return this.$message.warning('续期费用或续期SIM卡数量不得为0')
                }
                if (this.tableData.list.length) {
                    this.$refs.BaseForm.submit((data) => {
                        mainApi.update({
                            ...this.formData,
                            ...data,
                            products: this.tableData.list
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
                    this.$message.warning('缺少退库产品清单，无法提交')
                    errorCallback && errorCallback()
                }
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await mainApi.detail(this.dataId)
                    if (res.success) {
                        this.formData = {
                            ...this.formData,
                            ...res.data
                        }
                        await Promise.all(res.data.products.map(item => this.queryDeviceList(item)))
                        this.tableData.list = res.data.products || []
                        this.$emit('data-update', this.formData)
                        this.$emit('update:jsonData', this.formData.products)
                    }
                    this.loading = false
                }
            },
            // 获取清单下的设备
            async queryDeviceList(data) {
                if (data.count) {
                    const res = await mainApi.getDeviceList({ simRenewProdGuid: data.guidId, pageSize: -1 })
                    data.devices = res.data.records
                }
            },
            // 更新表格配置
            updateTableConfig() {},
            // 供应商变更时
            handleSupplierChange(item) {
                const supplierId = item.guidId
                productApi.getList({
                    supplierId,
                    categoryId: 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7',
                    filterHaveSimDevice: true
                }).then(res => {
                    if (res.success && res.data && res.data.total) {
                        const products = res.data.records.map(item => {
                            return {
                                count: 0,
                                devices: [],
                                approvalSimRenewId: this.formData.guidId || '',
                                remark: '',
                                renewalYear: 1,
                                totalAmount: 0,
                                productType: item.type || 0,
                                productCode: item.code,
                                productId: item.guidId,
                                unitPrice: item.purchaseCost || 0
                            }
                        })
                        // 将产品清单赋值给数据模型
                        const formData = this.$refs.BaseForm.getFormData()
                        formData.products = products
                        // 更新数据模型
                        this.formData = Object.assign({}, this.formData, formData)
                        // 重置SIM卡总数 总金额
                        this.formData.count = 0
                        this.formData.amount = 0
                        // 更新列表数据
                        this.tableData.list = this.formData.products
                        this.$message({ type: 'success', message: '已成功获取供应商下的SIM卡产品清单' })
                    } else {
                        this.tableData.list = []
                        this.$message({ type: 'warning', message: '该供应商下没有SIM卡产品' })
                    }
                })
            },
            // 点击配置按钮时触发
            handleConfigButton(data, showAction) {
                this.activeRowData = data
                this.renewListDialog.visible = true
                this.renewListDialog.showAction = showAction
            },
            //* 续期SIM卡清单更新时触发
            handleListChange(list) {
                const price = this.activeRowData.unitPrice || 0
                this.activeRowData = Object.assign(this.activeRowData, {
                    count: list.length, // 更新续期数量
                    renewalYear: this.activeRowData.renewalYear || 1, // 初始化续期时长
                    totalAmount: (this.activeRowData.renewalYear || 1) * list.length * price, // 更新总价
                    devices: list // 更新设备列表
                })
                // 更新数据模型
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData, products: this.tableData.list }
                // 更新基础信息里的续期SIM卡数量和续期费用
                this.updateBase()
                // 更新数据给流程组件
                this.$emit('update:jsonData', this.formData)
            },
            // 更新申请单的续期SIM卡数量和费用
            updateBase() {
                // 计算
                let amount = 0
                let count = 0
                this.tableData.list.map(item => {
                    count += item.count
                    amount += Number(item.totalAmount)
                })
                // this.formData.amount = amount
                // // this.formData.count = count
                // this.$set(this.formData, 'amount', amount)
                // this.$set(this.formData, 'count', count)
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData, amount: amount.toFixed(2), count }
                this.$emit('data-update', this.formData)
                this.$emit('update:jsonData', this.tableData.list)
            },
            // 更新行总价
            updateRowTotalAmount(row, prop, val) {
                // 如果是续期时长,自动取整
                if (prop === 'renewalYear') {
                    row[prop] = parseInt(val)
                } else {
                    // 数据绑定
                    row[prop] = val
                }
                // 更新行总价
                // const totalAmount = Number(row.unitPrice) * Number(row.renewalYear) * Number(row.count)
                const totalAmount = Number(row.unitPrice) * Number(row.count) // 总价=数量*单价
                this.$set(row, 'totalAmount', totalAmount.toFixed(2))
                // 更新表单总价
                this.updateBase()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
