<!--
* @description 采购合同信息
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="800px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="form-info">
                <el-tabs v-model="tabActiveName" class="layout-tabs">
                    <el-tab-pane name="1" label="基础信息">
                        <div :style="{height: height}" class="container">
                            <BaseForm
                                ref="BaseForm"
                                :form-data="formData"
                                @partyB-change="handdlePartyBChange"
                            />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane name="2" label="采购清单">
                        <div :style="{height: height}" class="container">
                            <PurchasingList
                                ref="PurchasingList"
                                :form-data="formData"
                                @update="handleUpdateAmount"
                            />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import contractApi from '@/api/purchase/contract'
    // 方法
    import { getPriceFormat } from '@/utils'
    import rigorous from '@/utils/rigorous'
    // 组件
    import BaseForm from './BaseForm'
    import PurchasingList from './PurchasingList'

    export default {
        name: 'UpdateDialog',
        components: {
            BaseForm,
            PurchasingList
        },
        props: {
            visible: { type: Boolean, default: false },
            height: { type: String, default: '480px' },
            isEdit: { type: Boolean, default: false },
            dataId: { type: [Number, String] },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false,
                formData: {
                    prodList: []
                },
                tabActiveName: '1'
            }
        },
        computed: {
            title() {
                return this.dataId ? '编辑采购合同' : '添加采购合同'
            }
        },
        watch: {
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            }
        },
        mounted() {
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await contractApi.detail(this.dataId)
                    if (res.success) {
                        var _period = []
                        if (res.data.beginDate && res.data.endDate) {
                            _period = [res.data.beginDate, res.data.endDate]
                        }
                        var prodList = res.data.prodList.map(item => {
                            if (item.count > 0 && item.unitPrice > 0) {
                                item.totalAmount = rigorous.floatMul(item.count, item.unitPrice)
                                item._totalAmount = getPriceFormat(item.totalAmount)
                            } else {
                                item.totalAmount = 0
                                item._totalAmount = '- -'
                            }
                            return item
                        })
                        var amount = prodList.reduce((t, v) => {
                            return rigorous.floatAdd(t + v.totalAmount)
                        }, 0)
                        this.formData = {
                            ...res.data,
                            _period,
                            prodList,
                            amount: amount,
                            _amount: getPriceFormat(amount)
                        }
                    }
                    this.loading = false
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    if (this.$refs.PurchasingList.tableData.list.length) {
                        contractApi.update({
                            ...this.formData,
                            ...data,
                            prodList: this.$refs.PurchasingList.tableData.list
                        }).then(res => {
                            if (res.success) {
                                this.$notify({
                                    title: '保存成功',
                                    message: res.msg,
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('update')
                                this.$emit('update:visible', false)
                            }
                        }).finally(() => {
                            this.loading = false
                        })
                    } else {
                        this.loading = false
                        this.$message.warning('请至少添加一项采购清单')
                    }
                }, () => {
                    this.loading = false
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            },
            // 更新合同金额
            handleUpdateAmount(list) {
                var amount = list.reduce((t, v) => {
                    return rigorous.floatAdd(t + v.totalAmount)
                }, 0)
                this.formData = {
                    ...this.formData,
                    ...this.$refs.BaseForm.getFormData(),
                    amount: amount,
                    _amount: getPriceFormat(amount)
                }
            },
            // 合同乙方改变时触发
            handdlePartyBChange(data) {
                this.formData = {
                    ...this.formData,
                    ...data,
                    prodList: []
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.form-info {
    padding: 0 10px 15px 15px;
    .container{
        padding-right: 5px;
    }
}
</style>
