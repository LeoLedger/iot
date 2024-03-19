<!--
* @description 配置智能设备出库清单
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            :title="title"
            width="800px"
            append-to-body
            @close="handleCancel"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template slot="button">
                    <el-button
                        v-if="!isEdit"
                        v-waves
                        :disabled="!tableData.total"
                        size="mini"
                        class="filter-button"
                        type="warning"
                        @click="handleExportExcel"
                    >导出</el-button>
                    <template v-if="isEdit">
                        <template v-if="contract.contractType !== 2">
                            <el-button
                                v-waves
                                size="mini"
                                class="filter-button"
                                type="success"
                                @click="handleImport"
                            >调入</el-button>
                            <el-button
                                v-waves
                                :disabled="!tableData.total"
                                size="mini"
                                class="filter-button"
                                type="warning"
                                @click="handleExport"
                            >调出</el-button>
                            <ImportButton
                                :action="importAction"
                                :upload-data="importData"
                                :download-method="handleDownloadMethod"
                                class="filter-button"
                                title="导入出库清单"
                                template-name="出库清单导入模板.xlsx"
                                @success="handleImportSuccess"
                            />
                        </template>
                        <template v-else>
                            <ImportButton
                                :upload-data="uploadDataBuyin"
                                :download-method="handleDownloadBuyinTemplate"
                                action="approval-device-out/buyin-device/import"
                                class="filter-button"
                                template-name="导入模板.xlsx"
                                @success="handleBuyinImportSuccess"
                            />
                        </template>
                    </template>
                </template>
                <template slot="filter">
                    <el-input
                        v-model="searchParam.imei"
                        size="mini"
                        placeholder="IMEI"
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
                <template slot="table">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :selected-list="selectList"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @handleSelectionChange="handleSelectionChange"
                    />
                </template>
            </layout-filter>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 选择出库设备 -->
        <SelectDialog
            v-if="deviceStockOut.visible"
            v-bind="deviceStockOut"
            :visible.sync="deviceStockOut.visible"
            title="选择出库设备"
            type="device"
            @change="handleDeviceStockOutChange"
        />
    </div>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    import { filterList, exportTabel } from '@/utils'
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 组件
    import SelectDialog from '@/components/SelectDialog/index'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        name: 'Intelligent',
        components: {
            SelectDialog,
            ImportButton
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: { type: Object, required: true },
            excludes: { type: Array },
            contract: { type: Object, required: true },
            isCreate: { type: Boolean, default: false },
            extendParams: { type: Object },
            selectDeviceIds: { type: Array, default: () => [] },
            selectDeviceImeis: { type: Array, default: () => [] }
        },
        data() {
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: false,
                        mutiSelectedKey: 'guidId'
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                deviceStockOut: {
                    value: '',
                    excludes: [],
                    maxCount: Infinity,
                    overageMessage: '已达最大出库数量',
                    visible: false,
                    multiple: false,
                    extendParams: {
                        // 设备状态
                        unitStatus: null,
                        // 排除列表
                        selectDeviceIds: [],
                        // 产品种类
                        productCategory: null,
                        // 仓库id
                        warehousesId: null,
                        // 仓位id
                        typeId: null,
                        notSelectClick: () => {
                            this.$message.warning('该设备已经被选择！')
                        }
                    }
                },
                importData: {},
                selectList: [],
                importAction: 'approval-device-out/import/',
                activeRowData: null,
                importDialogVisible: false
            }
        },
        computed: {
            title() {
                return this.isEdit ? '配置出库清单' : '查看出库清单'
            },
            loading() {
                return this.tableData.options.loading
            },
            uploadDataBuyin() {
                let { guidId, outType } = this.contract
                return {
                    outId: guidId,
                    outType,
                    outProdId: this.rowData.guidId,
                    selectImeis: this.selectDeviceImeis
                }
            }
        },
        watch: {
            rowData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = data.devices ? JSON.parse(JSON.stringify(data.devices)) : []
                        if (this.contract.contractType === 2) {
                            this.dataList.forEach(item => {
                                item._initial = JSON.parse(JSON.stringify(item))
                            })
                        }
                        this.importData = {
                            outType: this.contract.outType,
                            category: data.productCategoryId,
                            productId: data.productId
                        }
                        this.handleFilter()
                    } else {
                        this.dataList = []
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
            // 表格配置
            this.TabelConfig = {
                default: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 155
                    },
                    {
                        prop: 'imei',
                        label: 'IMEI',
                        minWidth: 155
                    },
                    {
                        prop: 'sim',
                        label: 'SIM卡号',
                        minWidth: 155
                    }
                ],
                // 补购
                buyIn: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 155
                    },
                    {
                        prop: 'oldImei',
                        label: '丢失设备IMEI',
                        minWidth: 155
                    },
                    {
                        prop: 'outImei',
                        label: '出库设备IMEI',
                        minWidth: 155,
                        render: this.isEdit && ((h, { row, column }) => {
                            return (
                                <pick-input
                                    value={row[column.prop]}
                                    error={row._error}
                                    placeholder='选择出库设备'
                                    readonly
                                    onPick={() => {
                                        this.handleStorageOut(row)
                                    }}
                                >
                                    <span slot='icon'>选</span>
                                </pick-input>
                            )
                        })
                    }
                ]
            }
            this.searchParam = {
                ...this.searchParam,
                ...this.extendParams
            }
            this.updateTabelConfig()
        },
        methods: {
            // 验证表单
            validate(data) {
                var pass = true
                if (data) {
                    pass = !!data.guidId
                    data._error = !data.guidId
                } else {
                    this.tableData.list.forEach(item => {
                        if (!item.guidId) {
                            pass = false
                        }
                        item._error = !item.guidId
                    })
                }
                return pass
            },
            // 筛选数据
            filterData() {
                if (this.isEdit) {
                    // 编辑模式需要前端实现分页
                    let list = []
                    let { pageSize, pageIndex } = this.searchParam
                    if (this.contract.contractType === 2) {
                        list = filterList(this.dataList, this.searchParam, [
                            { name: 'sim', type: 'string' },
                            { name: 'imei', type: 'string', dataKey: 'oldImei' }
                        ])
                    } else {
                        list = filterList(this.dataList, this.searchParam, [
                            { name: 'sim', type: 'string' },
                            { name: 'imei', type: 'string' }
                        ])
                    }
                    this.tableData.total = list.length
                    this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                } else {
                    this.queryConfigDeviceList()
                }
            },
            // 获取配置的出库设备
            async queryConfigDeviceList() {
                this.tableData.options.loading = true
                let res = await storageOutApi.getConfigDeviceList({
                    ...this.searchParam,
                    outId: this.contract.guidId,
                    category: this.rowData.productCategoryId,
                    outProdId: this.rowData.guidId
                })
                if (this.contract.contractType === 2) {
                    this.tableData.list = res.data.records.map(({
                        imei,
                        outImei,
                        productCode
                    }) => {
                        return {
                            oldImei: imei,
                            outImei,
                            productCode
                        }
                    })
                } else {
                    this.tableData.list = res.data.records
                }
                this.tableData.total = res.data.total
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                this.selectList = []
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击取消按钮时触发
            handleCancel() {
                if (this.contract.contractType === 2) {
                    // 还原数据
                    this.tableData.list.forEach(item => {
                        Object.assign(item, item._initial)
                        delete item._initial
                    })
                }
                this.$emit('update:visible', false)
            },
            // 点击提交按钮时触发
            handleSubmit() {
                var contractType = this.contract.contractType
                if (contractType === 2) {
                    if (!this.validate()) {
                        return this.$message.warning('请选择出库设备！')
                    }
                } else {
                    if (this.dataList.length > this.rowData.countApply) {
                        return this.$message.warning('出库数量不能大于申请出库数量，请调出部分设备后再试！')
                    }
                }
                this.$emit('change', this.dataList)
                this.$emit('update:visible', false)
            },
            // 点击调入按钮时触发
            handleImport() {
                let { countApply, productCode } = this.rowData
                var count = this.dataList.length
                if (count < countApply) {
                    this.activeRowData = null
                    this.deviceStockOut.value = null
                    this.deviceStockOut.visible = true
                    this.deviceStockOut.maxCount = countApply - count
                    this.deviceStockOut.extendParams = {
                        ...this.deviceStockOut.extendParams,
                        productCode,
                        selectDeviceIds: this.dataList.map(item => item.guidId).concat(this.selectDeviceIds),
                        lockedProps: ['productCode']
                    }
                } else {
                    this.$message.warning('已达最大出库数量，请调出部分设备后再试！')
                }
            },
            // 点击调出按钮时触发
            handleExport() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        this.dataList.splice(this.dataList.indexOf(item), 1)
                    })
                    this.handleFilter()
                } else {
                    this.$message.warning('请至少选中一项！')
                }
            },
            // 导出文档
            handleExportExcel() {
                storageOutApi.exportConfigDeviceList({
                    ...this.searchParam,
                    outId: this.contract.guidId,
                    category: this.rowData.productCategoryId,
                    contractType: this.contract.contractType,
                    outProdId: this.rowData.guidId,
                    pageSize: this.tableData.total
                })
            },
            // 点击选择出库设备按钮时触发
            handleStorageOut(data) {
                let { contractType } = this.contract
                let { productType, productCode } = this.rowData
                let extendParams = {}
                let selectDeviceIds = this.dataList.filter(v => v !== data && v.guidId).map(item => item.guidId).concat(this.selectDeviceIds)
                if (contractType === 2 && productType === '288F8C2D-9CEB-46FC-87C9-DC4C16108162') {
                    extendParams = {
                        productCode: void 0,
                        selectDeviceIds,
                        // lockedProps: ['productType'],
                        productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162'
                    }
                } else {
                    extendParams = {
                        productCode,
                        selectDeviceIds
                        // lockedProps: ['productCode']
                    }
                }
                this.activeRowData = data
                this.deviceStockOut.value = {
                    sim: data.oldSim,
                    imei: data.oldImei,
                    guidId: data.oldDeviceId
                }
                this.deviceStockOut.visible = true
                this.deviceStockOut.excludes = this.dataList.map(item => item.guidId)
                this.deviceStockOut.extendParams = {
                    ...this.deviceStockOut.extendParams,
                    ...extendParams
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                var contractType = this.contract.contractType
                if (contractType === 2) {
                    // 补购
                    this.deviceStockOut.multiple = false
                    this.tableData.columns = this.TabelConfig.buyIn
                } else {
                    this.deviceStockOut.multiple = true
                    this.tableData.columns = this.TabelConfig.default
                }
                this.tableData.options.mutiSelect = this.isEdit && contractType !== 2
                // 根据产品种类设置出库仓库信息
                var { productCategoryId } = this.rowData
                var unitStatus = null
                var warehousesId = null
                var typeId = null
                var productCategory = productCategoryId
                var category = enums.productCategoryId.find(item => item.id === productCategory)
                switch (category.value) {
                case 0:
                    // 智能设备
                    warehousesId = '1bba900a-26c8-492e-bd6d-1583814866c9'
                    switch (this.contract.outType) {
                    case 0:
                        // 全新库存
                        typeId = this.getWarehousesSpaceType(0, '全新')
                        break
                    case 1:
                        // 旧设备库存
                        unitStatus = 1
                        typeId = this.getWarehousesSpaceType(0, '旧设备')
                        break
                    }
                    break
                case 1:
                    // SIM卡
                    warehousesId = '1bba900a-26c8-492e-bd6d-1583814866c9'
                    typeId = this.getWarehousesSpaceType(2, '全新')
                    break
                case 2:
                    // 非智能设备
                    warehousesId = '1bba900a-26c8-492e-bd6d-1583814866c9'
                    typeId = this.getWarehousesSpaceType(1, '全新')
                    break
                }
                this.deviceStockOut.extendParams = {
                    ...this.deviceStockOut.extendParams,
                    unitStatus,
                    warehousesId,
                    typeId,
                    productCategory
                }
            },
            // 下载导入模板
            handleDownloadMethod() {
                storageOutApi.downloadTemplate({
                    category: this.rowData.productCategoryId
                })
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                var failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    } else if (this.dataList.findIndex(v => v.guidId === b.data.guidId) > -1) {
                        b.code = 1
                        b.errorMsg = '设备已在列表中'
                        return a + 1
                    } else if (this.selectDeviceIds.findIndex(v => v === b.data.guidId) > -1) {
                        b.code = 1
                        b.errorMsg = '设备已被该产品的其他销售模式添加'
                        return a + 1
                    }
                    return a
                }, 0)
                var succeed = data.length - failure
                var messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
                messageNode += data.map((item, index) => {
                    if (item.code > 0) {
                        return `<p>第${index + 1}行：${item.errorMsg}</p>`
                    }
                }).filter(v => v).join('')
                this.$message({
                    type: 'success',
                    duration: failure > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.dataList = data.filter(item => item.code === 0).map(item => item.data).concat(this.dataList)
                this.filterData()
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 选择出库设备后触发
            handleDeviceStockOutChange(list) {
                if (this.contract.contractType === 2) {
                    // 选择替换设备
                    let { sim, imei, guidId, productId } = list[0]
                    Object.assign(this.activeRowData, {
                        sim,
                        imei,
                        guidId,
                        productId,
                        outImei: imei
                    })
                    this.validate(this.activeRowData)
                    console.log(this.dataList)
                } else {
                    // 调入设备
                    let props = this.tableData.columns.map(item => item.prop).concat([
                        'id',
                        'guidId',
                        'salesType',
                        'productId',
                        'outContractId',
                        'originalOutImei',
                        'purchaseUnitPrice'
                    ])
                    this.dataList = this.dataList.concat(list.map(item => {
                        let data = {}
                        props.forEach(key => {
                            data[key] = item[key]
                        })
                        return data
                    }))
                    this.handleFilter()
                }
            },
            // 下载补购模板
            handleDownloadBuyinTemplate() {
                storageOutApi.downloadBuyinTemplate({
                    outId: this.contract.guidId,
                    outProdId: this.rowData.guidId
                })
            },
            // 导入成功时触发
            handleBuyinImportSuccess({ data, batchId }) {
                let failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                let succeed = data.length - failure
                let messageNode = (
                    <div class='el-message__content'>
                        <p style='margin-bottom: 4px;'>导入成功{succeed}条数据，导入失败{failure}条数据</p>
                        {
                            batchId ? <p
                                class='link-text'
                                style='margin-bottom: 4px;'
                                onClick={() => storageOutApi.downloadBuyinError(batchId)}
                            >导入失败清单.xlsx</p> : ''
                        }
                        {
                            data.map((item, index) => {
                                if (item.code > 0) {
                                    return <p>第{index + 1}行：{item.errorMsg}</p>
                                }
                            })
                        }
                    </div>
                )
                this.$message({
                    type: 'success',
                    duration: failure > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                data.filter(v => v.code === 0).map(v => v.data).forEach(item => {
                    let data = this.dataList.find(v => v.oldImei === item.imei)
                    if (data) {
                        let { sim, outImei, guidId, productId } = item
                        Object.assign(data, {
                            sim,
                            imei: outImei,
                            guidId,
                            productId,
                            outImei
                        })
                        this.validate(data)
                    }
                })
                this.handleFilter()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
