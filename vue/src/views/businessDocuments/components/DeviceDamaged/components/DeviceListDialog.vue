<!--
* @description 配置报损设备
* @author 望浩然
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            title="配置报损设备"
            width="900px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template v-if="showAction" slot="button">
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="success"
                        @click="handlePutIn"
                    >调入</el-button>
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="warning"
                        @click="handlePutOff"
                    >调出</el-button>
                    <ImportButton
                        :action="importAction"
                        :before-upload="handleBeforeUpload"
                        :upload-data="uploadData"
                        :download-method="handleDownloadTemplate"
                        class="filter-button"
                        title="导入产品报损清单"
                        template-name="产品报损清单导入模板.xlsx"
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
                <template slot="table">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :list="tableData.list"
                        :selected-list="selectList"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @handleSelectionChange="handleSelectionChange"
                    />
                </template>
            </layout-filter>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="handleClose">关 闭</el-button>
                <el-button
                    v-prereclick
                    v-if="showAction"
                    :loading="loading"
                    type="primary"
                    size="mini"
                    @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <SelectDeviceDialog
            v-if="selectDeviceDialog.visible"
            v-bind="deviceStockOut"
            :visible.sync="selectDeviceDialog.visible"
            title="选择报损设备"
            type="device"
            @change="handleSelectChange"
        />
        <PublicDetailDialog
            v-if="deviceDetailDialog.visible"
            :visible.sync="deviceDetailDialog.visible"
            :data-id="deviceDetailDialog.dataId"
            type="device"
        />
    </div>
</template>

