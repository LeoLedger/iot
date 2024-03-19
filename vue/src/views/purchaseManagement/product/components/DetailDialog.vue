<!--
* @description 产品信息
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="产品信息"
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
                            <div class="text">销售和成本信息</div>
                        </div>
                        <div class="body-wrap">
                            <SaleAndCostForm
                                ref="SaleAndCostForm"
                                :form-data="formData.productInfo"
                                disabled
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item v-if="isIntellectual" name="3">
                        <div slot="title" class="title">
                            <div class="text">物料清单</div>
                        </div>
                        <div class="body-wrap">
                            <MaterialList
                                ref="MaterialList"
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
    import productApi from '@/api/purchase/product'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import BaseForm from './BaseForm'
    import MaterialList from './MaterialList'
    import SaleAndCostForm from './SaleAndCostForm'

    export default {
        name: 'UpdateDialog',
        components: {
            BaseForm,
            MaterialList,
            SaleAndCostForm
        },
        props: {
            dataId: { type: [Number, String] },
            visible: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                formData: {
                    productInfo: {}
                },
                collapseValue: ['1', '2', '3'],
                intellectualCategoryId: enums.productCategoryId.find(v => v.value === 0).id
            }
        },
        computed: {
            isIntellectual() {
                return this.formData.categoryId === this.intellectualCategoryId
            }
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
                    var res = await productApi.detail(this.dataId)
                    var { productInfo } = res.data
                    if (productInfo) {
                        productInfo.empowerName = (this.getDict('empowerIp').find(v => v.value === productInfo.empowerIp) || {}).label || ''
                    }
                    this.formData = { ...res.data }
                    this.loading = false
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
