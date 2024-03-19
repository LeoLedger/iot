<!--
* @description 故障设备
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.troubleTicket.search'])"
        class="container"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.troubleTicket.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.troubleTicket.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >登记</el-button>
            <el-button
                v-if="checkFeature(['ty.iot.troubleTicket.setting'])"
                size="mini"
                class="filter-button"
                type="primary"
                icon="el-icon-s-tools"
                @click="settingDialogVisible = true"
            >设置</el-button>
            <el-button
                v-if="checkFeature(['ty.iot.troubleTicket.handle'])"
                size="mini"
                class="filter-button mark-button"
                type="primary"
                @click="workbenchDialogVisible = true"
            >
                处理工作台
                <div v-if="troubleTicketCount > 0" class="mark">{{ troubleTicketCount > 99 ? '99+' : troubleTicketCount }}</div>
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
            <layout-filter-item label="处理方式">
                <DictSelect
                    v-model="searchParam.handlingWay"
                    type="handlingWay"
                    placeholder="处理方式"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="维修状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="troubleBillsRepairStatus"
                    placeholder="维修状态"
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
                    v-model="searchParam.code"
                    placeholder="故障单号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="创建时间">
                <el-date-picker
                    v-model="searchParam.regisTime"
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
                    v-model="searchParam.regisUserName"
                    placeholder="创建人"
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
                    placeholder="企业反馈异常"
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
                    placeholder="客服诊断结果"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="替换设备编号">
                <el-input
                    v-model="searchParam.replaceUnitImei"
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
            <layout-filter-item label="替换时间">
                <el-date-picker
                    v-model="searchParam.replaceTime"
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
            <layout-filter-item label="处理完成时间">
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
            <layout-filter-item label="寄出替换设备快递单号">
                <el-input
                    v-model="searchParam.xxx"
                    placeholder="寄出替换设备快递单号"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="快递公司">
                <DictSelect
                    v-model="searchParam.xxx"
                    type="expressCompany"
                    placeholder="快递公司"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="寄件人">
                <el-input
                    v-model="searchParam.xxx"
                    placeholder="寄件人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="寄件时间">
                <el-date-picker
                    v-model="searchParam.xxx"
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
            >
                <template slot="操作" slot-scope="{row}">
                    <el-dropdown trigger="click" size="small">
                        <el-button size="mini" icon="el-icon-more" title="操作" />
                        <el-dropdown-menu slot="dropdown">
                            <div class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 更新故障单信息 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :visible.sync="updateDialogVisible"
                is-edit
                @update="handleDeviceUpdate"
            />
            <!-- 功能设置窗口 -->
            <SettingDialog
                v-if="settingDialogVisible"
                :visible.sync="settingDialogVisible"
            />
            <!-- 处理工作台 -->
            <WorkbenchDialog
                v-if="workbenchDialogVisible"
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
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 组件
    import UpdateDialog from './components/UpdateDialog'
    import SettingDialog from './components/SettingDialog'
    import WorkbenchDialog from './components/Workbench/WorkbenchDialog'

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
                searchParam: {
                    type: 2,
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: deviceList,
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                activeRowData: null,
                updateDialogVisible: false,
                settingDialogVisible: false,
                workbenchDialogVisible: false
            }
        },
        computed: {
            ...mapState({
                'troubleTicketCount': state => state.user.troubleTicketCount
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
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await troubleTicketApi.getList({
                    ...this.searchParam
                })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        return item
                    })
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
            // 点击新增or编辑按钮时触发
            handleUpdate(data = {}) {
                this.activeRowId = data.guidId
                this.updateDialogVisible = true
            },
            // 点击删除按钮时触发
            async handleDelete(data) {
                await this.$confirm('此操作将删除此合同信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await troubleTicketApi.delete(data.id)
                    if (res.success) {
                        await this.getList()
                        this.$notify({
                            title: '成功',
                            message: '删除成功',
                            type: 'success',
                            duration: 2000
                        })
                    }
                } catch (e) {}
                this.tableData.options.loading = false
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                troubleTicketApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            // 故障设备更新时触发
            handleDeviceUpdate() {
                // 获取待处理故障设备数量
                var statusList = []
                if (this.checkFeature(['ty.iot.troubleTicket.replace'])) {
                    statusList.push(0)
                }
                if (this.checkFeature(['ty.iot.troubleTicket.validate'])) {
                    statusList.push(1)
                }
                troubleTicketApi.getDeal({ pageSize: -1, statusList }).then(res => {
                    store.commit('setTroubleTicketCount', res.data.records.length)
                })
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
