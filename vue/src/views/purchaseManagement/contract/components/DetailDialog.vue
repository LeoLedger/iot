<!--
* @description 合同详情
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="采购合同详情"
            width="800px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div v-loading="loading">
                <el-collapse v-model="collapseValue" class="layou-collapse layout-detail-container">
                    <el-collapse-item name="1" disabled>
                        <div slot="title" class="title">
                            <div class="text">基础信息</div>
                        </div>
                        <div class="body-wrap">
                            <BaseForm
                                ref="BaseForm"
                                :form-data="formData"
                                disabled
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="2">
                        <div slot="title" class="title">
                            <div class="text">采购清单</div>
                        </div>
                        <div class="body-wrap">
                            <PurchasingList
                                ref="PurchasingList"
                                :form-data="formData"
                                :is-edit="false"
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="3">
                        <div slot="title" class="title">
                            <div class="text">付款信息</div>
                        </div>
                        <div class="body-wrap">
                            <PaymentInfo
                                ref="PaymentInfo"
                                :data-id="dataId"
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="4">
                        <div slot="title" class="title">
                            <div class="text">入库记录</div>
                        </div>
                        <div class="body-wrap">
                            <StoragePutRecord
                                ref="StoragePutRecord"
                                :data-id="dataId"
                            />
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
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
    import PaymentInfo from './PaymentInfo'
    import StoragePutRecord from './StoragePutRecord'

    export default {
        name: 'UpdateDialog',
        components: {
            BaseForm,
            PurchasingList,
            PaymentInfo,
            StoragePutRecord
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                loading: false,
                formData: {
                    prodList: []
                },
                tabActiveName: '1',
                collapseValue: ['1', '2', '3', '4']
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
                        this.formData = {
                            ...res.data,
                            _period,
                            prodList: res.data.prodList.map(item => {
                                if (item.count > 0 && item.unitPrice > 0) {
                                    item.totalAmount = rigorous.floatMul(item.count, item.unitPrice)
                                    item._totalAmount = getPriceFormat(item.totalAmount)
                                } else {
                                    item.totalAmount = 0
                                    item._totalAmount = '- -'
                                }
                                return item
                            })
                        }
                        this.handleUpdateAmount(this.formData.prodList)
                    }
                    this.loading = false
                }
            },
            // 更新合同金额
            handleUpdateAmount(list) {
                var amount = list.reduce((t, v) => {
                    return rigorous.floatAdd(t + v.totalAmount)
                }, 0)
                this.formData = {
                    ...this.formData,
                    amount: amount,
                    _amount: getPriceFormat(amount)
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
