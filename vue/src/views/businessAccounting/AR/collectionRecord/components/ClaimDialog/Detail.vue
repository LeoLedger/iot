<!--
* @fileName 收款记录 - 收款认领详情
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
            title="收款认领详情"
            class="not-padding"
            width="820px"
            append-to-body>
            <div class="layout-detail-container">
                <collapse-tab-layout :show-tab="false" :collapse-list="collapseList">
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="false"
                            :disabled="true"
                            :form-data="ruleForm"/>
                    </template>
                    <template slot="ClaimList">
                        <ClaimList
                            :data-list="listBill"
                            :is-edit="false"
                        />
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
    import BaseForm from '../CreateCollection/BaseForm'
    import recordApi from '@/api/businessDocuments/billReceivableRecord'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import ClaimList from '@/views/businessAccounting/AR/collectionRecord/components/ClaimDialog/ClaimList'
    export default {
        components: { ClaimList, CollapseTabLayout, BaseForm },
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
                    { title: '收款认领核销', button: false, slotName: 'ClaimList', disabled: true }
                ],
                // 核销列表
                listBill: []
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
            // 通过dateId获取表单数据
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    this.ruleForm = {}
                    this.listBill = []
                    recordApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.ruleForm = res.data
                            this.listBill = res.data.listBillReceivableDetail
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleDeleteRow(index, row) {
                this.listBill.splice(index, 1)
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            }
        }
    }
</script>
