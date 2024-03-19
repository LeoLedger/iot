<!--
* @fileName 项目备用设备配置 - 已分配备用设备
* @author   望浩然
* @date     2021/4/26
-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleSearch"
    >
        <template slot="button">
            <el-button
                v-if="selectList.length && isEdit"
                size="mini"
                icon="el-icon-delete"
                @click="handleDelBatch"
            >
                移除设备
            </el-button>
            <el-button
                v-if="isEdit"
                size="mini"
                type="success"
                icon="el-icon-plus"
                @click="handlePutIn"
            >
                调入
            </el-button>
            <ImportButton
                v-if="isEdit"
                :before-upload="handleBeforeUpload"
                :action="importAction"
                :upload-data="uploadData"
                :download-method="handleDownloadTemplate"
                class="filter-button"
                title="导入分配清单"
                template-name="设备分配导入模板.xlsx"
                @success="handleImportSuccess"
            />
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.imei"
                clearable
                class="filter-item"
                size="mini"
                placeholder="IMEI号"
                @change="handleSearch"/>
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :list="tableData.list"
                :selected-list="selectList"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                :table-row-class-name="handleTableRowClassName"
                @handleSelectionChange="handleSelectionChange"
                @refreshList="handleSearch"
            >
                <template slot="操作" slot-scope="scope">
                    <el-button v-if="!scope.row._delete" size="mini" icon="el-icon-delete" title="移除" @click="handleDelete(scope.row)"/>
                    <el-button v-else size="mini" icon="el-icon-refresh-left" title="还原" @click="handleDeleteCancel(scope.row)"/>
                </template>
            </TableComponent>
        </template>
        <template slot="filter-top">
            <div class="info-box">
                本项目初始已分配 {{ defaultResDataTotal }} 个设备
                <span v-if="deleteList.length">，您将移除 {{ deleteList.length }} 个设备</span>
                <span v-if="addList.length">，您将调入 {{ addList.length }} 个设备</span>
                <span v-if="addList.length || deleteList.length">，保存后才会生效！</span>
            </div>
        </template>
        <backup-dev-select-dialog
            v-if="backDevSelectDialog.visible"
            :visible.sync="backDevSelectDialog.visible"
            :selected-list="addList"
            :deleted-list="deleteList"
            :product-id="rowData.productId"
            @confirm="handleConfirm"
        />
    </layout-filter>
</template>

