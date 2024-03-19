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
                        @complete="handleBaseComplete"
                        @reset-list="handleResetList"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">调拨设备</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        :page-index.sync="publicParam.pageIndex"
                        :page-size.sync="publicParam.pageSize"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-setting"
                                style="height: 28px"
                                @click="handleConfigButton(row)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 设备选择 -->
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
        />
        <ConfigDialog
            v-if="configDialog.visible"
            v-bind="configDialog"
            :visible.sync="configDialog.visible"
            @change="handleConfigDialogChange"
        />
    </div>
</template>

<script>
    // API
    import deviceAllocateApi from '@/api/businessDocuments/deviceAllocate'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import ConfigDialog from './ConfigDevice/ConfigDialog'

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
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 155,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 155
                        },
                        {
                            prop: 'inventoryCount',
                            label: '库存数量',
                            minWidth: 100,
                            isCopy: false,
                            isClick: true,
                            onClick: (data) => {
                                let { warehousesOutId, shippingSpaceOutId, warehousesOutTypeId } = this.formData
                                let extendParams = {
                                    productCode: data.productCode,
                                    productType: data.productType,
                                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                                    warehousesId: warehousesOutId, // 仓库id
                                    typeId: warehousesOutTypeId, // 仓位类型
                                    lockedProps: ['productCode', 'productType']
                                }
                                // 备用设备调出时，只允许选择状态为“正常”的设备
                                if (shippingSpaceOutId === '09509d7b-5be3-4a89-a472-58c14b35cc2c') {
                                    extendParams.unitStatus = 1
                                    extendParams.lockedProps.push('unitStatus')
                                }
                                // 寄存设备调出时，只允许选择设备“标段销售类型”为出售的设备
                                if (warehousesOutTypeId === '3ad17249-a0dd-11eb-8666-000c29bb1337') {
                                    extendParams.sectionSalesType = 0
                                    extendParams.lockedProps.push('sectionSalesType')
                                }
                                this.selectDialog = {
                                    type: 'device',
                                    title: '库存数量',
                                    visible: true,
                                    multiple: true,
                                    onlyShow: true,
                                    extendParams
                                }
                            }
                        },
                        {
                            prop: 'count',
                            label: '申请调拨数量',
                            minWidth: 100,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        placeholder='请输入'
                                        min={0}
                                        max={row.inventoryCount}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        },
                        {
                            prop: 'transferCount',
                            label: '实际调拨数量',
                            minWidth: 100,
                            visible: false,
                            isCopy: false,
                            isClick: () => {
                                return this.processIndex > 2
                            },
                            onClick: (data) => {
                                this.configDialog = {
                                    visible: true,
                                    rowData: data,
                                    billsData: this.formData
                                }
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: false
                    }
                },
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                configDialog: {
                    visible: false,
                    onlyShow: false
                },
                selectDialog: {
                    visible: false,
                    onlyShow: false
                },
                activeRowData: null,
                collapseValue: ['1', '2']
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
            },
            processIndex(index) {
                this.tableData.operates.show = index === 2 && this.isApproval
                this.$set(this.tableData.columns.find(v => v.prop === 'transferCount'), 'visible', index >= 2)
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
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    let list = this.dataList
                    let message = ''
                    if (list.findIndex(v => v.count > 0) === -1) {
                        message = '请至少配置一台调拨设备！'
                    }
                    if (message) {
                        this.$message.warning(message)
                        reject(message)
                    } else {
                        list = list.filter(v => v.count)
                        resolve(list)
                    }
                })
            },
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    let data = await this.$refs.BaseForm.submit()
                    let products = await this.validate()
                    let res = await deviceAllocateApi.update({
                        ...this.formData,
                        ...data,
                        products
                    })
                    this.getCanApprovalCount()
                    return this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
                return Promise.reject()
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
                    let { data } = await deviceAllocateApi.detail(this.dataId)
                    data.products.map(item => {
                        item.transferCount = item.transferCount || 0
                        return item
                    })
                    this.dataList = data.products
                    this.formData = {
                        ...this.formData,
                        ...data
                    }
                    this.$emit('data-update', this.formData)
                    this.$emit('update:jsonData', this.formData)
                    this.filterData()
                    this.loading = false
                }
            },
            // 获取设备产品种类列表
            async queryProductTypeList() {
                this.loading = true
                var { warehousesOutId, shippingSpaceOutId } = this.formData
                var { data } = await deviceAllocateApi.getProductTypeList({
                    warehousesOutId,
                    shippingSpaceOutId
                })
                this.dataList = data
                this.filterData()
                this.loading = false
            },
            // 重置调拨设备列表
            handleResetList(data) {
                this.formData = {
                    ...this.formData,
                    ...data,
                    count: 0
                }
                this.dataList = []
                this.filterData()
            },
            // 点击配置按钮时触发
            handleConfigButton(data) {
                this.configDialog = {
                    isEdit: true,
                    visible: true,
                    rowData: data,
                    billsData: this.formData
                }
                this.activeRowData = data
            },
            // 基础信息填写完整时触发
            handleBaseComplete(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.queryProductTypeList()
            },
            // 配置设备后触发
            handleConfigDialogChange(list) {
                this.activeRowData.devices = list
                this.activeRowData.transferCount = list.length
                this.formData = {
                    ...this.formData,
                    count: this.dataList.reduce((a, b) => {
                        return a + b.count
                    }, 0)
                }
                this.$emit('update:jsonData', this.formData)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
