<!--
* @fileName 付款记录 - 付款记录认领
* @author   望浩然
* @date     2021/6/15
-->

<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="付款认领"
            class="not-padding"
            width="820px"
            append-to-body>
            <div class="layout-detail-container" style="overflow: hidden;padding-right: 0;height: 100%;">
                <collapse-tab-layout :show-tab="false" :collapse-list="collapseList">
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="true"
                            :disabled="true"
                            :is-claim="true"
                            :form-data="ruleForm"
                            @objectChange="handleObjectChange"
                            @amountPayChange="handleAmountChange"
                        />
                    </template>
                    <!--                    <template v-if="!isCreate" slot="InvoiceList">-->
                    <!--                        <InvoiceList-->
                    <!--                            :data-list="invoiceList"-->
                    <!--                            :is-edit="true"-->
                    <!--                            @delete="handleDeleteInvoice"-->
                    <!--                            @edit="handleEditInvoice"-->
                    <!--                        />-->
                    <!--                    </template>-->
                    <template slot="DetailList">
                        <DetailList
                            :basic-data="ruleForm"
                            :data-list="listBill"
                            :is-edit="true"
                            @delete="handleDeleteRow"/>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <InvoiceDialog
            v-if="createInvoice.visible"
            :visible.sync="createInvoice.visible"
            :row-data="createInvoice.rowData"
            :is-edit="createInvoice.isEdit"
            :max-amount="createInvoice.maxAmount"
            @close="handleDialog('createInvoice', false)"
            @confirm="handleInvoiceConfirm"
        />
        <SelectRepayDialog
            v-if="selectRecDialog.visible"
            :visible.sync="selectRecDialog.visible"
            :data-id="selectRecDialog.dataId"
            :select-list="listBill"
            @close="handleDialog('selectRecDialog', false)"
            @confirm="handleSelectChange"
        />
    </div>
</template>