<script>
    import mixin from '@/views/inventoryManagement/mixin'
    import deviceApi from '@/api/inventory/device'
    import enums from '@/utils/enum'
    import BackupDevSelectDialog from '@/views/inventoryManagement/Backup/ProjectDevice/backupDevSelectDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        components: { ImportButton, BackupDevSelectDialog },
        props: {
            // 过滤参数
            rowData: {
                type: Object,
                default: () => {}
            },
            // 是否可编辑
            isEdit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            const that = this
            return {
                selectList: [],
                resDataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '产品编号',
                            prop: 'productCode',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            label: 'IMEI',
                            prop: 'imei',
                            minWidth: 150,
                            dbProp: 'c_imei',
                            sortable: 'custom',
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'guidId'
                        },
                        {
                            label: 'ICCID',
                            prop: 'iccid',
                            width: 200,
                            dbProp: 'c_iccid',
                            sortable: 'custom'
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
                                return (that.getDict('productType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
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
                            sortable: false
                        },
                        {
                            label: '采购日期',
                            prop: 'purchaseDate',
                            width: 100,
                            dbProp: 'c_purchase_date',
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            label: '采购成本(元)',
                            prop: 'purchaseUnitPrice',
                            width: 120,
                            dbProp: 'c_purchase_unit_price',
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '入库时间',
                            prop: 'enterWarehouseTime',
                            width: 140,
                            dbProp: 'c_enter_warehouse_time',
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            label: '入库人',
                            prop: 'enterWarehouseUserName',
                            width: 140,
                            sortable: false
                        },
                        {
                            label: '质保开始时间',
                            prop: 'warrantyStartDate',
                            width: 140,
                            dbProp: 'c_warranty_start_date',
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            label: '质保截止时间',
                            prop: 'warrantyEndDate',
                            width: 140,
                            dbProp: 'c_warranty_end_date',
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            label: '剩余保修期(天)',
                            prop: 'warrantyPeriodDay',
                            width: 120,
                            dbProp: 'c_warranty_period_day',
                            sortable: 'custom',
                            align: 'right',
                            formatter: (params, formData) => {
                                return params[formData.prop] + '天'
                            }
                        },
                        {
                            label: '出库时间',
                            prop: 'outWarehouseTime',
                            width: 140,
                            dbProp: 'c_out_warehouse_time',
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            label: '所在项目(回收前)',
                            prop: 'projectName',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '所在标段(回收前)',
                            prop: 'sectionName',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '所在企业(回收前)',
                            prop: 'customerName',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '使用时长(天)',
                            prop: 'durationDay',
                            minWidth: 200,
                            sortable: false,
                            align: 'right',
                            formatter: (params, formData) => {
                                return params[formData.prop] + '天'
                            }
                        },
                        {
                            label: '设备残值',
                            prop: 'unitResidual',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '备用项目',
                            prop: 'standbyProjectName',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '状态确认时间',
                            prop: 'statusTime',
                            minWidth: 200,
                            sortable: false,
                            type: 'date'
                        },
                        {
                            label: '最后通信时间',
                            prop: 'lastCommunTime',
                            minWidth: 200,
                            sortable: false,
                            type: 'date'
                        }
                    ],
                    options: {
                        height: null,
                        stripe: false, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        mutiSelectedKey: 'guidId',
                        mutiSelect: this.isEdit
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        height: '350px',
                        fixed: 'right',
                        show: false
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                deleteList: [],
                addList: [],
                backDevSelectDialog: {
                    visible: false
                },
                defaultResDataTotal: 0,
                importAction: 'device/distribution/import',
                uploadData: {}
            }
        },
        watch: {
            // 监听数据刷新标志
            rowData: {
                handler() {
                    this.init()
                },
                immediate: true,
                deep: true
            },
            'searchParam.pageSize'() {
                this.handleFilterData()
            },
            'searchParam.pageIndex'() {
                this.handleFilterData()
            }
        },
        mounted() {
            this.deleteList = []
            this.init()
        },
        methods: {
            // 初始化
            init() {
                this.getList()
            },
            /** 加载数据 */
            handleFilterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.resDataList.filter(item => {
                    const find = this.selectList.find(v => v.imei === item.imei)
                    if (find) return true
                    return (
                        (!this.searchParam.imei || (item.imei && item.imei.indexOf(this.searchParam.imei) > -1))
                    )
                })
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取设备列表数据
            async getList() {
                // 如果传入了standbyProjectId和productId才查询
                if (this.rowData.standbyProjectId && this.rowData.productId) {
                    this.tableData.options.loading = true
                    const params = Object.assign({}, this.searchParam, this.rowData)
                    params.pageSize = -1
                    const res = await deviceApi.getList(params)
                    if (res.success) {
                        this.resDataList = res.data.records
                        this.defaultResDataTotal = res.data.records.length
                        this.handleFilterData()
                    }
                    setTimeout(() => {
                        this.tableData.options.loading = false
                    }, 500)
                }
            },
            /** 事件处理 */
            // 搜索
            handleSearch() {
                this.handleFilterData()
            },
            handleDelete(row) {
                // 判断是否已在移除列表
                if (this.deleteList.indexOf(row.guidId) < 0) {
                    const index = this.resDataList.findIndex(v => v.guidId === row.guidId)
                    this.resDataList.splice(index, 1)
                    // 判断删除的设备是否在新增列表里
                    const addIndex = this.addList.indexOf(row.guidId)
                    if (addIndex > -1) {
                        this.addList.splice(addIndex, 1)
                        this.$emit('add', this.addList)
                        this.$message.info('该设备并未保存，已直接删除')
                    } else {
                        this.deleteList.push(row.guidId)
                        this.$emit('delete', this.deleteList)
                    }
                }
                this.handleFilterData()
            },
            // 调入设备
            handleConfirm(list) {
                if (list && list.length) {
                    // 判断设备是否有guidId
                    list.map(item => {
                        if (item.guidId) {
                            // 判断设备是否在移除列表里面
                            const delIndex = this.deleteList.indexOf(item.guidId)
                            if (delIndex > -1) {
                                this.deleteList.splice(delIndex, 1)
                            } else {
                                this.addList.push(item.guidId)
                            }
                            this.resDataList.push(item)
                        }
                    })
                    this.$emit('add', this.addList)
                    this.handleFilterData()
                }
            },
            handleDelBatch() {
                this.selectList.map(item => {
                    const index = this.resDataList.findIndex(v => v.guidId === item.guidId)
                    if (index > -1) {
                        this.resDataList.splice(index, 1)
                        // 判断删除的设备是否在新增列表里
                        const addIndex = this.addList.indexOf(item.guidId)
                        if (addIndex > -1) {
                            this.addList.splice(addIndex, 1)
                            // this.$message.info('该设备并未保存，已直接删除')
                        } else {
                            this.deleteList.push(item.guidId)
                        }
                    }
                })
                this.$emit('add', this.addList)
                this.$emit('delete', this.deleteList)
                this.selectList = []
                this.handleFilterData()
            },
            handlePutIn() {
                this.backDevSelectDialog.visible = true
            },
            handleDeleteCancel(row) {
                this.$set(row, '_delete', false)
                this.deleteList.map((item, index) => {
                    if (item === row.guidId) {
                        this.deleteList.splice(index, 1)
                    }
                })
                this.$emit('delete', this.deleteList)
            },
            handleTableRowClassName({ row, rowIndex }) {
                if (row._delete) {
                    return 'deleteRow'
                } else return ''
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            handleBeforeUpload() {
                this.uploadData = {
                    standbyProjectId: 'empty',
                    unitStatus: 1,
                    productId: this.rowData.productId || '未找到产品id',
                    listType: 0,
                    selectDeviceIds: this.addList,
                    removeDeviceIds: this.deleteList,
                    warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                    warehousesSpaceId: '09509d7b-5be3-4a89-a472-58c14b35cc2c'
                }
                return true
            },
            handleDownloadTemplate() {
                deviceApi.downloadDistributionTemplate({})
            },
            handleImportSuccess(res) {
                if (res.data && res.data.length) {
                    this.handleConfirm(res.data)
                }
                if (res.message) {
                    this.$message.warning(res.message)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
.deleteRow {
  /deep/ &.el-table__row {
    background-color: #dcdfe6;
  }
}
.info-box {
  color: #1379f7;
  margin-bottom: 5px;
}
</style>
