<!--
* @description 维修设备
* @author 望浩然
* @date 2021/5/10 - 2021/5/13
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.deviceList.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.deviceList.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.imei"
                placeholder="IMEI"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="产品编号">
                <el-input
                    v-model="searchParam.productCode"
                    placeholder="产品编号"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="维修状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="repairStatus"
                    placeholder="维修状态"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="项目">
                <RemoteSelect
                    v-model="searchParam.projectId"
                    :method="projectRemoteMethod"
                    :extend-params="{status: 1}"
                    label-key="projectName"
                    value-key="guidId"
                    filter-label-key="projectName"
                    placeholder="选择项目"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="标段">
                <RemoteSelect
                    v-model="searchParam.sectionId"
                    :method="sectionRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="sectionName"
                    placeholder="选择标段"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="企业">
                <RemoteSelect
                    v-model="searchParam.customerId"
                    :method="customerRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择企业"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <RemoteSelect
                    v-model="searchParam.supplierId"
                    :method="supplierRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择供应商"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="维修单号">
                <el-input
                    v-model="searchParam.faultCode"
                    placeholder="输入维修单号"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="车牌号">
                <el-input
                    v-model="searchParam.carNumber"
                    placeholder="输入车牌号"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="反馈异常">
                <el-input
                    v-model="searchParam.feedback"
                    placeholder="反馈异常"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="登记日期">
                <el-date-picker
                    v-model="searchParam.registerDate"
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
            <layout-filter-item label="上次维修时间">
                <el-date-picker
                    v-model="searchParam.lastRepairTime"
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
            <layout-filter-item label="厂家诊断结果">
                <el-input
                    v-model="searchParam.factoryFeedback"
                    placeholder="厂家诊断结果"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="厂家处理方式">
                <el-input
                    v-model="searchParam.factoryHandlingWay"
                    placeholder="厂家处理方式"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="是否更换设备">
                <el-checkbox v-model="searchParam.isReplaceDevice" @change="handleChange($event, 'isReplaceDevice')"/>
            </layout-filter-item>
            <layout-filter-item label="是否有换卡">
                <el-checkbox v-model="searchParam.isReplaceCard" @change="handleChange($event, 'isReplaceCard')"/>
            </layout-filter-item>
            <layout-filter-item label="处理方式">
                <DictSelect
                    v-model="searchParam.handlingWay"
                    type="carTroubleBillsHandlingWay"
                    placeholder="处理方式"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="更换SIM卡号">
                <el-input
                    v-model="searchParam.replaceSim"
                    placeholder="输入更换SIM卡号"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="更换设备编号">
                <el-input
                    v-model="searchParam.replaceDeviceCode"
                    placeholder="输入更换设备编号"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="替换类型">
                <DictSelect
                    v-model="searchParam.replaceType"
                    type="replaceType"
                    placeholder="替换类型"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="处理时间">
                <el-date-picker
                    v-model="searchParam.processingTime"
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
                :selected-list="selectedList"
                @refreshList="handleRefreshList"
                @handleSelectionChange="handleSelect"
            />
        </template>
        <div/>
    </layout-filter>
</template>

