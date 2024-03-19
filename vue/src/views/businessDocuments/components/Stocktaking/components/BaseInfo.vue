<!--
* @description 基础信息
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
                        @reset-list="handleResetList"
                        @warehouses-change="hanldeWarehousesChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">产品盘点清单</div>
                    <el-button
                        v-prereclick
                        v-if="isEdit && dataList.length"
                        :loading="refreshing"
                        type="success"
                        size="mini"
                        icon="el-icon-refresh"
                        @click="handleRefreshCheckList"
                    >更新</el-button>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :page-index.sync="publicParam.pageIndex"
                        :page-size.sync="publicParam.pageSize"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-dropdown v-if="isEdit" trigger="click" size="small">
                                <el-button size="mini" icon="el-icon-more" title="操作" />
                                <el-dropdown-menu slot="dropdown">
                                    <div class="layout-dropdown-item" @click="handleDeleteButton(row)">
                                        <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                    </div>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <template v-else-if="processIndex === 2">
                                <el-button
                                    type="primary"
                                    size="mini"
                                    icon="el-icon-setting"
                                    @click="handleConfigButton(row)"
                                />
                            </template>
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <ConfigDialog
            v-if="configDialog.visible"
            v-bind="configDialog"
            :data-id="dataId"
            :visible.sync="configDialog.visible"
            :product-category-id="formData.productCategoryId"
            @update="handleConfigUpdate"
        />
    </div>
</template>

