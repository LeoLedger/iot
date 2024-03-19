<!--
* @description 寄修设备
* @author 望浩然
* @date 2021/10/9 - 2021/10/10
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.expressRepairCar.deviceList.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.expressRepairCar.deviceList.export'])"
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
                <!--                <RemoteSelect-->
                <!--                    v-model="searchParam.projectId"-->
                <!--                    :method="projectRemoteMethod"-->
                <!--                    :extend-params="{status: 1}"-->
                <!--                    label-key="projectName"-->
                <!--                    value-key="guidId"-->
                <!--                    filter-label-key="projectName"-->
                <!--                    placeholder="选择项目"-->
                <!--                    clearable-->
                <!--                    class="filter-item"-->
                <!--                />-->
                <el-input
                    v-model="searchParam.projectName"
                    placeholder="项目"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="标段">
                <!--                <RemoteSelect-->
                <!--                    v-model="searchParam.sectionId"-->
                <!--                    :method="sectionRemoteMethod"-->
                <!--                    label-key="name"-->
                <!--                    value-key="guidId"-->
                <!--                    filter-label-key="sectionName"-->
                <!--                    placeholder="选择标段"-->
                <!--                    clearable-->
                <!--                    class="filter-item"-->
                <!--                />-->
                <el-input
                    v-model="searchParam.sectionName"
                    placeholder="标段"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="企业">
                <!--                <RemoteSelect-->
                <!--                    v-model="searchParam.customerId"-->
                <!--                    :method="customerRemoteMethod"-->
                <!--                    label-key="name"-->
                <!--                    value-key="guidId"-->
                <!--                    filter-label-key="name"-->
                <!--                    placeholder="选择企业"-->
                <!--                    clearable-->
                <!--                    class="filter-item"-->
                <!--                />-->
                <el-input
                    v-model="searchParam.customerName"
                    placeholder="企业"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="寄修单号">
                <el-input
                    v-model="searchParam.expressRepairCarCode"
                    placeholder="输入寄修单号"
                    size="mini"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="创建日期">
                <el-date-picker
                    v-model="searchParam.createTime"
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
<!--            <layout-filter-item label="厂家诊断结果">-->
<!--                <el-input-->
<!--                    v-model="searchParam.factoryFeedback"-->
<!--                    placeholder="厂家诊断结果"-->
<!--                    size="mini"-->
<!--                    clearable-->
<!--                    class="filter-item"-->
<!--                />-->
<!--            </layout-filter-item>-->
<!--            <layout-filter-item label="厂家处理方式">-->
<!--                <el-input-->
<!--                    v-model="searchParam.factoryHandlingWay"-->
<!--                    placeholder="厂家处理方式"-->
<!--                    size="mini"-->
<!--                    clearable-->
<!--                    class="filter-item"-->
<!--                />-->
<!--            </layout-filter-item>-->
            <layout-filter-item label="维修结果">
                <DictSelect
                    v-model="searchParam.verificationResult"
                    type="expressRepairCarVerificationResult"
                    placeholder="维修结果"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="处理方式">
                <DictSelect
                    v-model="searchParam.verificationHandlingWay"
                    type="expressRepairCarHandlingWay"
                    placeholder="处理方式"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
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
        <div/>
    </layout-filter>
</template>

<script>
    // API
    import expressRepairCar from '@/api/operationsManagement/expressRepairCar'
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
                            prop: 'expressRepairCarCode',
                            label: '寄修单号',
                            width: 150
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
                            prop: 'userName',
                            label: '创建人',
                            minWidth: 100
                        },
                        {
                            prop: 'createTime',
                            label: '创建日期',
                            type: 'date'
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            minWidth: 150
                        },
                        {
                            prop: 'verificationResult',
                            label: '核验结果',
                            minWidth: 100,
                            type: 'dict',
                            dictType: 'expressRepairCarVerificationResult'
                        },
                        {
                            prop: 'verificationHandlingWay',
                            label: '处理方式',
                            minWidth: 150,
                            type: 'dict',
                            dictType: 'expressRepairCarHandlingWay'
                        },
                        {
                            prop: 'cost',
                            label: '维修费(元)',
                            type: 'money'
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
                const res = await expressRepairCar.getDeviceList({ ...this.searchParam })
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
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
                expressRepairCar.exportDevice(data)
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
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
