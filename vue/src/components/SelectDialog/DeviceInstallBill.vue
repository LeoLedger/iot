<!--
* @description 选择设备安装清单
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <el-input
                v-model="publicParam.installCode"
                :disabled="lockedProps.includes('installCode')"
                size="mini"
                placeholder="单据编号"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同编号">
                <el-input
                    v-model="publicParam.contractCode"
                    :disabled="lockedProps.includes('contractCode')"
                    size="mini"
                    placeholder="合同编号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="项目名称">
                <el-input
                    v-model="publicParam.projectName"
                    :disabled="lockedProps.includes('projectName')"
                    size="mini"
                    placeholder="项目名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="企业名称">
                <el-input
                    v-model="publicParam.customerName"
                    :disabled="lockedProps.includes('customerName')"
                    size="mini"
                    placeholder="企业名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="标段名称">
                <el-input
                    v-model="publicParam.sectionName"
                    :disabled="lockedProps.includes('sectionName')"
                    size="mini"
                    placeholder="标段名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="产品编号">
                <el-input
                    v-model="publicParam.productCode"
                    :disabled="lockedProps.includes('productCode')"
                    size="mini"
                    placeholder="产品编号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="IMEI">
                <el-input
                    v-model="publicParam.imei"
                    :disabled="lockedProps.includes('imei')"
                    size="mini"
                    placeholder="IMEI"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="SIM卡号">
                <el-input
                    v-model="publicParam.sim"
                    :disabled="lockedProps.includes('sim')"
                    size="mini"
                    placeholder="SIM卡号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="车牌号">
                <el-input
                    v-model="publicParam.carNumber"
                    :disabled="lockedProps.includes('carNumber')"
                    size="mini"
                    placeholder="车牌号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="质保开始日期">
                <el-date-picker
                    v-model="publicParam.qaStartDate"
                    :disabled="lockedProps.includes('qaStartDate')"
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
                    v-model="publicParam.installUserName"
                    :disabled="lockedProps.includes('installUserName')"
                    size="mini"
                    placeholder="安装人"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="安装时间">
                <el-date-picker
                    v-model="publicParam.installTime"
                    :disabled="lockedProps.includes('installTime')"
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
                ref="TableComponent"
                v-bind="tableData"
                :options="tableOptions"
                :selected-list="selectList"
                :page-index.sync="publicParam.pageIndex"
                :page-size.sync="publicParam.pageSize"
                @refreshList="handleRefreshList"
                @handleCurrentChange="handleCurrentChange"
                @handleSelectionChange="handleSelectionChange"
                @not-selected-click="handleNotSelectedClick"
            />
        </template>
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // 方法
    import enums from '@/utils/enum'
    // API
    import deviceInstallApi from '@/api/operationsManagement/deviceInstall'

    export default {
        name: 'People',
        components: {
        },
        mixins: [mixin],
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
                            label: '车牌号'
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
                    ]
                },
                defaultParam: {
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.loading = true
                try {
                    var res
                    if (this.customRequest) {
                        res = await this.customRequest(this.publicParam)
                    } else {
                        res = await deviceInstallApi.getDeviceList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {
                    console.log(err)
                }
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
