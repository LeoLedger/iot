<!--
* @description 寄修设备
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.sendRevised.search'])"
        class="container"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.sendRevised.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.sendRevised.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >创建</el-button>
            <el-button
                v-if="checkFeature(['ty.iot.sendRevised.setting'])"
                size="mini"
                class="filter-button"
                type="primary"
                icon="el-icon-s-tools"
                @click="settingDialogVisible = true"
            >设置</el-button>
            <el-button
                v-if="checkFeature(['ty.iot.sendRevised.verifiable'])"
                size="mini"
                class="filter-button mark-button"
                type="primary"
                @click="workbenchDialogVisible = true"
            >
                核验工作台
                <div v-if="sendRevisedCount > 0" class="mark">{{ sendRevisedCount > 99 ? '99+' : sendRevisedCount }}</div>
            </el-button>
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
            <el-input
                v-model="searchParam.code"
                placeholder="寄修单号"
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
                />
            </layout-filter-item>
            <layout-filter-item label="维修状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="sendRevisedRepairStatus"
                    placeholder="维修状态"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="快递单号">
                <el-input
                    v-model="searchParam.expressCode"
                    placeholder="快递单号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="快递公司">
                <DictSelect
                    v-model="searchParam.expressId"
                    type="expressCompany"
                    placeholder="快递公司"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="寄修类型">
                <DictSelect
                    v-model="searchParam.type"
                    type="sendRevisedType"
                    placeholder="寄修类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="是否过保翻新">
                <DictSelect
                    v-model="searchParam.isRenovation"
                    type="isRenovation"
                    placeholder="是否过保翻新"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="翻新完成时间">
                <el-date-picker
                    v-model="searchParam.renovationTime"
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
            <layout-filter-item label="故障单号">
                <el-input
                    v-model="searchParam.faultCode"
                    placeholder="故障单号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="创建时间">
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
            <layout-filter-item label="创建人">
                <el-input
                    v-model="searchParam.createUserName"
                    placeholder="创建人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <el-input
                    v-model="searchParam.supplierName"
                    placeholder="供应商"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="项目">
                <el-input
                    v-model="searchParam.projectName"
                    placeholder="项目"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="标段">
                <el-input
                    v-model="searchParam.sectionName"
                    placeholder="标段"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="企业">
                <el-input
                    v-model="searchParam.customerName"
                    placeholder="企业"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="持有人">
                <el-input
                    v-model="searchParam.ownerName"
                    placeholder="持有人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="企业运单号">
                <el-input
                    v-model="searchParam.expressNo"
                    placeholder="企业运单号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="收到日期">
                <el-date-picker
                    v-model="searchParam.arrivalDate"
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
            <layout-filter-item label="企业反馈异常">
                <el-input
                    v-model="searchParam.enterpriseFeedback"
                    placeholder="持有人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="上次寄修时间">
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
            <layout-filter-item label="二次返修">
                <DictSelect
                    v-model="searchParam.secondRepair"
                    type="isSecondRepair"
                    placeholder="二次返修"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="客服诊断结果">
                <el-input
                    v-model="searchParam.clientFeedback"
                    placeholder="持有人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="替换设备编号">
                <el-input
                    v-model="searchParam.replaceImei"
                    placeholder="替换设备编号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="替换类型">
                <DictSelect
                    v-model="searchParam.replaceType"
                    type="troubleReplaceType"
                    placeholder="替换类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="检测完成时间">
                <el-date-picker
                    v-model="searchParam.completeTime"
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
            <layout-filter-item label="寄修日期">
                <el-date-picker
                    v-model="searchParam.repairTime"
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
            <layout-filter-item label="维修反馈时间">
                <el-date-picker
                    v-model="searchParam.maintainFeedbackTime"
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
                    placeholder="持有人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="厂家处理方式">
                <el-input
                    v-model="searchParam.factoryHandlingWay"
                    placeholder="持有人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="更换SIM卡号">
                <el-input
                    v-model="searchParam.replaceCardNumber"
                    placeholder="更换SIM卡号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="核验人">
                <el-input
                    v-model="searchParam.verificationUserName"
                    placeholder="核验人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="核验时间">
                <el-date-picker
                    v-model="searchParam.verificationTime"
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
            <layout-filter-item label="核验结果">
                <DictSelect
                    v-model="searchParam.verificationResult"
                    type="verifiableResult"
                    placeholder="核验结果"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="核验处理方式">
                <DictSelect
                    v-model="searchParam.verificationHandlingWay"
                    type="sendRevisedDisposalWay"
                    placeholder="核验处理方式"
                    clearable
                    filterable
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
        <div>
            <!-- 更新故障单信息 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :row-data="activeRowData"
                :oper-type="activeOperType"
                :visible.sync="updateDialogVisible"
                is-edit
                @update="handleDeviceUpdate"
            />
            <!-- 设置窗口 -->
            <SettingDialog
                v-if="settingDialogVisible"
                :visible.sync="settingDialogVisible"
            />
            <!-- 核验工作台窗口 -->
            <WorkbenchDialog
                v-if="workbenchDialogVisible"
                :row-data="activeRowData"
                :visible.sync="workbenchDialogVisible"
                @update="handleDeviceUpdate"
            />
        </div>
    </layout-filter>
</template>

<script>
    // 方法
    import store from '@/store'
    import { mapState } from 'vuex'
    import deviceList from './columns/deviceList'
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 组件
    import UpdateDialog from './components/UpdateDialog'
    import SettingDialog from './components/SettingDialog'
    import WorkbenchDialog from './components/WorkbenchDialog'

    export default {
        components: {
            UpdateDialog,
            SettingDialog,
            WorkbenchDialog
        },
        props: {
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: deviceList.get.call(this),
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    status: 0,
                    pageSize: 15,
                    pageIndex: 1,
                    tabType: 1
                },
                activeRowData: null,
                activeOperType: null,
                updateDialogVisible: false,
                settingDialogVisible: false,
                workbenchDialogVisible: false
            }
        },
        computed: {
            ...mapState({
                'sendRevisedCount': state => state.user.sendRevisedCount
            })
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
            this.handleDeviceUpdate()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await sendRevisedApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(item => {
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
            // 点击新增or编辑按钮时触发
            handleUpdate(data) {
                if (data) {
                    this.activeRowId = data.guidId
                    this.activeOperType = 1
                } else {
                    this.activeRowId = null
                    this.activeOperType = 0
                }
                this.updateDialogVisible = true
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                sendRevisedApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            // 故障设备更新时触发
            handleDeviceUpdate() {
                // 获取待处理故障设备数量
                sendRevisedApi.getVerifyAll({ pageSize: -1 }).then(res => {
                    store.commit('setSendRevisedCount', res.data.records.length)
                })
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
