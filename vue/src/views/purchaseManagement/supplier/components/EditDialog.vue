
<!--
* @description 供应商编辑/添加
* @fileName editDialog.vue
* @author 望浩然
-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="dialogTitle"
            class="not-padding"
            width="800px"
            append-to-body
        >
            <div class="layout-detail-container">
                <BaseForm
                    v-if="visible"
                    ref="BaseForm"
                    :is-edit="true"
                    :disabled="false"
                    :is-create="isCreate"
                    :form-data="defaultFormModel"
                    :rel-dept-id="defaultFormModel.relDeptId"/>
                <!--                <template v-if="defaultFormModel.guidId && !isCreate">-->
                <!--                    <div class="greyLabel">-->
                <!--                        <div class="greyLabel-title">供应商联系人</div>-->
                <!--                        <el-button type="success" size="mini" icon="el-icon-plus" @click="showContacts">添加</el-button>-->
                <!--                    </div>-->
                <!--                    <SupplierContacts-->
                <!--                        ref="ClientContacts"-->
                <!--                        :is-edit="true"-->
                <!--                        :customer-id="defaultFormModel.guidId"-->
                <!--                    />-->
                <!--                </template>-->
                <template v-if="defaultFormModel.guidId && !isCreate">
                    <div class="greyLabel" style="margin-top: 10px">
                        <div class="greyLabel-title">可提供产品</div>
                        <div>
                            <el-button type="success" size="mini" icon="el-icon-plus" @click="onClickAddProduct">添加</el-button>
                        </div>
                    </div>
                    <SupplierProduct
                        v-loading="loading"
                        v-if="visible"
                        ref="SupplierProduct"
                        :data-list="productList"
                        :is-edit="true"
                        :data-id="dataId"
                        @delete="handleDelete"
                    />
                </template>
                <template>
                    <div class="greyLabel" style="margin-top: 10px">
                        <div class="greyLabel-title">设备安装服务</div>
                        <div>
                            <el-button type="success" size="mini" icon="el-icon-plus" @click="onClickAddService">添加</el-button>
                        </div>
                    </div>
                    <InstallProduct
                        v-loading="loading"
                        v-if="visible"
                        ref="InstallProduct"
                        :data-list="installList"
                        :is-edit="true"
                        :data-id="dataId"
                        @delete="handleDeleteInstall"
                    />
                </template>
                <template>
                    <div class="greyLabel" style="margin-top: 10px">
                        <div class="greyLabel-title">设备维修服务</div>
                        <div>
                            <el-button type="success" size="mini" icon="el-icon-plus" @click="onClickAddRepair">添加</el-button>
                        </div>
                    </div>
                    <RepairList
                        v-loading="loading"
                        v-if="visible"
                        ref="RepairList"
                        :data-list="repairList"
                        :is-edit="true"
                        :data-id="dataId"
                        @delete="handleDeleteRepair"
                    />
                </template>
            </div>
            <span slot="footer">
                <el-button v-if="isCreate" :loading="loading" size="mini" type="primary" @click="handleMore">保存并添加联系人</el-button>
                <el-button size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick :loading="loading" size="mini" type="primary" @click="handleSubmit">保  存</el-button>
            </span>
        </el-dialog>
        <supplier-product
            v-if="addProductDialog.visible"
            :visible="addProductDialog.visible"
            :supplier-id="finallyFormModel.guidId"
            @close="addProductDialog.visible = false"
            @confirm="handleAddProduct"
        />
        <contacts-dialog
            v-if="contactsDialog.visible"
            :visible="contactsDialog.visible"
            :data-id="dataId"
            :customer-id="defaultFormModel.guidId"
            :is-create="isCreate"
            @close="contactsDialog.visible = false"
            @confirm="getDetail()"
        />
        <UpdateProductDialog
            v-if="addProductDialog.visible"
            :is-edit="true"
            :visible.sync="addProductDialog.visible"
            :params="{ lockedCustomer: true, lockedData: addProductDialog.rowData }"
            @update="() => { getDetail() }"
        />
        <select-dialog
            v-if="installDialog.visible"
            :visible.sync="installDialog.visible"
            :type="installDialog.type"
            :title="installDialog.title"
            :extend-params="installDialog.extendParams"
            multiple
            @change="handleSelectInstall"
        />
        <select-dialog
            v-if="repairDialog.visible"
            :visible.sync="repairDialog.visible"
            :type="repairDialog.type"
            :title="repairDialog.title"
            :extend-params="repairDialog.extendParams"
            multiple
            @change="handleSelectRepair"
        />
    </div>
</template>

