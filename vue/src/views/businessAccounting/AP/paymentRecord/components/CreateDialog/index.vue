<!--
* @fileName 付款记录 - 添加付款记录
* @author   望浩然
* @date     2021/4/29
-->

<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="isCreate?'添加付款记录':'修改付款记录'"
            class="not-padding"
            width="820px"
            append-to-body>
            <div class="layout-detail-container" style="overflow: hidden;padding-right: 0;height: 100%;">
                <collapse-tab-layout :show-tab="false" :collapse-list="collapseList">
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="true"
                            :disabled="false"
                            :form-data="ruleForm"
                            @objectChange="handleObjectChange"
                            @amountPayChange="handleAmountChange"
                        />
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button v-prereclick :loading="loading" size="mini" type="primary" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import recordApi from '@/api/businessDocuments/billPayRecord'
    // 组件
    import BaseForm from './BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    export default {
        components: { CollapseTabLayout, BaseForm },
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
                collapseList: this.getCollapseList
            }
        },
        computed: {
            isCreate() {
                return this.dataId === null
            },
            getCollapseList() {
                return [
                    { title: '基础信息', button: false, disabled: true, slotName: 'BaseForm' }
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
                    const res = await recordApi.detail(this.dataId)
                    if (res.success) {
                        this.ruleForm = res.data
                        this.ruleForm.listBillPayRecordRelPayable = []
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    } else {
                        this.$message({ type: 'error', message: '数据请求失败, 请重试' })
                        this.handleCancel()
                    }
                }
            },
            handleSubmit() {
                this.$refs.BaseForm.submit((data) => {
                    this.loading = true
                    const params = { ...this.ruleForm, ...data }
                    recordApi.update(params).then(res => {
                        this.loading = false
                        if (res.success) {
                            this.$notify({ title: '保存成功', message: res.msg, type: 'success', duration: 2000 })
                            this.$emit('confirm')
                            this.$emit('close', true)
                        }
                    }).catch(() => {
                      this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            // 关闭窗口
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            },
            // 更改付款对象时 更新付款金额, 重置付款明细
            handleObjectChange(item) {
                // 更新付款对象类型
                const formData = this.$refs.BaseForm.getFormData()
                formData.payObjectType = item.payObjectType
                this.ruleForm = Object.assign({}, this.ruleForm, formData)
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
