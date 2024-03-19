<!--
* @description 库存盘点配置窗口
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="1200px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="layout-detail-container">
                <layout-filter
                    :table-columns.sync="tableData.columns"
                    :filter-model.sync="searchParam"
                    @search="handleFilter"
                >
                    <template slot="button">
                        <el-button
                            v-waves
                            size="mini"
                            class="filter-button"
                            type="warning"
                            icon="el-icon-download"
                            @click="handleExport"
                        >导出</el-button>
                        <template v-if="productType !== 2">
                            <ImportButton
                                v-if="isEdit"
                                :action="importAction"
                                :upload-data="uploadData"
                                :download-method="downloadMethod"
                                type="primary"
                                class="filter-button"
                                title="导入"
                                template-name="导入模板.xlsx"
                                @success="handleImportSuccess"
                            />
                            <el-button
                                v-waves
                                v-if="isEdit"
                                size="mini"
                                class="filter-button"
                                type="success"
                                icon="el-icon-plus"
                                @click="checkDeviceUpdateDialogVisible = true"
                            >添加盘盈设备</el-button>
                            <el-button
                                v-waves
                                v-if="isEdit"
                                size="mini"
                                class="filter-button"
                                type="success"
                                @click="handleTest"
                            >一键设置在库</el-button>
                        </template>
                    </template>
                    <template v-if="productType === 0">
                        <template slot="filter">
                            <el-input
                                v-model="searchParam.imei"
                                size="mini"
                                placeholder="IMEI"
                                clearable
                                class="filter-item"
                                @change="handleFilter"
                            />
                        </template>
                        <template slot="filter-popup">
                            <layout-filter-item label="产品编号">
                                <el-input
                                    v-model="searchParam.productCode"
                                    size="mini"
                                    placeholder="产品编号"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="产品名称">
                                <el-input
                                    v-model="searchParam.productName"
                                    size="mini"
                                    placeholder="产品名称"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="产品类型">
                                <DictSelect
                                    v-model="searchParam.productType"
                                    type="productType"
                                    placeholder="产品类型"
                                    clearable
                                    filterable
                                    size="mini"
                                />
                            </layout-filter-item>
                            <layout-filter-item label="包装箱编号">
                                <el-input
                                    v-model="searchParam.packageCode"
                                    size="mini"
                                    placeholder="包装箱编号"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="SIM卡号">
                                <el-input
                                    v-model="searchParam.sim"
                                    size="mini"
                                    placeholder="SIM卡号"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="ICCID">
                                <el-input
                                    v-model="searchParam.iccid"
                                    size="mini"
                                    placeholder="ICCID"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="盘点状态">
                                <DictSelect
                                    :disabled="lockedProps.includes('status')"
                                    v-model="searchParam.status"
                                    type="stocktakingStatus"
                                    placeholder="盘点状态"
                                    clearable
                                    filterable
                                    size="mini"
                                />
                            </layout-filter-item>
                        </template>
                    </template>
                    <template v-else-if="productType === 1">
                        <template slot="filter">
                            <el-input
                                v-model="searchParam.imei"
                                size="mini"
                                placeholder="关联设备IMEI"
                                clearable
                                class="filter-item"
                                @change="handleFilter"
                            />
                            <el-input
                                v-model="searchParam.sim"
                                size="mini"
                                placeholder="SIM卡号"
                                clearable
                                class="filter-item"
                                @change="handleFilter"
                            />
                        </template>
                        <template slot="filter-popup">
                            <layout-filter-item label="产品编号">
                                <el-input
                                    v-model="searchParam.productCode"
                                    size="mini"
                                    placeholder="产品编号"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="产品名称">
                                <el-input
                                    v-model="searchParam.productName"
                                    size="mini"
                                    placeholder="产品名称"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="产品类型">
                                <DictSelect
                                    v-model="searchParam.productType"
                                    type="productType"
                                    placeholder="产品类型"
                                    clearable
                                    filterable
                                    size="mini"
                                />
                            </layout-filter-item>
                            <layout-filter-item label="ICCID">
                                <el-input
                                    v-model="searchParam.iccid"
                                    size="mini"
                                    placeholder="ICCID"
                                    clearable
                                />
                            </layout-filter-item>
                            <layout-filter-item label="盘点状态">
                                <DictSelect
                                    :disabled="lockedProps.includes('status')"
                                    v-model="searchParam.status"
                                    type="stocktakingStatus"
                                    placeholder="盘点状态"
                                    clearable
                                    filterable
                                    size="mini"
                                />
                            </layout-filter-item>
                        </template>
                    </template>
                    <template slot="table">
                        <layout-col auto>
                            <layout-row v-if="productType !== 2" class="data-view">
                                <div class="item">
                                    <div class="label">账面数量</div>
                                    <div class="value">{{ formData.bookCount }}</div>
                                </div>
                                <div
                                    v-for="(item, index) in stocktakingStatus"
                                    :key="index"
                                    class="item"
                                >
                                    <div class="label">{{ item.label }}</div>
                                    <div :style="{background: item.color, color: '#fff'}" class="value">{{ formData[item.key] }}</div>
                                </div>
                            </layout-row>
                            <layout-row auto>
                                <TableComponent
                                    ref="TableComponent"
                                    v-bind="tableData"
                                    :page-index.sync="searchParam.pageIndex"
                                    :page-size.sync="searchParam.pageSize"
                                />
                            </layout-row>
                        </layout-col>
                    </template>
                </layout-filter>
            </div>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">{{ isEdit ? '取 消' : '关闭' }}</el-button>
                <el-button v-prereclick v-if="isEdit" :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <CheckDeviceUpdateDialog
            v-if="checkDeviceUpdateDialogVisible"
            :visible.sync="checkDeviceUpdateDialogVisible"
            :type="productType"
            :form-data="deviceData"
            :excludes="dataList"
            is-edit
            @update="handleCheckDeviceUpdate"
        />
    </div>
