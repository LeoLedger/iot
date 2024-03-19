<!--
* @fileName 收款记录 - 登记收款记录
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
            title="登记收款"
            width="820px"
            class="not-padding"
            append-to-body>
            <div class="layout-detail-container">
                <BaseForm
                    ref="BaseForm"
                    :is-edit="true"
                    :form-data="ruleForm"
                    :customer-is-required="false"
                    @customer="handleCustomerChange"/>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    import recordApi from '@/api/businessDocuments/billReceivableRecord'
    import customerApi from '@/api/PM/customer'
    export default {
        components: { BaseForm },
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
                loading: false
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
                    recordApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            // 查询客户的剩余应收金额
                            this.ruleForm = res.data
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    recordApi.update({
                        ...this.ruleForm,
                        ...data
                    }).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
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
            handleCancel() {
                this.$emit('close', false)
            },
            handleCustomerChange(item) {
                const formData = this.$refs.BaseForm.getFormData()
                this.ruleForm = { ...this.ruleForm, ...formData, amountReceived: item.amountRemain, amountRemain: item.amountRemain }
            }
        }
    }
</script>
