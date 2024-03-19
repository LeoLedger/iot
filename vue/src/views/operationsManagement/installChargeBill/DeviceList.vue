<!--
* @description 已安装设备
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.installChargeBill.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.installChargeBill.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.installCode"
                size="mini"
                placeholder="单据编号"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.installStatus"
                type="deviceInstallChargeStatus"
                placeholder="状态"
                clearable
                filterable
                size="mini"
                style="width: 200px"
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同编号">
                <el-input
                    v-model="searchParam.contractCode"
                    size="mini"
                    placeholder="合同编号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="项目名称">
                <el-input
                    v-model="searchParam.projectName"
                    size="mini"
                    placeholder="项目名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="企业名称">
                <el-input
                    v-model="searchParam.customerName"
                    size="mini"
                    placeholder="企业名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="标段名称">
                <el-input
                    v-model="searchParam.sectionName"
                    size="mini"
                    placeholder="标段名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="产品编号">
                <el-input
                    v-model="searchParam.productCode"
                    size="mini"
                    placeholder="产品编号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="IMEI">
                <el-input
                    v-model="searchParam.imei"
                    size="mini"
                    placeholder="IMEI"
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
            <layout-filter-item label="车牌号">
                <el-input
                    v-model="searchParam.carNumber"
                    size="mini"
                    placeholder="车牌号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="质保开始日期">
                <el-date-picker
                    v-model="searchParam.qaStartDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="安装人">
                <el-input
                    v-model="searchParam.installUserName"
                    size="mini"
                    placeholder="安装人"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="安装时间">
                <el-date-picker
                    v-model="searchParam.installTime"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
        <div>
            <ListConfigDialog
                v-if="listConfigDialog.visible"
                v-bind="listConfigDialog"
                :visible.sync="listConfigDialog.visible"
            />
        </div>
    </layout-filter>
</template>

<script>
    // API
    import resourceApi from '@/api/resource'
    import deviceInstallApi from '@/api/operationsManagement/deviceInstall'
    // 方法
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            width: 155,
                            dbProp: 'tdid.c_imei',
                            sortable: 'custom',
                            isClick: ({ row }) => row.deviceId,
                            dialogType: 'device',
                            idKey: 'deviceId'
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            width: 120,
                            dbProp: 'tdid.c_sim',
                            sortable: 'custom'
                        },
                        {
                            type: 'status',
                            enums: enums.deviceInstallChargeStatus,
                            prop: 'installStatus',
                            label: '状态',
                            minWidth: 100
                        },
                        {
                            type: 'money',
                            prop: 'feeAmount',
                            label: '安装费（元）',
                            width: 160
                        },
                        {
                            prop: 'installCode',
                            label: '单据编号',
                            minWidth: 155,
                            disabled: true,
                            idKey: 'installId',
                            isClick: true,
                            dialogType: 'deviceInstall'
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 155,
                            disabled: true
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 200
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 180
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 220,
                            isClick: true,
                            dialogType: 'supplier',
                            idKey: 'supplierId'
                        },
                        {
                            prop: 'carNumber',
                            width: 100,
                            label: '车牌号',
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.listConfigDialog = {
                                    title: '车牌号修改记录',
                                    width: '600px',
                                    method: resourceApi.entityChanges,
                                    table: {
                                        columns: [
                                            {
                                                prop: 'userName',
                                                label: '修改人',
                                                minWidth: 80
                                            },
                                            {
                                                prop: 'originalValue',
                                                label: '修改前',
                                                minWidth: 120
                                            },
                                            {
                                                prop: 'newValue',
                                                label: '修改后',
                                                minWidth: 120
                                            },
                                            {
                                                type: 'date',
                                                prop: 'changedTime',
                                                label: '修改日期',
                                                minWidth: 140,
                                                format: 'YYYY-MM-DD HH:mm:ss'
                                            }
                                        ]
                                    },
                                    params: {
                                        orderBy: 'c_changedTime desc',
                                        entityId: row.id,
                                        entityFullName: 'hw.topevery.basis.device.model.DeviceInstallDetails',
                                        propertyName: 'carNumber'
                                    },
                                    visible: true
                                }
                            }
                        },
                        {
                            prop: 'driverName',
                            width: 80,
                            label: '司机姓名'
                        },
                        {
                            prop: 'driverIdCard',
                            width: 160,
                            label: '司机身份证号'
                        },
                        {
                            prop: 'engineNum',
                            width: 140,
                            label: '发动机号'
                        },
                        {
                            prop: 'vin',
                            width: 140,
                            label: '车架号'
                        },
                        {
                            type: 'date',
                            prop: 'qaStartDate',
                            width: 120,
                            label: '质保开始日期',
                            dbProp: 'tdid.c_qa_start_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'installUserName',
                            width: 100,
                            label: '安装人'
                        },
                        {
                            type: 'date',
                            prop: 'installTime',
                            width: 160,
                            label: '安装时间',
                            format: 'YYYY-MM-DD HH:mm:ss',
                            dbProp: 'tdid.c_install_time',
                            sortable: 'custom'
                        },
                        {
                            type: 'location',
                            prop: 'address',
                            minWidth: 240,
                            label: '安装地点'
                        },
                        {
                            type: 'viewer',
                            prop: 'fileNum',
                            minWidth: 60,
                            label: '附件',
                            align: 'center',
                            method: async({ row }) => {
                                this.tableData.options.loading = true
                                let res = await deviceInstallApi.getDeviceDetail(row.guidId)
                                row.files = res.data.files
                                this.tableData.options.loading = false
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                listConfigDialog: {
                    visible: false
                }
            }
        },
        computed: {
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.handleFilter()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await deviceInstallApi.getDeviceList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(item => {
                    item.files = null
                    switch (item.installStatus) {
                    case 9:
                        item.feeAmount = item.feeAmount
                        break
                    default:
                        item.feeAmount = item.installUnit
                        break
                    }
                    return item
                })
                this.tableData.total = res.data.total
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                deviceInstallApi.exportDevice(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
