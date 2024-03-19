<!--
* @description 产品信息
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="860px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="form-info">
                <el-tabs v-model="tabActiveName" class="layout-tabs">
                    <el-tab-pane name="1" label="基础信息">
                        <div class="container">
                            <BaseForm
                                ref="BaseForm"
                                :is-create="isCreate"
                                :form-data="formData"
                                :locked-customer="params.lockedCustomer"
                                @failure="tabActiveName = '1'"
                                @data-update="handleDataUpdate"
                            />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane name="2" label="销售和成本信息">
                        <div class="container">
                            <SaleAndCostForm
                                ref="SaleAndCostForm"
                                :category="formData.categoryId"
                                :form-data="formData.productInfo"
                                is-edit
                                @failure="tabActiveName = '2'"
                            />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane v-if="isIntellectual" name="3" label="BOM清单">
                        <div class="container">
                            <MaterialList
                                ref="MaterialList"
                                :is-edit="isEdit"
                                :is-create="isCreate"
                                :data-id="dataId"
                                @failure="tabActiveName = '3'"
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
    import productApi from '@/api/purchase/product'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import BaseForm from './BaseForm'
    import MaterialList from './MaterialList'
    import SaleAndCostForm from './SaleAndCostForm'
    // 智能产品

    export default {
        name: 'UpdateDialog',
        components: {
            BaseForm,
            MaterialList,
            SaleAndCostForm
        },
        props: {
            dataId: { type: [Number, String] },
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            params: {
                type: Object,
                default: () => {
                    return {
                        // 锁定客户,用于在客户信息中进入联系人编辑页面时
                        lockedCustomer: false,
                        // 锁定数据,作为初始值并且锁定,无法被修改
                        lockedData: {}
                    }
                }
            }
        },
        data() {
            return {
                loading: false,
                formData: {
                    productInfo: {}
                },
                tabActiveName: '1',
                intellectualCategoryId: enums.productCategoryId.find(v => v.value === 0).id
            }
        },
        computed: {
            title() {
                return this.dataId ? '编辑产品' : '新增产品'
            },
            isCreate() {
                return !this.dataId
            },
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
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.loading = false
                } else {
                    this.formData = {
                        ...this.formData,
                        ...this.params.lockedData
                    }
                }
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                this.loading = true
                try {
                    let data1 = await this.$refs.BaseForm.submit()
                    let data2 = await this.$refs.SaleAndCostForm.submit()
                    let data3 = this.isIntellectual ? await this.$refs.MaterialList.validate() : []
                    let { productInfo } = this.formData
                    var res = await productApi.update({
                        ...this.formData,
                        ...data1,
                        bomList: data3,
                        productInfo: {
                            ...productInfo,
                            ...data2
                        },
                        ...this.params.lockedData
                    })
                    this.$emit('update')
                    this.$emit('update:visible', false)
                    this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    return
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
                return Promise.reject()
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            },
            // 基础数据更新时
            handleDataUpdate(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.form-info {
    padding: 0 10px 15px 15px;
    .container{
        height: 480px;
        padding-right: 5px;
    }
}
</style>
