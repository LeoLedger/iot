<!--
* @description 供应商详情
* @fileName detailDialog.vue
* @author 望浩然
-->
<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="true"
        :title="'供应商详情查看'"
        width="800px"
        append-to-body
        class="not-padding"
    >
        <collapse-tab-layout
            :show-tab="true"
            :tab-list="tabList"
            style="padding: 0 0 10px 10px;">
            <template slot="BaseForm">
                <BaseForm
                    v-loading="loading"
                    v-if="visible"
                    ref="BaseForm"
                    :is-edit="true"
                    :disabled="true"
                    :form-data="formData"/>
            </template>
            <template slot="ClientContacts">
                <SupplierContacts
                    v-if="formData.guidId"
                    ref="ClientContacts"
                    :is-edit="false"
                    :customer-id="formData.guidId"
                />
                <NoData v-else text="获取列表失败, 缺少必要参数"/>
            </template>
            <template slot="SupplierProduct">
                <SupplierProduct
                    v-loading="loading"
                    v-if="productList && productList.length"
                    ref="SupplierProduct"
                    :data-list="productList"
                    :is-edit="false"
                    :data-id="dataId"
                />
                <NoData v-else text="该供应商暂未添加产品数据"/>
            </template>
            <template slot="SupplierInstall">
                <InstallProduct
                    v-loading="loading"
                    v-if="installList && installList.length"
                    ref="SupplierInstall"
                    :data-list="installList"
                    :is-edit="false"
                    :data-id="dataId"
                />
                <NoData v-else text="该供应商暂未添加产品安装服务"/>
            </template>
            <template slot="RepairList">
                <RepairList
                    v-loading="loading"
                    v-if="repairList && repairList.length"
                    ref="RepairList"
                    :data-list="repairList"
                    :is-edit="false"
                    :data-id="dataId"
                />
                <NoData v-else text="该供应商暂未添加产品维修服务"/>
            </template>
            <template slot="purchaseContract">
                <ContractList
                    v-if="formData.guidId"
                    ref="purchaseContract"
                    :supplier-id="formData.guidId"
                    style="margin-right: 10px"
                />
            </template>
            <template slot="PayList">
                <PayList
                    v-if="formData.guidId"
                    :data-id="formData.guidId"
                    :object-type="1"
                    style="margin-right: 10px"
                />
            </template>
        </collapse-tab-layout>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import BaseForm from '@/views/purchaseManagement/supplier/components/BaseForm'
    import SupplierContacts from '@/views/purchaseManagement/supplier/components/SupplierContacts'
    import SupplierProduct from '@/views/purchaseManagement/supplier/components/SupplierProduct'
    import InstallProduct from '@/views/purchaseManagement/supplier/components/InstallProduct'
    import RepairList from '@/views/purchaseManagement/supplier/components/RepairList'
    import NoData from '@/components/NoData'
    import supplierApi from '@/api/purchase/supplier'
    import productApi from '@/api/purchase/product'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import ContractList from '@/views/purchaseManagement/supplier/components/ContractList'
    import PayList from '@/views/purchaseManagement/supplier/components/PayList'
    export default {
        name: 'DetailDialog',
        components: { PayList, ContractList, CollapseTabLayout, NoData, SupplierProduct, SupplierContacts, BaseForm, InstallProduct, RepairList },
        props: {
            // 供应商guidId
            dataId: {
                type: String,
                default: null
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                formData: {},
                loading: false,
                activeTab: 0,
                productList: [],
                installList: [],
                repairList: [],
                tabList: [
                    { name: '0',
                      label: '基础信息',
                      collapseList: [
                          { title: '基础信息', disabled: true, slotName: 'BaseForm' },
                          { title: '供应商联系人', button: false, slotName: 'ClientContacts' },
                          { title: '可提供产品', button: false, slotName: 'SupplierProduct' },
                          { title: '产品安装服务', button: false, slotName: 'SupplierInstall' },
                          { title: '产品维修服务', button: false, slotName: 'RepairList' }
                      ] },
                    { name: '1', label: '采购合同', slotName: 'purchaseContract' },
                    { name: '2', label: '付款记录', slotName: 'PayList' }
                ]
            }
        },
        watch: {
            dataId() {
                this.init()
            },
            visible(val) {
                if (val) this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            // 初始化
            init() {
                this.getDetail()
            },
            // 加载供应商详情
            getDetail() {
                this.formData = {}
                this.productList = []
                if (this.dataId) {
                    this.loading = true
                    supplierApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formData = res.data
                            // 加载供应商产品列表
                            this.getSupplierProductList(res.data.guidId)
                            const { areaId, cityId, provinceId } = res.data
                            this.formData._region = [provinceId, cityId, areaId]
                            // 处理坐标字段
                            let point = {}
                            if (res.data.latitude && res.data.longitude) {
                                point = { lat: res.data.latitude, lng: res.data.longitude }
                            }
                            this.formData.point = point
                            // 获取客户列表
                            this.productList = res.data.list || []
                            this.installList = res.data.feeList || []
                            this.repairList = res.data.repairProductList || []
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            // 加载供应商产品列表
            getSupplierProductList(supplierGuidId) {
                // 加载100条,暂不做分页
                this.loading = true
                productApi.getList({ supplierId: supplierGuidId, pageSize: 100 }).then(res => {
                    this.productList = res.data.records
                    setTimeout(() => {
                        this.loading = false
                    }, 500)
                })
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