<script>
    // API
    import carDeviceApi from '@/api/operationsManagement/carDevice'
    // 方法
    import enums from '@/utils/enum'
    import supplierApi from '@/api/purchase/supplier'
    import resApi from '@/api/resource'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    // 组件
    export default {
        components: {
        },
        props: {
        },
        data() {
            return {
                supplierRemoteMethod: supplierApi.getList,
                userRemoteMethod: resApi.getUserList,
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
                viewData: {
                    province: []
                },
                selectedList: [], // 选中的数据
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            width: 150,
                            dbProp: 'c_imei',
                            sortable: 'custom',
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'imei'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 150
                        },
                        {
                            type: 'status',
                            enums: enums.repairStatus,
                            prop: 'status',
                            label: '维修状态',
                            width: 100,
                            align: 'center'
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId',
                            minWidth: 100
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId',
                            minWidth: 100
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 100
                        },
                        {
                            prop: 'faultCode',
                            label: '维修单号',
                            minWidth: 100
                        },
                        {
                            prop: 'purchaseSupplierName',
                            label: '供应商',
                            minWidth: 100
                        },
                        {
                            prop: 'carNumber',
                            label: '车牌号',
                            minWidth: 100
                        },
                        {
                            prop: 'feedback',
                            label: '反馈异常',
                            minWidth: 100
                        },
                        {
                            prop: 'registerDate',
                            label: '登记日期',
                            type: 'date'
                        },
                        {
                            prop: 'lastRepairTime',
                            label: '上次维修日期',
                            type: 'date'
                        },
                        {
                            prop: 'factoryFeedback',
                            label: '厂家诊断结果',
                            minWidth: 100
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            minWidth: 150
                        },
                        {
                            prop: 'isReplaceDevice',
                            label: '是否更换设备',
                            width: 100,
                            align: 'center',
                            render: (h, { row, column }) => {
                                return (
                                <el-checkbox
                                  disabled
                                  value={row.isReplaceDevice}>
                                  {row.isReplaceDevice ? '是' : '否'}
                                </el-checkbox>
                              )
                            }
                        },
                        {
                            prop: 'isReplaceCard',
                            label: '是否有换卡',
                            width: 100,
                            align: 'center',
                            render: (h, { row, column }) => {
                                return (
                                  <el-checkbox
                                    disabled
                                    value={row.isReplaceCard}>
                                    {row.isReplaceCard ? '是' : '否'}
                                  </el-checkbox>
                                )
                            }
                        },
                        {
                            prop: 'labourCost',
                            label: '人工费(元)',
                            type: 'money'
                        },
                        {
                            prop: 'cost',
                            label: '维修费(元)',
                            type: 'money'
                        },
                        {
                            type: 'dict',
                            dictType: 'carTroubleBillsHandlingWay',
                            prop: 'handlingWay',
                            label: '处理方式'
                        },
                        {
                            prop: 'companyBearCost',
                            label: '公司承担费用(元)',
                            type: 'money',
                            width: 100
                        },
                        {
                            prop: 'enterpriseBearCost',
                            label: '企业承担费用(元)',
                            type: 'money',
                            width: 100
                        },
                        {
                            prop: 'replaceSim',
                            label: '更换SIM卡号',
                            width: 150
                        },
                        {
                            prop: 'replaceDeviceData',
                            label: '更换设备号',
                            width: 150
                        },
                        {
                            type: 'dict',
                            dictType: 'replaceType',
                            prop: 'replaceType',
                            label: '替换类型'
                        },
                        {
                            prop: 'processingTime',
                            label: '处理时间',
                            width: 150,
                            type: 'date'
                        },
                        {
                            type: 'viewer',
                            prop: 'fileNum',
                            minWidth: 60,
                            label: '附件',
                            align: 'center',
                            method: async({ row }) => {
                                this.tableData.options.loading = true
                                let res = await carDeviceApi.getDeviceFiles({
                                    guid: row.guidId
                                })
                                row.files = res.data
                                this.tableData.options.loading = false
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        mutiSelect: true // 是否多选
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    isReplaceDevice: null,
                    isReplaceCard: null
                },
                activeRowData: null
            }
        },
        computed: {},
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                const res = await carDeviceApi.getList({ ...this.searchParam })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        item.files = null
                        return item
                    })
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                this.selectedList = []
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
                // carDeviceApi.export(data)
                if (this.selectedList.length > 0) {
                    data.ids = this.selectedList.map(item => item.id)
                }
                carDeviceApi.exportByPost(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleChange(val, prop) {
                if (val === true) {
                    this.searchParam[prop] = true
                } else this.searchParam[prop] = null
            },
            handleSelect(row) {
                this.selectedList = row
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