<script>
    // API
    import recordApi from '@/api/businessDocuments/billPayRecord'
    // 组件
    import BaseForm from '../CreateDialog/BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import InvoiceList from '@/views/businessAccounting/AP/paymentRecord/components/ClaimDialog/InvoiceList'
    import DetailList from '@/views/businessAccounting/AP/paymentRecord/components/ClaimDialog/DetailList'
    import InvoiceDialog from '@/views/public/InvoiceDialog/index'
    import SelectRepayDialog from '@/views/businessAccounting/AP/paymentRecord/components/ClaimDialog/SelectRepayDialog'
    export default {
        components: { SelectRepayDialog, InvoiceList, DetailList, CollapseTabLayout, BaseForm, InvoiceDialog },
        props: {
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            },
            //
            dataId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                ruleForm: {},
                // 加载
                loading: false,
                collapseList: this.getCollapseList,
                // 核销列表
                listBill: [],
                // 选择应付账款窗口
                selectRecDialog: {
                    visible: false,
                    dataId: null
                },
                // 发票列表
                invoiceList: [],
                // 添加发票窗口
                createInvoice: {
                    visible: false,
                    rowData: null,
                    isEdit: false,
                    maxAmount: 0
                }
            }
        },
        computed: {
            isCreate() {
                return this.dataId === null
            },
            getCollapseList() {
                return [
                    { title: '基础信息', button: false, disabled: true, slotName: 'BaseForm' },
                    // { title: '发票信息',
                    //   button: { type: 'success', text: '添加', icon: 'el-icon-plus', click: () => { this.handleDialog('createInvoice', true) } },
                    //   slotName: 'InvoiceList',
                    //   visible: !this.isCreate,
                    //   disabled: true },
                    { title: '付款认领核销', button: { type: 'success', text: '添加', icon: 'el-icon-plus', click: () => { this.handleDialog('selectRecDialog', true) } }, slotName: 'DetailList', disabled: true }
                ]
            }
        },
        watch: {
            // 监听dataId重新初始化表单数据
            dataId: {
                immediate: true,
                handler() {
                    this.collapseList = this.getCollapseList
                    this.getDetail()
                }
            }
        },
        mounted() {
            this.getDetail()
        },
        methods: {
            async getDetail() {
                if (this.dataId) {
                    this.loading = true
                    this.ruleForm = {}
                    this.listBill = []
                    this.invoiceList = []
                    const res = await recordApi.detail(this.dataId)
                    if (res.success) {
                        this.ruleForm = res.data
                        this.listBill = res.data.listBillPayRecordRelPayable || []
                        this.listBill.map(item => {
                            item._idKey = item.billPayId
                        })
                        // 识别单据状态,如果是待认领,则客户可认领金额不变,如果是已认领则客户可认领金额需要加上当前付款金额
                        if (res.data.status >= 1) {
                            this.ruleForm.amountUnpaid = res.data.amountUnpaid + res.data.amountPay
                        }
                        this.invoiceList = res.data.listInvoice || []
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    } else {
                        this.$message({ type: 'error', message: '数据请求失败, 请重试' })
                        this.handleCancel()
                    }
                } else {
                    this.$message({ type: 'error', message: '缺少必要参数, 请重试' })
                    this.handleCancel()
                }
            },
            handleSubmit() {
                this.$refs.BaseForm.submit((data) => {
                    this.loading = true
                    const params = { ...this.ruleForm, ...data, listBillPayRecordRelPayable: this.listBill, listInvoice: this.invoiceList }
                    // 不允许出现认领为0元的数据
                    const hasZero = this.listBill.findIndex(v => Number(v.amount) <= 0) > -1
                    if (hasZero) {
                        this.loading = false
                        return this.$message.warning('有账单的核销金额为0元,请移除或填写后重试！')
                    }
                    // 提交前检查
                    const target = Number(params.amountPay)
                    // // 1.发票的金额综合不得大于单据的付款金额
                    // let invAmount = 0
                    // this.invoiceList.map(item => {
                    //     invAmount += Number(item.amount)
                    // })
                    // if (target < invAmount) {
                    //     this.loading = false
                    //     return this.$message({ type: 'warning', message: '操作失败, 添加的发票合计金额(' + invAmount + '元)不得超过单据中的付款金额(' + target + '元)!' })
                    // }
                    // 2.核销金额的总和必须等于单据中的付款金额，不然不允许保存
                    let amount = 0
                    this.listBill.map(item => {
                        amount += Number(item.amount)
                    })
                    if (target !== amount) {
                        this.loading = false
                        return this.$message({ type: 'warning', message: '操作失败, 付款明细的核销金额总和(' + amount + '元)必须等于单据中的付款金额(' + target + '元)!' })
                    }
                    // 判断是第一次认领还是重新认领
                    let api = recordApi.update
                    api(params).then(res => {
                        if (res.success) {
                            this.$notify({ title: '保存成功', message: res.msg, type: 'success', duration: 2000 })
                            this.$emit('confirm')
                            this.$emit('close', true)
                        }
                        this.loading = false
                    }).catch(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleSelectChange(list) {
                // list是应收账款列表, 需要处理为认领列表接口需要的数据形式
                const defaultListBill = JSON.parse(JSON.stringify(this.listBill))
                const newListBill = []
                let num = 0
                let oldNum = 0
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            recordCode: this.ruleForm.code, // 付款流水
                            billPayCode: item.code, // 账单编号
                            payType: item.payType, // 费用类型
                            amountUnpaid: item.amountUnpaid, // 剩余应付金额
                            amount: 0, // 付款核销金额
                            // 绑定付款记录
                            billPayId: item.guidId,
                            billPayRecordId: this.ruleForm.guidId || '',
                            remark: '',
                            _idKey: item.guidId,
                            contractId: item.contractId,
                            // 后端处理所需标识
                            flag: 1
                        }
                        // 判断旧列表中是否已经有这条,如果有则插入旧数据, 如果无则查询新数据
                        const oldItem = defaultListBill.find(_item => _item.billPayId === newItem.billPayId)
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
                    return this.$message({ type: 'success', message: '成功添加' + num + '条付款记录!' })
                } else {
                    const removeNum = defaultListBill.length - oldNum
                    if (removeNum) return this.$message({ type: 'success', message: '移除了' + removeNum + '条付款记录!' })
                    else return this.$message({ type: 'warning', message: '没有新的付款记录被添加' })
                }
            },
            // 删除添加的付款明细
            handleDeleteRow(index, row) {
                // 后端会自动检查数据库已有明细, 将没有传过去的数据当做删除, 所以前端无需区分添加时删除和修改时删除
                this.listBill.splice(index, 1)
            },
            // 删除添加的发票
            handleDeleteInvoice(index) {
                // 后端会自动检查数据库已有明细, 将没有传过去的数据当做删除, 所以前端无需区分添加时删除和修改时删除
                this.invoiceList.splice(index, 1)
            },
            // 修改发票
            handleEditInvoice(index) {
                this.createInvoice.rowData = this.invoiceList[index]
                this.createInvoice.rowData._index = index
                this.createInvoice.isEdit = true
                this.createInvoice.visible = true
                this.createInvoice.maxAmount = this.ruleForm.amountPay
            },
            // 关闭窗口
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            },
            // 确认添加发票
            handleInvoiceConfirm(row) {
                if (row._index > -1) {
                    this.invoiceList = this.invoiceList.map((item, index) => {
                        if (String(index) === String(row._index)) {
                            return Object.assign(item, row)
                        } else return item
                    })
                } else {
                    this.invoiceList.push(row)
                }
            },
            // 子窗口 - 开关处理器
            handleDialog(name, bol) {
                const formData = this.$refs.BaseForm.getFormData()
                // 添加发票或明细都需要填写付款记录
                if (formData && !formData.amountPay && bol) {
                    return this.$message({ type: 'warning', message: '请先填写付款金额' })
                }
                if (name === 'selectRecDialog' && bol) {
                    // 如果是选择应付账款,必须先选择付款对象
                    if (formData && formData.payObjectId) {
                        this.selectRecDialog.dataId = formData.payObjectId
                    } else return this.$message({ type: 'warning', message: '请先选择付款对象' })
                }
                if (name === 'createInvoice' && bol) {
                    this.createInvoice.isEdit = false
                    this.createInvoice.rowData = null
                    this.createInvoice.maxAmount = Number(this.ruleForm.amountPay)
                }
                if (this[name]) {
                    this[name].visible = bol
                }
            },
            // 更改付款对象时 更新付款金额, 重置付款明细
            handleObjectChange(item) {
                // 更新付款对象类型
                const formData = this.$refs.BaseForm.getFormData()
                formData.payObjectType = item.payObjectType
                this.ruleForm = Object.assign({}, this.ruleForm, formData)
                // 判断是否弹出重置提示
                if (this.listBill && this.listBill.length) {
                    this.listBill = []
                    this.selectRecDialog.dataId = null
                    // 弹出提醒
                    this.$notify({ title: '付款明细重置', message: '由于您变更了付款对象, 已清空付款明细, 请重新添加', type: 'success', duration: 3000 })
                }
                // 清空付款金额
                this.ruleForm = { ...this.ruleForm, ...formData, amountPay: item.amountUnpaid, amountUnpaid: item.amountUnpaid }
            },
            // 付款金额变化时
            handleAmountChange(val) {
                if (val !== '' && val !== null) {
                    const formData = this.$refs.BaseForm.getFormData()
                    formData.amountPay = val
                    this.ruleForm = Object.assign({}, this.ruleForm, formData)
                }
            }
        }
    }
</script>
