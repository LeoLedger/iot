<!--
* @description 产品列表
* @author yc
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            empty-hide-table
        >
            <template slot="操作" slot-scope="{$index, row}">
                <el-dropdown v-if="!row._isBom" trigger="click" size="small">
                    <el-button
                        size="mini"
                        icon="el-icon-more"
                        title="操作"
                    />
                    <el-dropdown-menu slot="dropdown">
                        <div class="layout-dropdown-item" @click="handleUpdate(row)">
                            <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                        </div>
                        <div class="layout-dropdown-item" @click="handleDelete(row)">
                            <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                        </div>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>
        </TableComponent>
        <!-- 更新产品信息 -->
        <ProductUpdate
            v-if="productUpdate.visible"
            v-bind="productUpdate"
            :type="type"
            :is-create="isCreate"
            :form-data="activeRowData"
            :sales-type="formData.type"
            :visible.sync="productUpdate.visible"
            @update="handelProductUpdate"
        />
        <!-- 查看续费设备 -->
        <RenewDevice
            v-if="renewDeviceVisible"
            :row-data="activeRowData"
            :extend-params="extendParams"
            :visible.sync="renewDeviceVisible"
        />
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
        />
    </div>
</template>

<script>
    // API
    import contractApi from '@/api/PM/contract'
    // 方法
    import { getPriceFormat } from '@/utils'
    // 组件
    import RenewDevice from './RenewDevice'
    import ProductUpdate from './ProductUpdate'
    import SelectDialog from '@/components/SelectDialog'

    export default {
        components: {
            RenewDevice,
            SelectDialog,
            ProductUpdate
        },
        props: {
            type: { type: [Number, String], default: 1 },
            isEdit: { type: Boolean, default: true },
            isCreate: Boolean,
            formData: { type: Object },
            historyRenew: Boolean,
            showSummation: Boolean
        },
        data() {
            return {
                tableData: {
                    total: 0,
                    list: [],
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showSummary: false,
                        summaryMethod: this.getSummaries,
                        indent: 2,
                        rowKey: '_treeId',
                        defaultExpandAll: true,
                        treeProps: {
                            children: 'bomList'
                        }
                    },
                    // 列操作按钮
                    operates: {
                        width: [1].includes(this.type) ? 100 : 60,
                        fixed: 'right',
                        show: !this.isEdit
                    }
                },
                selectDialog: {},
                activeRowData: null,
                productUpdate: {
                    visible: false
                },
                renewDeviceVisible: false
            }
        },
        computed: {
            // 是否需要更新续费合同
            isCanUpdateRenewDate() {
                let _period = this.formData._period
                return this.type === 3 && Array.isArray(_period) && _period[1]
            }
        },
        watch: {
            type() {
                this.updateTabelConfig()
            },
            isEdit: {
                immediate: true,
                handler(value) {
                    this.$set(this.tableData.operates, 'show', value)
                }
            },
            formData(data) {
                if (data) {
                    let list = (data.productList || []).map(v => v)
                    let _period = data._period
                    list.forEach(item => {
                        if (this.isCanUpdateRenewDate) {
                            item.endDate = _period[1]
                        }
                    })
                    this.tableData.list = list
                    this.updateTabelConfig()
                }
            },
            showSummation: {
                immediate: true,
                handler(value) {
                    this.$set(this.tableData.options, 'showSummary', value)
                }
            }
        },
        mounted() {
            // 表格配置
            this.TabelConfig = {
                default: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 160,
                        isCopy: false,
                        isClick: true,
                        idKey: 'productId',
                        dialogType: this.isEdit ? 'product' : null,
                        onClick: !this.isEdit && ((row) => {
                            this.handelDetailInfo(row)
                        })
                    },
                    {
                        prop: 'productName',
                        label: '产品名称',
                        minWidth: 130
                    },
                    {
                        type: 'dict',
                        dictType: 'salesType',
                        prop: 'salesType',
                        label: '销售模式',
                        width: 100
                    },
                    {
                        prop: 'count',
                        label: '数量',
                        width: 80
                    },
                    {
                        prop: 'outCount',
                        label: '已出库',
                        width: 80,
                        visible: false,
                        isCopy: false,
                        isClick: true,
                        onClick: (data) => {
                            this.selectDialog = {
                                type: 'storageOut',
                                title: '已出库',
                                visible: true,
                                onlyShow: true,
                                customRequest: contractApi.getStorageOutList,
                                extendParams: {
                                    productId: data.productId,
                                    contractId: this.formData.guidId
                                }
                            }
                        }
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceDepositTotal',
                        label: '押金',
                        width: 100
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceSalesTotal',
                        label: '销售价格',
                        width: 100
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceServicesTotal',
                        label: '服务费',
                        width: 100
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceInstallTotal',
                        label: '安装费',
                        width: 100
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceMoveTotal',
                        label: '迁装费',
                        width: 100
                    }
                ],
                // 续费
                renew: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 140,
                        isCopy: false,
                        isClick: true,
                        idKey: 'productId',
                        dialogType: this.isEdit ? 'product' : null,
                        onClick: !this.isEdit && ((row) => {
                            this.handelDetailInfo(row)
                        })
                    },
                    {
                        prop: 'sectionName',
                        label: '标段名称',
                        minWidth: 200,
                        visible: this.historyRenew
                    },
                    {
                        prop: 'productName',
                        label: '可续费产品名称',
                        minWidth: 130
                    },
                    {
                        type: 'dict',
                        dictType: 'salesType',
                        prop: 'salesType',
                        label: '原销售模式',
                        width: 100
                    },
                    {
                        type: 'date',
                        prop: 'endDateOrigin',
                        width: 100,
                        label: '原服务期限'
                    },
                    {
                        prop: 'count',
                        label: '续期设备数量',
                        width: 100,
                        isCopy: false,
                        isClick: !this.isCreate,
                        onClick: (row) => {
                            this.handelRenewDevice(row)
                        }
                    },
                    {
                        type: 'date',
                        prop: 'endDate',
                        label: '续费至',
                        width: 100
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceServicesTotal',
                        label: '服务费',
                        width: 80
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceInstallTotal',
                        label: '安装费',
                        width: 80
                    }
                ],
                // 补购
                buyIn: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 130,
                        isCopy: false,
                        isClick: true,
                        idKey: 'productId',
                        dialogType: this.isEdit ? 'product' : null,
                        onClick: !this.isEdit && ((row) => {
                            this.handelDetailInfo(row)
                        })
                    },
                    {
                        prop: 'productName',
                        label: '可补购产品名称',
                        minWidth: 130
                    },
                    {
                        type: 'dict',
                        dictType: 'salesType',
                        prop: 'salesType',
                        label: '原销售模式',
                        width: 100
                    },
                    {
                        prop: 'originCount',
                        label: '在运营数量',
                        width: 100
                    },
                    {
                        prop: 'count',
                        label: '补购数量',
                        width: 80
                    },
                    {
                        prop: 'outCount',
                        label: '已出库',
                        width: 80,
                        visible: false,
                        isCopy: false,
                        isClick: true,
                        onClick: (data) => {
                            this.selectDialog = {
                                type: 'storageOut',
                                title: '已出库',
                                visible: true,
                                onlyShow: true,
                                customRequest: contractApi.getStorageOutList,
                                extendParams: {
                                    productId: data.productId,
                                    contractId: this.formData.guidId
                                }
                            }
                        }
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceSalesTotal',
                        label: '销售价格',
                        width: 80
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceServicesTotal',
                        label: '服务费',
                        width: 80
                    },
                    {
                        type: 'money',
                        prop: 'unitPriceInstallTotal',
                        label: '安装费',
                        width: 80
                    }
                ]
            }
            this.updateTabelConfig()
        },
        methods: {
            // 获取合计数量
            getSummaries({ columns, data }) {
                var sums = []
                columns.forEach((column, index) => {
                    switch (index) {
                    case 0: return
                    case 1:
                        sums[index] = '合计：'
                        return
                    default:
                        var values = data.map(item => Number(item[column.property]))
                        if (!values.every(value => isNaN(value))) {
                            sums[index] = values.reduce((prev, curr) => {
                                var value = Number(curr)
                                if (!isNaN(value)) {
                                    return prev + curr
                                } else {
                                    return prev
                                }
                            }, 0)
                            sums[index] = getPriceFormat(sums[index]) + ' 元'
                        } else {
                            sums[index] = '--'
                        }
                        return
                    }
                })
                return sums
            },
            // 更新表格配置
            updateTabelConfig() {
                switch (this.type) {
                case 2:
                    // 补购
                    this.tableData.columns = this.TabelConfig.buyIn
                    if (this.formData.approvalStatus >= 3) {
                        this.tableData.columns.find(v => v.prop === 'outCount').visible = true
                    }
                    break
                case 3:
                    // 续费
                    this.tableData.columns = this.TabelConfig.renew
                    break
                default:
                    this.tableData.columns = this.TabelConfig.default
                    if (this.formData.approvalStatus >= 3) {
                        this.tableData.columns.find(v => v.prop === 'outCount').visible = true
                    }
                    break
                }
            },
            // 点击编辑按钮时触发
            async handleUpdate(data) {
                let { guidId, version, sectionId, _period } = this.formData
                let extendParams = {
                    version,
                    sectionId,
                    contractId: guidId
                }
                if (this.historyRenew) {
                    extendParams.sectionId = data.sectionId
                }
                if (this.isCanUpdateRenewDate) {
                    data.endDate = _period[1]
                } else if (this.type === 3) {
                    return this.$message.warning('请先选择合同期限！')
                }
                if (data) {
                    extendParams.salesType = data.salesType
                    extendParams.productId = data.productId
                    extendParams.serviceEndDate = data.endDateOrigin
                }
                this.activeRowData = data
                this.productUpdate = {
                    isEdit: true,
                    visible: true,
                    excludes: this.tableData.list.map(item => {
                        let { productId, salesType } = item
                        return { productId, salesType }
                    }),
                    extendParams
                }
            },
            // 点击删除按钮时触发
            handleDelete(data) {
                let list = this.tableData.list
                let index = list.findIndex(v => v === data)
                if (index > -1) {
                    list.splice(index, 1)
                    this.$emit('change', list)
                }
            },
            // 查看详细信息
            handelDetailInfo(data) {
                this.activeRowData = data
                this.productUpdate = {
                    isEdit: false,
                    visible: true
                }
            },
            // 查看续期设备数量
            handelRenewDevice(data) {
                let { guidId, sectionId, approvalStatus } = this.formData
                this.extendParams = {
                    contractId: guidId,
                    sectionId: sectionId,
                    salesType: data.salesType,
                    productId: data.productId,
                    contractProductId: data.guidId,
                    serviceEndDate: approvalStatus === 3 ? data.endDate : data.endDateOrigin
                }
                this.activeRowData = data
                this.renewDeviceVisible = true
            },
            // 产品更新时触发
            handelProductUpdate(data) {
                if (this.activeRowData) {
                    // 编辑
                    let index = this.tableData.list.findIndex(v => v === this.activeRowData)
                    data._isDirty = true
                    this.$set(this.tableData.list, index, {
                        ...this.activeRowData,
                        ...data
                    })
                } else {
                    // 新增
                    data._isDirty = true
                    this.tableData.list.push(data)
                }
                this.$emit('change', this.tableData.list)
            }
        }
    }
</script>

<style lang='scss' scoped>
// /deep/ {
//     .el-table__expand-icon,
//     .el-table__placeholder {
//         display: none !important;
//     }
// }
</style>
