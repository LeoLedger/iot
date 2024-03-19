<!--
* @fileName 收款记录 - 收款认领
* @author   望浩然
* @date     2021/4/28
-->

<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="收款认领"
            class="not-padding"
            width="800px"
            append-to-body>
            <div class="layout-detail-container">
                <collapse-tab-layout :show-tab="false" :collapse-list="collapseList">
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="false"
                            :disabled="false"
                            :form-data="ruleForm"
                            :customer-is-required="true"
                            @customer="handleCustomerChange"
                            @amount="handleAmountChange"
                        />
                    </template>
                    <template slot="ClaimList">
                        <ClaimList
                            :is-edit="true"
                            :data-list="listBill"
                            :basic-data="ruleForm"
                            @delete="handleDeleteRow"
                        />
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <SelectReceivableDialog
            v-if="selectRecDialog.visible"
            :visible.sync="selectRecDialog.visible"
            :data-id="selectRecDialog.dataId"
            :select-list="listBill"
            @confirm="handleSelectChange"
        />
    </div>
</template>

<script>
    import BaseForm from '../CreateCollection/BaseForm'
    import recordApi from '@/api/businessDocuments/billReceivableRecord'
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import SelectReceivableDialog from '@/views/businessAccounting/AR/collectionRecord/components/ClaimDialog/SelectReceivableDialog'
    import ClaimList from '@/views/businessAccounting/AR/collectionRecord/components/ClaimDialog/ClaimList'
    // 方法
    import rigorous from '@/utils/rigorous'
    export default {
        components: { ClaimList, CollapseTabLayout, BaseForm, SelectReceivableDialog },
        props: {
            // 数据guidId
            dataId: {
                type: String,
                default: null
            },
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                ruleForm: {},
                // 加载
                loading: false,
                collapseList: [
                    { title: '基础信息', button: false, disabled: true, slotName: 'BaseForm' },
                    { title: '收款认领核销', button: { type: 'success', text: '添加', icon: 'el-icon-plus', click: () => { this.handleClaimAdd() } }, slotName: 'ClaimList', disabled: true }
                ],
                // 核销列表
                listBill: [],
                selectRecDialog: {
                    visible: false,
                    dataId: null
                }
            }
        },
        computed: {
            isCreate() {
                return this.dataId === null
            }
        },
        watch: {
            // 监听dataId重新初始化表单数据
            dataId(val) {
                this.getDetail()
            }
        },
        mounted() {
            this.getDetail()
        },
        methods: {
            // 通过dateId获取表单数据
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    recordApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.ruleForm = res.data
                            this.selectRecDialog.dataId = res.data.customerId
                            this.listBill = res.data.listBillReceivableDetail || []
                            // 识别单据状态,如果是待认领,则客户可认领金额不变,如果是已认领则客户可认领金额需要加上当前付款金额
                            if (res.data.status >= 1) {
                                this.ruleForm.amountRemain = res.data.amountRemain + res.data.amountReceived
                            }
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleSubmit() {
                this.$refs.BaseForm.submit((data) => {
                    this.loading = true
                    const params = { ...this.ruleForm, ...data, listBillReceivableDetail: this.listBill }
                    // 不允许出现认领为0元的数据
                    const hasZero = this.listBill.findIndex(v => Number(v.amount) <= 0) > -1
                    if (hasZero) {
                        this.loading = false
                        return this.$message.warning('有账单的认领核销金额为0元,请移除或填写后重试！')
                    }
                    // 提交前先检查 认领金额的总和必须等于单据中的收款金额，不然不允许保存
                    const target = rigorous.floatAdd(Number(params.amountReceived))
                    let amount = 0
                    this.listBill.map(item => {
                        // amount += Number(item.amount)
                        amount = rigorous.floatAdd(amount, Number(item.amount))
                    })
                    // console.log(amount, target)
                    if (target !== amount) {
                        this.loading = false
                        return this.$message({ type: 'warning', message: '操作失败, 核销金额的总和(' + amount + '元)必须等于单据中的收款金额(' + target + '元)!' })
                    }
                    // 判断是第一次认领还是重新认领
                    let api = claimApi.update
                    api(params).then(res => {
                        if (res.success) {
                            this.$notify({ title: '保存成功', message: res.msg, type: 'success', duration: 2000 })
                            this.$emit('confirm')
                            this.$emit('close', true)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleSelectChange(list) {
                // list是应收账款列表, 需要处理为认领列表接口需要的数据形式
                const defaultListBill = this.listBill
                const newListBill = []
                let num = 0
                let oldNum = 0
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {}
                        // 金额
                        newItem.receivableCode = item.code
                        newItem.amount = 0
                        newItem.amountUnpaid = item.amountRemain
                        // 绑定收款记录
                        newItem.billReceivableId = item.guidId
                        newItem.billReceivableRecordId = this.ruleForm.guidId
                        newItem.remark = ''
                        newItem.costType = item.costType
                        newItem.approvalCode = item.approvalCode
                        newItem.approvalId = item.approvalId
                        newItem.contractId = item.approvalId
                        newItem._idKey = item.guidId
                        // 判断旧列表中是否已经有这条,如果有则插入旧数据, 如果无则查询新数据
                        const oldItem = defaultListBill.find(_item => _item.billReceivableId === newItem.billReceivableId)
                        if (oldItem) {
                            oldNum++
                            newListBill.push(oldItem)
                        } else {
                            num++
                            newListBill.push(newItem)
                        }
                    })
                }
                // 合并旧列表和新选择的列表
                this.listBill = newListBill
                if (num) {
                    return this.$message({ type: 'success', message: '成功添加' + num + '条应收记录!' })
                } else {
                    const removeNum = defaultListBill.length - oldNum
                    if (removeNum) return this.$message({ type: 'success', message: '移除了' + removeNum + '条应收记录!' })
                    else return this.$message({ type: 'warning', message: '没有新的应收记录被添加' })
                }
            },
            handleDeleteRow(index, row) {
                this.listBill.splice(index, 1)
            },
            handleCancel() {
                this.$emit('close', false)
            },
            handleCustomerChange(item) {
                const formData = this.$refs.BaseForm.getFormData()
                this.ruleForm = { ...this.ruleForm, ...formData, amountReceived: item.amountRemain, amountRemain: item.amountRemain }
                if (this.listBill && this.listBill.length) {
                    this.listBill = []
                    this.$message({ type: 'success', message: '由于您变更了客户, 已为您自动重置了收款认领核销明细' })
                }
            },
            handleAmountChange(val) {
                const formData = this.$refs.BaseForm.getFormData()
                this.ruleForm = { ...this.ruleForm, ...formData }
            },
            handleClaimAdd() {
                this.selectRecDialog.dataId = this.ruleForm.customerId
                this.selectRecDialog.visible = true
            }
        }
    }
</script>