</template>

<script>
    // API
    import stocktakingApi from '@/api/businessDocuments/stocktaking'
    // 方法
    import enums from '@/utils/enum'
    import rigorous from '@/utils/rigorous'
    import { filterList, exportTabel } from '@/utils'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import CheckDeviceUpdateDialog from '@/views/public/checkDevice/UpdateDialog'
    // 其他产品类型id
    const otherProductCategoryId = enums.productCategoryId.find(v => v.value === 2).id

    export default {
        name: 'ConfigDialog',
        components: {
            ImportButton,
            CheckDeviceUpdateDialog
        },
        props: {
            isEdit: { type: Boolean, default: false },
            dataId: { type: [Number, String] },
            rowData: { type: Object },
            visible: { type: Boolean, default: false },
            extendParams: { type: Object, default: () => ({}) },
            productCategoryId: { type: String, required: true }
        },
        data() {
            return {
                loading: false,
                dataList: [],
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        rules: {
                            status: {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (value === 0) {
                                        callback(new Error())
                                    }
                                    callback()
                                },
                                message: '请选择第${index}台设备的盘点状态',
                                trigger: 'change'
                            }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    }
                },
                uploadData: {},
                importAction: 'approval-inventoryt-device/device/import',
                searchParam: {
                    pageSize: 13,
                    pageIndex: 1
                },
                isDev: ['development', 'staging'].includes(process.env.VUE_APP_ENV),
                downloadMethod: stocktakingApi.downloadTemplate,
                stocktakingStatus: enums.stocktakingStatus.filter(v => v.value).map((v, index) => {
                    return {
                        ...v,
                        key: ['count', 'inventoryProfitCount', 'inventoryLossCount'][index],
                        count: 0
                    }
                }),
                checkDeviceUpdateDialogVisible: false
            }
        },
        computed: {
            title() {
                var title = '库存盘点'
                if (this.rowData) {
                    var categoryId = this.productCategoryId
                    title = `${title}-${(enums.productCategoryId.find(v => v.id === categoryId) || {}).label || ''}`
                }
                return title
            },
            productType() {
                return (enums.productCategoryId.find(v => v.id === this.productCategoryId) || {}).value || 0
            },
            deviceData() {
                var { productCode, productName, productType } = this.formData
                return {
                    productCode,
                    productName,
                    productType
                }
            },
            lockedProps() {
                return this.extendParams.lockedProps || []
            }
        },
        watch: {
            rowData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        var { guidId, productId } = data
                        this.uploadData = {
                            productId: productId,
                            inventorytDeviceId: this.dataId,
                            inventorytDeviceProdId: guidId
                        }
                        this.updateTabelConfig()
                    }
                }
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.searchParam = {
                ...this.searchParam,
                ...this.extendParams
            }
        },
        methods: {
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    // 当存在多页的时候，需要验证每一页
                    var pageTotal = Math.ceil(this.tableData.total / this.searchParam.pageSize)
                    var recursion = (pageIndex) => {
                        this.searchParam.pageIndex = pageIndex
                        this.$nextTick(() => {
                            this.$refs.TableComponent.validate().then(() => {
                                if (++pageIndex <= pageTotal) {
                                    recursion(pageIndex)
                                } else {
                                    resolve(this.dataList)
                                }
                            }).catch(reject)
                        })
                    }
                    recursion(1)
                })
            },
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.searchParam
                var list = filterList(this.dataList, this.searchParam, [
                    { name: 'sim', type: 'string' },
                    { name: 'imei', type: 'string' },
                    { name: 'iccid', type: 'string' },
                    { name: 'productCode', type: 'string' },
                    { name: 'productName', type: 'string' },
                    { name: 'packageCode', type: 'string' },
                    { name: 'status', type: 'same' },
                    { name: 'productType', type: 'same' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取设备列表
            async queryDeviceList() {
                this.tableData.options.loading = true
                var { guidId, productId } = this.rowData
                var res = await stocktakingApi.getDeviceList({
                    pageIndex: -1,
                    productId: productId,
                    inventorytDeviceId: this.dataId,
                    inventorytDeviceProdId: guidId
                })
                var devices = this.formData.devices || []
                if (devices.length) {
                    this.dataList = devices
                } else {
                    this.dataList = res.data.records.map(item => {
                        var device = devices.find(v => v.deviceId === item.deviceId)
                        if (device) {
                            item.status = device.status
                        } else {
                            item.status = item.status || 0
                        }
                        return item
                    })
                }
                this.filterData()
                this.tableData.options.loading = false
            },
            // 更新盘点价值
            updateCheckValue(data) {
                // 在库价值、盘盈价值和盘亏价值，按照账面数量产品的平均单价乘以相应的“在库数量”、“盘盈数量”、“盘亏数量”，来进行计算
                var average = data.bookValue / data.bookCount
                data.value = rigorous.floatMul(data.count, average)
                data.inventoryLossValue = rigorous.floatMul(data.inventoryLossCount, average)
                data.inventoryProfitValue = rigorous.floatMul(data.inventoryProfitCount, average)
            },
            // 更新盘亏盘盈数量、价值
            updateCheckCount() {
                var data = {
                    count: 0, // 在库数量
                    value: 0, // 在库价值
                    inventoryLossCount: 0, // 盘亏数量
                    inventoryLossValue: 0, // 盘亏价值
                    inventoryProfitCount: 0, // 盘盈数量
                    inventoryProfitValue: 0 // 盘盈价值
                }
                this.dataList.reduce((a, b) => {
                    switch (b.status) {
                    case 1:
                        data.count += 1
                        data.value = rigorous.floatAdd(data.value, b.cost)
                        break
                    case 2:
                        data.inventoryProfitCount += 1
                        data.inventoryProfitValue = rigorous.floatAdd(data.inventoryProfitValue, b.cost)
                        break
                    case 3:
                        data.inventoryLossCount += 1
                        data.inventoryLossValue = rigorous.floatAdd(data.inventoryLossValue, b.cost)
                        break
                    }
                    return a
                }, 0)
                this.formData = {
                    ...this.formData,
                    ...data
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                var columns = []
                var productCategoryId = this.productCategoryId
                var categoryType = (enums.productCategoryId.find(v => v.id === productCategoryId) || {}).value || 0
                var inputRender = (h, { row, column }) => {
                    return (
                        <el-input-number
                            value={row[column.prop]}
                            onInput={res => {
                                row[column.prop] = res
                                this.updateCheckValue(row)
                            }}
                            placeholder={column.label}
                            size='mini'
                            min={0}
                            controls-position='right'
                            style='width:100%;'
                        />
                    )
                }
                var checkStatusRender = (h, { row, column }) => {
                    return (
                        <check-status
                            value={row[column.prop]}
                            readonly={!this.isEdit}
                            onInput={val => {
                                row[column.prop] = val
                                this.updateCheckCount()
                            }}
                            onDelete={() => {
                                this.dataList.splice(this.dataList.indexOf(row), 1)
                                this.updateCheckCount()
                                this.filterData()
                            }}
                        >
                        </check-status>
                    )
                }
                switch (categoryType) {
                case 0:
                    // 智能设备
                    columns = [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 155,
                            isClick: ({ row }) => {
                                return !row._isCreate
                            },
                            idKey: 'deviceId',
                            dialogType: 'device'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120
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
                            prop: 'packageCode',
                            label: '包装箱编号',
                            minWidth: 100
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            minWidth: 155
                        },
                        {
                            prop: 'iccid',
                            label: 'ICCID',
                            minWidth: 155
                        },
                        {
                            type: 'money',
                            prop: 'purchaseUnitPrice',
                            label: '采购成本（元）',
                            minWidth: 120
                        },
                        {
                            fixed: 'right',
                            prop: 'status',
                            label: '状态',
                            align: 'center',
                            minWidth: 85,
                            render: checkStatusRender
                        }
                    ]
                    this.formData = {
                        ...this.formData,
                        ...this.rowData
                    }
                    this.queryDeviceList()
                    break
                case 1:
                    // SIM卡
                    columns = [
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            minWidth: 155,
                            isClick: ({ row }) => {
                                return !row._isCreate
                            },
                            idKey: 'deviceId',
                            dialogType: 'deviceSim'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 200
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            label: '产品类型',
                            prop: 'productType',
                            minWidth: 155
                        },
                        {
                            prop: 'iccid',
                            label: 'ICCID',
                            minWidth: 200
                        },
                        {
                            prop: 'imei',
                            label: '关联设备IMEI',
                            minWidth: 155
                        },
                        {
                            type: 'money',
                            prop: 'purchaseUnitPrice',
                            label: '采购成本（元）',
                            minWidth: 120
                        },
                        {
                            fixed: 'right',
                            prop: 'status',
                            label: '状态',
                            align: 'center',
                            minWidth: 85,
                            render: checkStatusRender
                        }
                    ]
                    this.formData = {
                        ...this.formData,
                        ...this.rowData
                    }
                    this.queryDeviceList()
                    break
                case 2:
                    // 其他产品
                    columns = [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 155,
                            isClick: ({ row }) => {
                                return !row._isCreate
                            },
                            idKey: 'productId',
                            dialogType: 'product'
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            label: '产品类型',
                            prop: 'productType',
                            minWidth: 100
                        },
                        {
                            prop: 'bookCount',
                            label: '库存账面数量',
                            minWidth: 100
                        },
                        {
                            type: 'money',
                            prop: 'bookValue',
                            label: '账面价值',
                            minWidth: 100
                        },
                        {
                            prop: 'count',
                            label: '在库数量',
                            minWidth: 130,
                            render: inputRender
                        },
                        {
                            type: 'money',
                            prop: 'value',
                            label: '在库价值',
                            minWidth: 100
                        },
                        {
                            prop: 'inventoryProfitCount',
                            label: '盘盈数量',
                            minWidth: 130,
                            render: inputRender
                        },
                        {
                            type: 'money',
                            prop: 'inventoryProfitValue',
                            label: '盘盈价值',
                            minWidth: 100
                        },
                        {
                            prop: 'inventoryLossCount',
                            label: '盘亏数量',
                            minWidth: 130,
                            render: inputRender
                        },
                        {
                            type: 'money',
                            prop: 'inventoryLossValue',
                            label: '盘亏价值',
                            minWidth: 100
                        }
                    ]
                    this.dataList = [{ ...this.rowData }]
                    this.filterData()
                    break
                }
                this.tableData.columns = columns
                this.tableData.options.onePageHidePagination = categoryType === 2
            },
            // 一键设置盘点状态为在库
            handleTest() {
                this.dataList.forEach(item => {
                    if (item.status === 0) {
                        item.status = 1
                    }
                })
                this.updateCheckCount()
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.productCategoryId === otherProductCategoryId) {
                    // 页面填写的“在库数量”、“盘亏数量”之和必须等于库存账面数量，否者页面数据不允许提交保存
                    var data = this.dataList[0]
                    if (data.count + data.inventoryLossCount === data.bookCount) {
                        this.$emit('update:visible', false)
                        this.$emit('update', data)
                    } else {
                        this.$message.warning('"在库数量"+"盘亏数量" 必须等于库存账面数量！')
                    }
                } else {
                    this.validate().then(() => {
                        this.$emit('update:visible', false)
                        this.$emit('update', {
                            ...this.formData,
                            devices: this.dataList
                        })
                    })
                }
            },
            // 点击筛选按钮时触发
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                exportTabel({
                    name: '库存盘点',
                    columns: this.tableData.columns,
                    dataList: this.dataList
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                if (this.isEdit) {
                    this.$confirm('确认放弃本次操作？').then(_ => {
                        this.$emit('update:visible', false)
                    }).catch(_ => {
                        return false
                    })
                } else {
                    this.$emit('update:visible', false)
                }
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                var failure = data.reduce((a, b) => {
                    if (b.errorCode > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                var succeed = data.length - failure
                var type = (enums.productCategoryId.find(v => v.id === this.productCategoryId) || {}).value
                data.filter(item => !item.errorCode).forEach(({ code, status }) => {
                    this.dataList.find(item => {
                        var prop
                        switch (type) {
                        case 0:
                            prop = 'imei'
                            break
                        case 1:
                            prop = 'sim'
                            break
                        }
                        if (item[prop] === code) {
                            item.status = status
                            return true
                        }
                    })
                })
                this.updateCheckCount()
                this.$message.success(`导入成功${succeed}条数据，导入失败${failure}条数据`)
            },
            // 添加盘盈设备后触发
            handleCheckDeviceUpdate(data) {
                data.status = 2
                this.dataList.splice(0, 0, data)
                this.updateCheckCount()
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
.layout-detail-container {
    height: 668px;
    .data-view {
        display: flex;
        align-items: center;
        padding: 8px 10px;
        background: #f7f8fa;
        margin-bottom: 10px;
        .item {
            display: flex;
            align-items: center;
            background: #fff;
            border: solid 1px #ebeced;
            padding: 3px;
            height: 30px;
            box-sizing: border-box;
            & + .item {
                margin-left: 10px;
            }
            .label {
                color: #333;
                padding: 0 10px 0 8px;
            }
            .value {
                color: #333;
                line-height: 22px;
                min-width: 40px;
                font-size: 12px;
                text-align: center;
                background: #f2f2f2;
            }
        }
    }
}
</style>
