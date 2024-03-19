<!--
* @fileName 选择挂起设备
* @author   望浩然
* @date     2021/7/24
-->
<template>
    <el-dialog
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="选择挂起设备"
        class=""
        width="1000px"
        append-to-body>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="filter">
                <el-input
                    v-model="searchParam.productCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="产品编号"
                    @change="handleSearch"/>
                <el-input
                    v-model="searchParam.imei"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="IMEI号"
                    @change="handleSearch"/>
                <RemoteSelect
                    v-model="searchParam.productType"
                    :method="productTypeRemoteMethod"
                    :extend-params="{ categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424' }"
                    label-key="dictName"
                    value-key="dictId"
                    filter-label-key="dictName"
                    placeholder="选择产品类型"
                    clearable
                    class="filter-item"
                />
            </template>
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :selected-list="[ selectRow ]"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                    @handleSingleSelectChange="handleSelectionChange"
                />
            </template>
        </layout-filter>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">取 消</el-button>
            <el-button v-prereclick :disabled="!selectRow" size="mini" type="primary" @click="handleConfirm">选 择</el-button>
        </span>
        <ConfirmDialog
            v-if="confirmDialog.visible"
            :visible.sync="confirmDialog.visible"
            :row-data="selectRow"
            @submit="handleSubmit"
        />
    </el-dialog>
</template>

<script>
    import mixin from '@/views/inventoryManagement/mixin'
    import deviceApi from '@/api/inventory/device'
    import enums from '@/utils/enum'
    import ConfirmDialog from './ConfirmDialog'

    export default {
        components: { ConfirmDialog },
        props: {
            visible: false,
            // 数据刷新标志
            freshKey: {
                type: [Number, String, Date],
                default: 0
            }
        },
        data() {
            const that = this
            return {
                productTypeRemoteMethod: deviceApi.getDictList,
                selectRow: [],
                confirmDialog: {
                    visible: false
                },
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
                            idKey: 'imei',
                            isCopy: true
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
                            align: 'center',
                            sortable: false,
                            type: 'status',
                            enums: enums.deviceStatus
                        },
                        {
                            label: '产品名称',
                            prop: 'productName',
                            minWidth: 100,
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
                            render: (h, params = {}) => {
                                const { row, column } = params
                                return <span class='link-text' onClick={() => mixin.handleDetailClick(params)}>{row.supplierName || '--'}</span>
                            }
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
                                return (params.warrantyPeriodDay || 0) + '天'
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
                                return (params.durationDay || 0) + '天'
                            }
                        },
                        {
                            label: '设备残值',
                            prop: 'unitResidual',
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
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '500px',
                        curRowKey: 'guidId',
                        showSingleSelectCheckBox: true,
                        mutiSelectedKey: 'guidId'
                    },
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        watch: {
            // 监听数据刷新标志
            freshKey() {
                this.init()
            },
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            // 初始化
            init() {
                this.getList()
            },
            /** 加载数据 */
            // 获取设备列表数据
            async getList() {
                this.tableData.options.loading = true
                const params = Object.assign({}, this.searchParam)
                // 排除已挂机设备
                params.warehousesId = '1bba900a-26c8-492e-bd6d-1583814866c9'
                params.warehousesSpaceId = '92bac0e7-eadd-493a-b6bd-17a5a45d0bbb'
                params.excludeUnitStatus = [1, 5, 8]
                let res
                res = await deviceApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                setTimeout(() => {
                    this.tableData.options.loading = false
                }, 500)
            },
            /** 事件处理 */
            // 搜索
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            // 多选-选中表格行时触发
            handleSelectionChange(row) {
                this.selectRow = row
            },
            handleCancel() {
                this.selectRow = null
                this.$emit('close', false)
                this.$emit('update:visible')
            },
            handleConfirm() {
                this.confirmDialog.visible = true
            },
            handleSubmit() {
                this.getList()
                this.$emit('update:visible', false)
                this.$emit('success')
            }
        }
    }
</script>

<style scoped>

</style>
