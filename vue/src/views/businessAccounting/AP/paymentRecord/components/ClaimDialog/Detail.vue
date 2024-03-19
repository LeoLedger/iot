<!--
* @fileName 付款记录 - 付款记录详情
* @author   望浩然
* @date     2021/5/14
-->

<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="付款记录详情"
            class="not-padding"
            width="820px"
            append-to-body>
            <div class="layout-detail-container" style="overflow: hidden;padding-right: 0">
                <collapse-tab-layout :show-tab="false" :collapse-list="collapseList">
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="true"
                            :disabled="true"
                            :form-data="ruleForm"
                        />
                    </template>
<!--                    <template slot="InvoiceList">-->
<!--                        <InvoiceList :data-list="invoiceList" :is-edit="false"/>-->
<!--                    </template>-->
                    <template slot="DetailList">
                        <DetailList :data-list="listBill" :is-edit="false"/>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
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
    export default {
        components: { InvoiceList, DetailList, CollapseTabLayout, BaseForm },
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
                collapseList: [
                    { title: '基础信息', button: false, disabled: true, slotName: 'BaseForm' },
                    // { title: '发票信息', button: false, slotName: 'InvoiceList', disabled: true },
                    { title: '付款明细', button: false, slotName: 'DetailList', disabled: true }
                ],
                // 核销列表
                listBill: [],
                // 发票列表
                invoiceList: []
            }
        },
        computed: {},
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
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    this.ruleForm = {}
                    this.listBill = []
                    this.invoiceList = []
                    recordApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.ruleForm = res.data
                            this.listBill = res.data.listBillPayRecordRelPayable || []
                            this.invoiceList = res.data.listInvoice || []
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            // 关闭窗口
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            }
        }
    }
</script>