<script>
    // API
    import stocktakingApi from '@/api/businessDocuments/stocktaking'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import BaseForm from './BaseForm'
    import ConfigDialog from './ConfigDialog'
    // 其他产品类型id
    const otherProductCategoryId = enums.productCategoryId.find(v => v.value === 2).id

    export default {
        components: {
            BaseForm,
            ConfigDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                dataList: [],
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                configDialog: {
                    isEdit: false,
                    visible: false
                },
                refreshing: false,
                collapseValue: ['1', '2'],
                configDialogVisible: false
            }
        },
        computed: {
            isOtherProduct() {
                return this.formData.productCategoryId === otherProductCategoryId
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            processIndex: {
                immediate: true,
                handler() {
                    this.updateTabelConfig()
                }
            },
            'publicParam.pageSize'() {
                this.filterData()
            },
            'publicParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    var data = await this.$refs.BaseForm.submit()
                    if (this.dataList.length) {
                        var res = await stocktakingApi.update({
                            ...this.formData,
                            ...data,
                            products: this.dataList.map(item => {
                                item = { ...item }
                                item.devices = item.devices
                                return item
                            })
                        })
                        this.getCanApprovalCount()
                        return this.$notify({
                            title: '保存成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                    } else {
                        this.$message.warning('产品盘点清单不能为空！')
                    }
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
                return Promise.reject()
            },
            // 验证表格
            validate() {
                return new Promise((resolve, reject) => {
                    var index = this.dataList.findIndex(item => {
                        var count = 0
                        if (this.isOtherProduct) {
                            count = item.count + item.inventoryProfitCount + item.inventoryLossCount
                        } else {
                            count = item.devices.length
                        }
                        return count < item.bookCount
                    })
                    if (index === -1) {
                        resolve(this.dataList)
                    } else {
                        this.$message.warning(`请配置第${index + 1}项盘点清单`)
                        reject()
                    }
                })
            },
            // 筛选数据
            filterData() {
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await stocktakingApi.detail(this.dataId)
                    if (res.success) {
                        this.formData = {
                            ...this.formData,
                            ...res.data
                        }
                        this.dataList = res.data.products.filter(item => {
                            return item.bookCount > 0
                        }).map(item => {
                            item.count = item.count || 0
                            item.value = item.value || 0
                            item.inventoryProfitCount = item.inventoryProfitCount || 0
                            item.inventoryProfitValue = item.inventoryProfitValue || 0
                            item.inventoryLossCount = item.inventoryLossCount || 0
                            item.inventoryLossValue = item.inventoryLossValue || 0
                            item.devices = item.devices || []
                            return item
                        })
                        this.$emit('data-update', this.formData)
                        this.filterData()
                    }
                    this.loading = false
                }
            },
            // 获取盘点清单
            async queryCheckList() {
                this.tableData.options.loading = true
                var { warehousesId, productCategoryId, shippingSpaceId } = this.formData
                var res = await stocktakingApi.getCheckList({
                    categoryId: productCategoryId,
                    warehousesId,
                    shippingSpaceId
                })
                this.dataList = res.data.map(item => {
                    item.devices = item.devices || []
                    return item
                })
                this.filterData()
                this.tableData.options.loading = false
            },
            // 刷新盘点清单
            async handleRefreshCheckList() {
                await this.$refs.BaseForm.validate()
                this.refreshing = true
                var { warehousesId, productCategoryId, shippingSpaceId } = this.formData
                var res = await stocktakingApi.getCheckList({
                    categoryId: productCategoryId,
                    warehousesId,
                    shippingSpaceId
                })
                this.dataList = res.data.filter(item => {
                    return this.dataList.findIndex(v => v.productId === item.productId) > -1
                }).map(item => {
                    item.devices = item.devices || []
                    return item
                })
                this.filterData()
                this.refreshing = false
            },
            // 更新表格配置
            updateTabelConfig() {
                var baseColumns = [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 155,
                        isClick: true,
                        idKey: 'productId',
                        dialogType: 'product'
                    },
                    {
                        prop: 'productName',
                        label: '产品名称',
                        minWidth: 155
                    },
                    {
                        type: 'dict',
                        dictType: 'productType',
                        label: '产品类型',
                        prop: 'productType',
                        minWidth: 155
                    },
                    {
                        prop: 'bookCount',
                        label: '库存账面数量',
                        width: 100,
                        isCopy: false,
                        isClick: !this.isEdit,
                        onClick: (data) => {
                            this.configDialog = {
                                rowData: data,
                                visible: true
                            }
                        }
                    },
                    {
                        type: 'money',
                        prop: 'bookValue',
                        label: '账面价值',
                        width: 100
                    }
                ]
                if (this.processIndex <= 1) {
                    this.tableData.columns = baseColumns
                } else if (this.processIndex >= 2) {
                    this.tableData.columns = baseColumns.concat([
                        {
                            prop: 'count',
                            label: '在库数量',
                            width: 100,
                            isCopy: false,
                            isClick: !this.isOtherProduct,
                            onClick: (data) => {
                                this.configDialog = {
                                    rowData: data,
                                    visible: true,
                                    extendParams: {
                                        status: 1,
                                        lockedProps: ['status']
                                    }
                                }
                            }
                        },
                        {
                            type: 'money',
                            prop: 'value',
                            label: '在库价值',
                            width: 100
                        },
                        {
                            prop: 'inventoryProfitCount',
                            label: '盘盈数量',
                            width: 100,
                            isCopy: false,
                            isClick: !this.isOtherProduct,
                            onClick: (data) => {
                                this.configDialog = {
                                    rowData: data,
                                    visible: true,
                                    extendParams: {
                                        status: 2,
                                        lockedProps: ['status']
                                    }
                                }
                            }
                        },
                        {
                            type: 'money',
                            prop: 'inventoryProfitValue',
                            label: '盘盈价值',
                            width: 100
                        },
                        {
                            prop: 'inventoryLossCount',
                            label: '盘亏数量',
                            width: 100,
                            isCopy: false,
                            isClick: !this.isOtherProduct,
                            onClick: (data) => {
                                this.configDialog = {
                                    rowData: data,
                                    visible: true,
                                    extendParams: {
                                        status: 3,
                                        lockedProps: ['status']
                                    }
                                }
                            }
                        },
                        {
                            type: 'money',
                            prop: 'inventoryLossValue',
                            label: '盘亏价值',
                            width: 100
                        }
                    ])
                    this.tableData.operates.show = this.processIndex === 2 && this.isApproval
                }
            },
            // 重置产品盘点清单
            handleResetList(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.dataList = []
                this.publicParam.pageIndex = 1
                this.filterData()
            },
            // 配置盘点清单后触发
            handleConfigUpdate(data) {
                Object.keys(data).forEach(key => {
                    this.configDialog.rowData[key] = data[key]
                })
            },
            // 仓库改变时触发
            hanldeWarehousesChange(data) {
                this.handleResetList(data)
                this.queryCheckList()
            },
            // 点击删除按钮时触发
            handleDeleteButton(data) {
                if (this.dataList.length > 1) {
                    this.dataList.splice(this.dataList.indexOf(data), 1)
                    this.filterData()
                } else {
                    this.$message.warning('产品盘点清单不能为空！')
                }
            },
            // 点击配置按钮时触发
            handleConfigButton(data) {
                this.configDialog = {
                    isEdit: true,
                    rowData: data,
                    visible: true
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
