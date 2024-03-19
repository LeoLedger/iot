<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="true"
        :title="'添加故障设备'"
        width="1200px"
        class="not-padding"
        append-to-body
    >
        <div class="container" style="height: 75vh">
            <el-tabs
                v-model="tabActive"
                @tab-click="handleTabClick"
            >
                <el-tab-pane :disabled="loading" name="0" label="在运营库"/>
                <el-tab-pane :disabled="loading" name="1" label="寄存库"/>
            </el-tabs>
            <div class="body-wrap">
                <layout-filter
                    :table-columns.sync="tableData.columns"
                    :filter-model.sync="searchParam"
                    @search="handleFilter"
                >
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
                            v-model="searchParam.productCode"
                            size="mini"
                            placeholder="产品编号"
                            clearable
                            class="filter-item"
                            @change="handleFilter"
                        />
                    </template>
                    <template slot="table">
                        <TableComponent
                            v-bind="tableData"
                            :selected-list="newSelectList"
                            :page-index.sync="searchParam.pageIndex"
                            :page-size.sync="searchParam.pageSize"
                            @handleSelectionChange="handleSelectionChange"
                            @refreshList="handleRefreshList"
                        />
                    </template>
                </layout-filter>
            </div>
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
            <el-button v-prereclick :loading="tableData.options.loading" type="primary" size="mini" @click="handleConfirm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import deviceApi from '@/api/operationsManagement/carTroubleTicket'
    import enums from '@/utils/enum'
    export default {
        name: 'InsertDialog',
        props: {
            selectList: {
                type: Array,
                default: () => []
            },
            visible: {
                type: Boolean,
                default: false
            },
            dataId: {
                type: String,
                default: null
            }
        },
        data() {
            const that = this
            return {
                loading: false,
                tabActive: '0',
                newSelectList: [],
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1,
                    warehousesId: ''
                },
                tableData: {
                    list: [],
                    total: 0,
                    columns: [
                        {
                            label: 'IMEI',
                            prop: 'imei',
                            minWidth: 150,
                            dbProp: 'c_imei',
                            sortable: 'custom',
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'guidId',
                            fixed: 'left'
                        },
                        {
                            label: '产品编号',
                            prop: 'productCode',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            label: 'ICCID',
                            prop: 'iccid',
                            minWidth: 180,
                            dbProp: 'c_iccid',
                            sortable: 'custom'
                        },
                        {
                            label: '包装箱编号',
                            prop: 'packageCode',
                            minWidth: 100,
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
                            sortable: false,
                            isClick: true,
                            dialogType: 'supplier',
                            idKey: 'supplierId'
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
                            type: 'money'
                        },
                        {
                            label: '入库单号',
                            prop: 'enterWarehouseCode',
                            width: 140,
                            isClick: true,
                            dialogType: 'storagePutApproval',
                            idKey: 'enterWarehouseId'
                        },
                        {
                            label: '入库时间',
                            prop: 'enterWarehouseTime',
                            width: 140,
                            dbProp: 'c_enter_warehouse_time',
                            sortable: 'custom'
                        },
                        {
                            label: '入库人',
                            prop: 'enterWarehouseUserName',
                            width: 140,
                            sortable: false
                        },
                        {
                            label: '出库时间',
                            prop: 'outWarehouseTime',
                            width: 140,
                            dbProp: 'c_out_warehouse_time',
                            sortable: 'custom'
                        },
                        {
                            label: '销售类型',
                            prop: 'salesType',
                            width: 140,
                            type: 'dict',
                            dictType: 'salesType',
                            sortable: false
                        },
                        {
                            label: '所在项目',
                            prop: 'projectName',
                            minWidth: 200,
                            sortable: false,
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId'
                        },
                        {
                            label: '所在标段',
                            prop: 'sectionName',
                            minWidth: 200,
                            sortable: false,
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId'
                        },
                        {
                            label: '所在企业',
                            prop: 'customerName',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '服务到期时间',
                            prop: 'serviceEndDate',
                            width: 140,
                            dbProp: 'c_service_end_date',
                            sortable: 'custom'
                        },
                        {
                            label: '使用时长(天)',
                            prop: 'durationDay',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '剩余保修期(天)',
                            prop: 'warrantyPeriodDay',
                            width: 140,
                            dbProp: 'c_warranty_period_day',
                            sortable: 'custom'
                        },
                        {
                            label: '设备残值(元)',
                            prop: 'unitResidual',
                            minWidth: 200,
                            sortable: false,
                            type: 'money'
                        },
                        {
                            label: '授权IP',
                            prop: 'empowerIp',
                            minWidth: 200,
                            sortable: false,
                            type: 'dict',
                            dictType: 'empowerIp'
                        },
                        {
                            label: '状态确认时间',
                            prop: 'statusTime',
                            minWidth: 200,
                            sortable: false
                        },
                        {
                            label: '最后通信时间',
                            prop: 'lastCommunTime',
                            minWidth: 200,
                            sortable: false
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'imei',
                        mutiSelect: true,
                        mutiSelectedKey: 'imei',
                        showMutiSelectList: false,
                        selectable: (row, index) => { return row._selectable !== false }
                    },
                    // 列操作按钮
                    operates: {
                        show: false
                    }
                }
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            },
            dataId() {
                this.getList()
            }
        },
        mounted() {
            this.handleTabClick()
        },
        methods: {
            // 请求列表数据
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    // 获取排除列表
                    const selectListIds = []
                    this.selectList.map(item => {
                        selectListIds.push(item.deviceId)
                    })
                    const res = await deviceApi.getDeviceList({
                        ...this.searchParam,
                        supplierId: this.dataId
                        // warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de', // 客户仓库
                        // typeId: 'cf946c33-9f2c-11eb-bbfa-000c29bb1337', // 在运营仓位
                        // productType: '95E968C3-D1BE-4A6C-93A8-6AF62558B909', // 车载设备
                        // unitStatus: 1, // 正常
                        // productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                        // selectDeviceIds: selectListIds,
                        // listType: 0
                    })
                    if (res.success) {
                        this.tableData.list = res.data.records.map(item => {
                            item._idKey = item.imei
                            // 判断是否已选择,则禁止再选择
                            this.selectList.map(dItem => {
                                if (dItem.imei === item.imei) {
                                    item._selectable = false
                                    this.$set(item, '_selectable', false)
                                }
                            })
                            return item
                        })
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                }
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
            },
            handleConfirm() {
                this.$emit('confirm', this.newSelectList)
                this.$emit('close', false)
            },
            handleTabClick() {
                this.searchParam.pageIndex = 1
                this.searchParam.warehousesId = this.tabActive === '0' ? this.getWarehousesSpaceType(0, '在运营') : this.getWarehousesSpaceType(0, '寄存')
                this.getList()
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                console.log('handleSelectionChange', val)
                this.newSelectList = val
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    display: flex;
    flex-direction: column;
    padding: 0 10px 10px;
    .body-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
