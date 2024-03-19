<!--
* @description 项目信息表单
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :disabled="!isEdit"
                        :is-create="isCreate"
                        :extend-params="extendParams"
                        @contract-change="queryContractInfo"
                        @warehouse-change="handleWarehouseChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">入库产品</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-setting"
                                @click="handleUpdate(row)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
            <el-collapse-item v-if="showProductTest" name="3" disabled>
                <div slot="title" class="title">
                    <div class="text">来料批次检测</div>
                    <el-button v-if="processIndex === 2 && isApproval" type="success" size="mini" icon="el-icon-plus" @click="handleProductTest"/>
                </div>
                <div class="body-wrap">
                    <ProductTest
                        ref="ProductTest"
                        :is-edit="processIndex === 2"
                        :form-data="formData"
                        @update="$emit('update:jsonData', $event)"
                    />
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 配置入库清单 -->
        <PutListDialog
            v-if="putDialogVisible"
            :data-id="dataId"
            :row-data="activeRowData"
            :visible.sync="putDialogVisible"
            :is-edit="isEditPutList"
            :is-create="isCreate"
            @change="handlePutListChange"
        />
        <!-- 输入弹窗 -->
        <el-dialog
            :visible.sync="inputDialog.visible"
            :close-on-click-modal="false"
            title="入库数量登记"
            width="410px"
            append-to-body
            @close="inputDialog.visible = false"
        >
            <div class="input-dialog">
                <div class="text">请填写本次申请入库数量：</div>
                <el-input
                    v-model="inputDialog.value"
                    type="number"
                    placeholder="请填写"
                />
            </div>
            <div slot="footer">
                <el-button @click="inputDialog.visible = false">取 消</el-button>
                <el-button type="primary" @click="handleInputDialogConfirm">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import contractApi from '@/api/purchase/contract'
    import storagePutApi from '@/api/businessDocuments/storagePut'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import BaseForm from './BaseForm'
    import ProductTest from './ProductTest'
    import PutListDialog from './PutListDialog'

    export default {
        components: {
            BaseForm,
            ProductTest,
            PutListDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 130,
                            isClick: true,
                            idKey: 'productId',
                            dialogType: 'product'
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 155,
                            formatter: (params, formData) => {
                                return (this.getDict('productType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'count',
                            label: '采购数量',
                            width: 80
                        },
                        {
                            prop: 'countInbound',
                            label: '已入库',
                            width: 80
                        },
                        {
                            prop: 'countBounding',
                            label: '入库中',
                            width: 80
                        },
                        {
                            prop: 'countApply',
                            label: '申请入库数量',
                            width: 100,
                            isCopy: false,
                            isClick: ({ row }) => {
                                if (this.isEdit) {
                                    return false
                                } else {
                                    var category = enums.productCategoryId.find(item => item.id === row.productCategory)
                                    if (category) {
                                        return category.value !== 2
                                    }
                                }
                            },
                            onClick: (row) => {
                                this.handleApplyDevice(row)
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                inputDialog: {
                    value: '',
                    visible: false
                },
                collapseValue: ['1', '2', '3'],
                activeRowData: null,
                isEditPutList: false,
                putDialogVisible: false
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            showProductTest() {
                return this.processIndex >= 2 && this.includeIntelligentProduct
            },
            // 入库产品是否包含智能产品
            includeIntelligentProduct() {
                var category = enums.productCategoryId.find(item => item.value === 0)
                return this.tableData.list.findIndex(item => item.productCategory === category.id) > -1
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
            // 点击提交按钮时触发
            submit(callback, errorCallback) {
                var index = this.tableData.list.findIndex(item => item.countApply > 0)
                if (this.tableData.list.length && index > -1) {
                    this.loading = true
                    this.$refs.BaseForm.submit((data) => {
                        storagePutApi.update({
                            ...this.formData,
                            ...data,
                            deviceInProdList: this.tableData.list
                        }).then(res => {
                            this.getCanApprovalCount()
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            callback && callback()
                        }).catch(() => {
                            errorCallback && errorCallback()
                        }).finally(() => {
                            this.loading = false
                        })
                    }, () => {
                        this.loading = false
                        errorCallback && errorCallback()
                    })
                } else {
                    this.$message.warning('请至少选择一台入库设备')
                    errorCallback && errorCallback()
                }
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    let { data: data1 } = await storagePutApi.detail(this.dataId)
                    let data2 = {}
                    if (this.isEdit) {
                        let res = await contractApi.detail(data1.purchaseContractId)
                        data2 = res.data
                    }
                    let { beginDate, endDate } = data1
                    // 获取最新的入库数量
                    this.tableData.list = data1.deviceInProdList.map(item => {
                        if (this.isEdit) {
                            let data = data2.prodList.find(v => v.productId === item.productId)
                            if (data) {
                                item.countInbound = data.countInbound || 0
                                item.countBounding = data.countBounding || 0
                            }
                            item.countBounding = Math.max(item.countBounding - item.countApply, 0)
                        } else {
                            item.countInbound = item.countInbound || 0
                            item.countBounding = item.countBounding || 0
                        }
                        item.deviceInDeviceList = null
                        return item
                    })
                    this.formData = {
                        ...this.formData,
                        ...data1,
                        _period: beginDate && endDate ? [beginDate, endDate] : []
                    }
                    this.$emit('data-update', this.formData)
                    this.loading = false
                }
            },
            // 获取采购合同基础信息
            async queryContractInfo({ data, guidId, warehouses }) {
                this.loading = true
                var res = await contractApi.detail(guidId)
                var { code, partyBName, signedDate, deliveryTime, beginDate, endDate } = res.data
                var _period = []
                if (beginDate && endDate) {
                    _period = [beginDate, endDate]
                }
                this.prodList = res.data.prodList.filter(item => {
                    // 采购数量-已入库数量-入库中数量=0的项不显示
                    return item.count - item.countInbound - item.countBounding > 0
                }).map(item => {
                    item.countApply = 0
                    item.countInbound = item.countInbound || 0
                    item.countBounding = item.countBounding || 0
                    item.deviceInDeviceList = null
                    return item
                })
                this.warehouses = warehouses
                var warehousesId = ''
                if (warehouses.length) {
                    warehousesId = warehouses[0].guidId
                    this.handleWarehouseChange({ guidId: warehousesId })
                }
                this.formData = {
                    ...this.formData,
                    ...data,
                    contractCode: code,
                    supplierName: partyBName,
                    signedDate,
                    deliveryTime,
                    warehousesId,
                    _period
                }
                this.loading = false
            },
            // 获取申请入库设备列表
            async queryDeviceList(guidId) {
                var res = await storagePutApi.getDeviceList({
                    pageIndex: -1,
                    approvalDeviceInProdId: guidId
                })
                return res.data.records
            },
            // 点击配置按钮时触发
            async handleUpdate(data) {
                var category = enums.productCategoryId.find(item => item.id === data.productCategory)
                if (category && category.value === 2) {
                    // 非智能产品直接填写数量
                    this.activeRowData = data
                    this.inputDialog.visible = true
                } else {
                    let list = data.deviceInDeviceList
                    if (!list) {
                        this.tableData.options.loading = true
                        list = await this.queryDeviceList(data.guidId)
                    }
                    data.deviceInDeviceList = list
                    this.activeRowData = data
                    this.isEditPutList = true
                    this.putDialogVisible = true
                    this.tableData.options.loading = false
                }
            },
            // 查看申请入库设备列表
            handleApplyDevice(data) {
                this.activeRowData = data
                this.isEditPutList = false
                this.putDialogVisible = true
            },
            // 入库清单更新时触发
            handlePutListChange(list) {
                this.activeRowData._isDirty = true
                this.activeRowData.countApply = list.length
                this.activeRowData.deviceInDeviceList = list
            },
            // 点击输入弹窗提交按钮时触发
            handleInputDialogConfirm() {
                var value = this.inputDialog.value
                var { count, countInbound, countBounding } = this.activeRowData
                if (value <= count - countInbound - countBounding) {
                    this.activeRowData._isDirty = true
                    this.activeRowData.countApply = this.inputDialog.value
                    this.inputDialog.visible = false
                } else {
                    this.$message.warning('申请入库数量不能大于（采购数量-已入库数量-待入库数量）')
                }
            },
            // 点击新增来料批次按钮时触发
            handleProductTest() {
                this.$refs.ProductTest.handleConfig()
            },
            // 入库仓库改变时触发
            handleWarehouseChange({ guidId }) {
                var warehouse = this.warehouses.find(item => item.guidId === guidId)
                if (warehouse) {
                    this.tableData.list = this.prodList.filter(item => warehouse.categoryIds.indexOf(item.productCategory) > -1)
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.input-dialog {
    padding: 20px 0;
    .text {
        margin-bottom: 15px;
    }
}
</style>