<script>
    import BaseForm from '@/views/purchaseManagement/supplier/components/BaseForm'
    import SupplierProduct from '@/views/purchaseManagement/supplier/components/SupplierProduct'
    import InstallProduct from '@/views/purchaseManagement/supplier/components/InstallProduct'
    import RepairList from '@/views/purchaseManagement/supplier/components/RepairList'
    import SupplierContacts from '@/views/purchaseManagement/supplier/components/SupplierContacts'
    import ContactsDialog from '@/views/purchaseManagement/supplier/components/ContactsDialog'
    import UpdateProductDialog from '@/views/purchaseManagement/product/components/UpdateDialog'
    import supplierApi from '@/api/purchase/supplier'
    import productApi from '@/api/purchase/product'
    export default {
        name: 'EditDialog',
        components: { InstallProduct, SupplierProduct, BaseForm, SupplierContacts, ContactsDialog, UpdateProductDialog, RepairList },
        props: {
            dataId: {
                type: String,
                default: null
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                defaultFormModel: {},
                finallyFormModel: {},
                loading: false,
                productList: [],
                installList: [],
                repairList: [],
                addProductDialog: {
                    visible: false
                },
                contactsDialog: {
                    visible: false
                },
                installDialog: {
                    visible: false,
                    title: '选择产品',
                    type: 'product',
                    extendParams: {
                        excludeIds: [],
                        categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                    }
                },
                repairDialog: {
                    visible: false,
                    title: '选择产品',
                    type: 'product',
                    extendParams: {
                        excludeIds: [],
                        categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                    }
                }
            }
        },
        computed: {
            dialogTitle() {
                return this.isCreate ? '添加供应商' : '编辑供应商信息'
            }
        },
        watch: {
            dataId(val) {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                if (!this.isCreate) {
                    this.getDetail()
                }
            },
            getDetail() {
                this.defaultFormModel = {}
                this.finallyFormModel = {}
                this.productList = []
                if (this.dataId) {
                    this.loading = true
                    supplierApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.defaultFormModel = res.data
                            const { areaId, cityId, provinceId } = res.data
                            this.defaultFormModel._region = [provinceId, cityId, areaId]
                            // 处理坐标字段
                            let point = {}
                            if (res.data.latitude && res.data.longitude) {
                                point = { lat: res.data.latitude, lng: res.data.longitude }
                            }
                            this.defaultFormModel.point = point
                            this.finallyFormModel.id = res.data.id
                            this.finallyFormModel.guidId = res.data.guidId
                            // 获取供应商产品列表
                            this.getSupplierProductList(res.data.guidId)
                            // 服务列表
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
            onClickAddProduct() {
                this.addProductDialog.rowData = {
                    supplierId: this.defaultFormModel.guidId,
                    supplierName: this.defaultFormModel.name
                }
                this.addProductDialog.visible = true
            },
            onClickAddService() {
                this.installDialog.visible = true
                const excludeIds = []
                this.installList.map(item => {
                    excludeIds.push(item.productId)
                })
                this.installDialog.extendParams.excludeIds = excludeIds
            },
            onClickAddRepair() {
                this.repairDialog.visible = true
                const excludeIds = []
                this.repairList.map(item => {
                    excludeIds.push(item.productId)
                })
                this.repairDialog.extendParams.excludeIds = excludeIds
            },
            handleAddProduct(product) {
                this.productList.push(product)
            },
            // 选择了服务
            handleSelectInstall(list) {
                const oList = this.installList
                const newInstallList = []
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            productCode: item.code,
                            code: item.code,
                            productId: item.guidId,
                            productName: item.name,
                            type: item.type,
                            categoryId: item.categoryId,
                            installUnit: 0
                        }
                        const find = oList.findIndex(v => v.productId === newItem.productId) > -1
                        if (!find) {
                            newInstallList.push(newItem)
                        }
                    })
                    this.installList = newInstallList.concat(oList)
                    this.$message.success('成功添加' + newInstallList.length + '项产品安装服务！保存后生效！')
                }
            },
            handleSelectRepair(list) {
                const oList = this.repairList
                const newRepairList = []
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            productCode: item.code,
                            code: item.code,
                            productId: item.guidId,
                            productName: item.name,
                            type: item.type,
                            categoryId: item.categoryId
                        }
                        const find = oList.findIndex(v => v.productId === newItem.productId) > -1
                        if (!find) {
                            newRepairList.push(newItem)
                        }
                    })
                    this.repairList = newRepairList.concat(oList)
                    this.$message.success('成功添加' + newRepairList.length + '项产品维修服务！保存后生效！')
                }
            },
            showContacts() {
                this.contactsDialog.visible = true
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    const postData = {
                        ...this.defaultFormModel,
                        ...data,
                        ...this.finallyFormModel,
                        list: this.productList,
                        feeList: this.installList,
                        repairProductList: this.repairList
                    }
                    if (data.point) {
                        postData.latitude = data.point.lat
                        postData.longitude = data.point.lng
                    }
                    supplierApi.update(postData).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('confirm')
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleMore() {
                // 先执行提交操作
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    const postData = {
                        ...this.defaultFormModel,
                        ...data,
                        ...this.finallyFormModel,
                        list: this.productList,
                        feeList: this.installList,
                        repairProductList: this.repairList
                    }
                    if (data.point) {
                        postData.latitude = data.point.lat
                        postData.longitude = data.point.lng
                    }
                    supplierApi.update(postData).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            // 弹出联系人列表窗口
                            if (res.data) {
                                this.$emit('more', res.data)
                            }
                            // 关闭当前窗口
                            this.$emit('confirm')
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
            handleDelete(index, row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    productApi.delete(row.id).then(res => {
                        if (res.success) {
                            this.getDetail()
                            this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
                        }
                    })
                }).catch(() => {})
            },
            handleDeleteInstall(index, row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.installList.splice(index, 1)
                }).catch(() => {})
            },
            handleDeleteRepair(index, row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.repairList.splice(index, 1)
                }).catch(() => {})
            }
        }
    }
</script>

<style scoped lang="scss">
.greyLabel {
  background-color: #f5f7fa;
  padding: 0 10px;
  height: 35px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
.greyLabel-title {
  font-size: 13px;
  &:before {
    height: 10px;
    content: '';
    width:0;
    border-left: 3px solid #2abeff;
    margin-right: 10px;
   }
  }
}
.dialog-container {
  height: 700px;
  overflow: auto;
}
</style>
