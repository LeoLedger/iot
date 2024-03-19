<!--
* @description 延保设备清单
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="!isEdit"
            :title="isEdit ? '配置调拨设备': '查看调拨设备'"
            width="860px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template v-if="isEdit" slot="button">
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
                        :upload-data="importData"
                        :download-method="handleDownloadMethod"
                        action="approvalDeviceTransfer/transfer-device/import"
                        class="filter-button"
                        template-name="导入模板.xlsx"
                        @success="handleImportSuccess"
                    />
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
                </template>
                <template slot="filter-popup">
                    <layout-filter-item label="产品名称">
                        <el-input
                            v-model="searchParam.productName"
                            clearable
                            size="mini"
                            placeholder="产品名称"
                        />
                    </layout-filter-item>
                    <layout-filter-item label="产品编号">
                        <el-input
                            v-model="searchParam.productCode"
                            clearable
                            size="mini"
                            placeholder="产品编号"
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
                    <layout-filter-item label="SIM卡号">
                        <el-input
                            v-model="searchParam.sim"
                            size="mini"
                            placeholder="SIM卡号"
                            clearable
                        />
                    </layout-filter-item>
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
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            @change="handleExportChange"
        />
    </div>
</template>

<script>
    // 方法
    import { filterList } from '@/utils'
    import deviceTableConfig from '@/components/SelectDialog/deviceTableConfig'
    // API
    import deviceAllocateApi from '@/api/businessDocuments/deviceAllocate'
    // 组件
    import SelectDialog from '@/components/SelectDialog'

    export default {
        name: 'ConfigDialog',
        components: {
            SelectDialog
        },
        mixins: [deviceTableConfig.mixin],
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: Object,
            billsData: Object
        },
        data() {
            return {
                loading: false,
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        height: '446px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: true,
                        mutiSelectedKey: 'guidId'
                    }
                },
                importData: {},
                selectList: [],
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                }
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            let { devices, productId } = this.rowData
            this.importData = {
                productId,
                warehousesSpaceOutId: this.billsData.shippingSpaceOutId
            }
            let { columns } = this.getTableConfig(this.billsData.warehousesOutTypeId)
            this.tableData.columns = columns
            if (this.isEdit) {
                this.dataList = devices || []
            }
            this.handleFilter()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                try {
                    var res = await deviceAllocateApi.getDeviceList({
                        ...this.searchParam,
                        transferId: this.billsData.guidId,
                        transferProdId: this.rowData.guidId
                    })
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                } catch (err) {
                    console.error(err)
                }
                this.tableData.options.loading = false
            },
            // 筛选数据
            filterData() {
                if (this.isEdit) {
                    var { pageSize, pageIndex } = this.searchParam
                    var list = filterList(this.dataList, this.searchParam, [
                        { name: 'sim', type: 'string' },
                        { name: 'imei', type: 'string' },
                        { name: 'productName', type: 'string' },
                        { name: 'productCode', type: 'string' },
                        { name: 'productType', type: 'same' }
                    ])
                    this.tableData.total = list.length
                    this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                } else {
                    this.getList()
                }
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                var list = this.dataList
                let { count } = this.rowData
                if (list.length <= count) {
                    this.$emit('change', list)
                    this.$emit('update:visible', false)
                } else {
                    this.$message.warning(`实际调拨设备数量不能大于申请调拨数量（${count}台）`)
                }
            },
            // 点击调入按钮时触发
            handleImport() {
                let maxCount = this.rowData.count - this.dataList.length
                if (maxCount > 0) {
                    let { productCode, productType } = this.rowData
                    let { warehousesOutId, shippingSpaceOutId, warehousesOutTypeId } = this.billsData
                    let extendParams = {
                        isTransfer: 1,
                        productCode,
                        productType,
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                        warehousesId: warehousesOutId, // 仓库id
                        typeId: warehousesOutTypeId, // 仓位类型
                        selectDeviceIds: this.dataList.map(v => v.guidId),
                        lockedProps: ['productCode', 'productType']
                    }
                    if (shippingSpaceOutId === '09509d7b-5be3-4a89-a472-58c14b35cc2c') {
                        // 备用设备调出时，只允许选择状态为“正常”的设备
                        extendParams.unitStatus = 1
                        extendParams.lockedProps.push('unitStatus')
                    } else if (shippingSpaceOutId === '27f5247f-a1ec-47a7-91cc-28402a56f60c') {
                        // 旧设备调出时，不允许选择寄修中、待寄修的设备
                        extendParams.isTransferFromOld = 1
                    }
                    if (warehousesOutTypeId === '3ad17249-a0dd-11eb-8666-000c29bb1337') {
                        // 寄存设备调出时，只允许选择设备“标段销售类型”为出售的设备
                        extendParams.sectionSalesType = 0
                        extendParams.lockedProps.push('sectionSalesType')
                    }
                    this.selectDialog = {
                        type: 'device',
                        title: '调入设备',
                        visible: true,
                        multiple: true,
                        maxCount,
                        extendParams
                    }
                } else {
                    this.$message.warning('已达最大调入数量，请调出部分设备后再试！')
                }
            },
            // 点击调出按钮时触发
            handleExport() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        this.dataList.splice(this.dataList.indexOf(item), 1)
                    })
                    this.selectList = []
                    this.handleFilter()
                } else {
                    this.$message.warning('请至少选中一项！')
                }
            },
            // 选择调入设备后触发
            handleExportChange(list) {
                this.dataList = list.concat(this.dataList)
                this.filterData()
            },
            // 下载导入模板
            handleDownloadMethod() {
                deviceAllocateApi.downloadTemplate()
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                let failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                let succeed = data.length - failure
                let messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
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
                let list = data.filter(v => v.code === 0).map(v => v.data).filter(item => {
                    return this.dataList.findIndex(v => v.guidId === item.guidId) === -1
                })
                this.dataList = list.concat(this.dataList)
                this.filterData()
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