<script>
    // 方法
    // API
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import SelectDeviceDialog from '@/components/SelectDialog/index'
    import { deepClone } from '@/utils'
    import enums from '@/utils/enum'
    import deviceDamagedApi from '@/api/businessDocuments/deviceDamaged'
    import store from '@/store'
    export default {
        components: {
            ImportButton,
            SelectDeviceDialog
        },
        props: {
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            visible: { type: Boolean, default: false },
            deviceList: { type: Array },
            isCreate: { type: Boolean, default: false },
            extendParams: { type: Object },
            basicData: { type: Object },
            showAction: { type: Boolean, default: false } // 是否显示操作按钮
        },
        data() {
            return {
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
                        curRowKey: 'imei',
                        mutiSelect: this.showAction,
                        mutiSelectedKey: 'imei'
                    }
                },
                searchParam: {
                    sim: '',
                    imei: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                importAction: '',
                uploadData: {},
                selectList: [],
                dataList: [],
                dataListBackup: [],
                isImportHandle: false,
                productCategory: 0,
                selectDeviceDialog: {
                    visible: false
                },
                deviceStockOut: {
                    value: '',
                    excludes: [],
                    maxCount: Infinity,
                    overageMessage: '',
                    multiple: true,
                    extendParams: {}
                },
                deviceDetailDialog: {
                    visible: false,
                    dataId: null
                },
                tableColumns: []
            }
        },
        computed: {
            title() {
                return ((this.processIndex === 1 || this.processIndex === 2) && this.isApproval) ? '配置退库清单' : '查看退库清单'
            },
            loading() {
                return this.tableData.options.loading
            },
            // 是否需要手动分页
            isPaging() {
                return this.isCreate || this.isImportHandle
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            },
            deviceList: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = deepClone(data) || []
                        this.dataListBackup = deepClone(data) || []
                        this.handleFilter()
                        this.importAction = 'approval-device-damaged/device/import'
                    } else {
                        this.dataList = []
                        this.dataListBackup = []
                    }
                }
            }
        },
        mounted() {
            // 表格配置
            var cellRender = (h, { row, column }) => {
                if (this.isCreate || this.showAction) {
                    var content = []
                    switch (column.prop) {
                    case 'imei':
                        if (row.noExists) {
                            content.push('设备不存在')
                        }
                        break
                    }
                    content = content.map((v, i) => `${i + 1}、${v}`).join('\n')
                    if (content) {
                        row._error = true
                        return (
                          <el-tooltip effect='dark' placement='top'>
                            <div class='warning'>
                              <span>{row[column.prop]}</span>
                              <i class='el-icon-warning'></i>
                            </div>
                            <span style='white-space:pre;line-height:1.4em' slot='content'>{content}</span>
                          </el-tooltip>
                        )
                    }
                }
                return (
                     <span class='link-text' onClick={() => this.showDeviceDetail(row)}>{row[column.prop]}</span>
                 )
            }
            this.TabelConfig = {
                common: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 155
                    },
                    {
                        prop: 'imei',
                        label: 'IMEI',
                        minWidth: 155,
                        render: cellRender
                    },
                    {
                        label: 'ICCID',
                        prop: 'iccid',
                        dbProp: 'c_iccid',
                        sortable: 'custom',
                        width: 200
                    },
                    {
                        label: '包装箱编号',
                        prop: 'packageCode',
                        width: 150,
                        dbProp: 'c_package_code',
                        sortable: 'custom'
                    },
                    {
                        label: 'SIM卡号',
                        prop: 'sim',
                        minWidth: 120,
                        dbProp: 'c_sim',
                        sortable: 'custom'
                    },
                    {
                        label: '设备状态',
                        prop: 'unitStatus',
                        minWidth: 120,
                        sortable: false,
                        type: 'status',
                        enums: enums.deviceStatus
                    },
                    {
                        label: '产品名称',
                        prop: 'productName',
                        minWidth: 200,
                        sortable: false
                    },
                    {
                        label: '产品类型',
                        prop: 'productType',
                        minWidth: 120,
                        formatter: (params, formData) => {
                            return (store.getters.getDict('productType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                        }
                    },
                    {
                        label: '采购合同编号',
                        prop: 'purchaseContractCode',
                        minWidth: 120,
                        sortable: false,
                        isClick: true,
                        dialogType: 'purchaseContract',
                        idKey: 'purchaseContractId'
                    },
                    {
                        label: '供应商',
                        prop: 'supplierName',
                        minWidth: 200,
                        sortable: false,
                        isClick: true,
                        dialogType: 'supplier',
                        idKey: 'supplierId'
                    }
                ]
            }
            this.searchParam = {
                ...this.searchParam,
                ...this.extendParams
            }
            this.tableData.columns = this.TabelConfig.common.concat([])
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.dataList.filter(item => {
                    return (
                        (this.searchParam.sim === '' || item.sim.indexOf(this.searchParam.sim) > -1) &&
                        (this.searchParam.imei === '' || item.imei.indexOf(this.searchParam.imei) > -1)
                    )
                })
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                this.selectList = []
                this.deviceStockOut.extendParams.selectDeviceIds = this.dataList.map(item => item.guidId)
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.dataList.find(item => item._error)) {
                    this.$message.warning('请先处理标红的设备后再试！')
                } else {
                    this.$refs.TableComponent.validate().then(() => {
                        this.$emit('update:visible', false)
                        this.$emit('change', this.dataList)
                    }).catch()
                }
            },
            handleClose() {
                this.dataList = deepClone(this.dataListBackup)
                this.$emit('change', this.dataListBackup)
                this.$emit('update:visible', false)
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 调入
            handlePutIn() {
                this.selectDeviceDialog.visible = true
                // 查询设备
                this.deviceStockOut.extendParams = {
                    listType: 0,
                    imeiList: this.dataList.map(item => item.imei),
                    lockedProps: ['productCategory', 'warehousesId', 'shippingSpaceId', 'typeId'],
                    warehousesId: this.basicData.warehousesId,
                    shippingSpaceId: this.basicData.shippingSpaceId,
                    productCategory: enums.productCategoryId.find(v => v.value === 0).id,
                    typeId: this.basicData.shippingSpaceTypeId,
                    ...this.extendParams
                }
                console.log('this.deviceStockOut.extendParams', this.deviceStockOut.extendParams)
            },
            // 调入 - 确认选择报损设备
            handleSelectChange(list) {
                const defaultList = JSON.parse(JSON.stringify(this.dataList))
                const newList = []
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            deviceId: item.guidId,
                            _idKey: item.imei,
                            ...item
                        }
                        // 判断listFaultCu中是否已经有这条,如果没有则添加
                        let hasOne = false
                        defaultList.map(_item => {
                            if (_item.imei === newItem.imei) {
                                hasOne = true
                            }
                        })
                        if (!hasOne) {
                            newList.push(newItem)
                        }
                    })
                }
                if (newList.length) {
                    this.$message({ type: 'success', message: '成功调入' + newList.length + '台设备!' })
                    // 合并旧列表和新选择的列表
                    this.dataList = defaultList.concat(newList)
                    // 更新列表显示
                    this.filterData()
                } else this.$message({ type: 'warning', message: '没有新的设备被调入' })
            },
            // 调出
            handlePutOff() {
                if (this.selectList.length) {
                    this.selectList.forEach((item) => {
                        this.dataList.map((item_, index) => {
                            if (item_.imei === item.imei) {
                                this.dataList.splice(index, 1)
                            }
                        })
                    })
                    this.selectList = []
                    // 更新列表显示
                    this.filterData()
                } else {
                    this.$message.warning('请至少选择一项')
                }
            },
            // 点击下载模板按钮时触发
            handleDownloadTemplate() {
                deviceDamagedApi.downloadTemplate({})
            },
            // 导入成功时触发
            handleImportSuccess(list) {
                this.handleSelectChange(list)
            },
            handleBeforeUpload() {
                this.uploadData = {
                    warehousesId: this.basicData.warehousesId,
                    shippingSpaceId: this.basicData.shippingSpaceId
                }
                return true
            },
            // 显示设备详情
            showDeviceDetail(row) {
                this.deviceDetailDialog.visible = true
                this.deviceDetailDialog.dataId = row.imei
            }
        }
    }
</script>

<style lang='scss' scoped>
/deep/ {
    .warning {
        color: #F56C6C;
        cursor: pointer;
        i {
            margin-left: 3px;
        }
    }
}
</style>
