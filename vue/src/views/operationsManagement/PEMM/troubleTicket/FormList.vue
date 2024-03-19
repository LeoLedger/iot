<!--
* @description 故障单列表
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
                v-model="searchParam.code"
                placeholder="故障单号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="troubleBillsStatus"
                    placeholder="状态"
                    clearable
                    filterable
                    size="mini"
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
            <layout-filter-item label="登记人">
                <el-input
                    v-model="searchParam.regisUserName"
                    placeholder="登记人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="登记时间">
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
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            >
                <template slot="操作" slot-scope="{row}">
                    <el-dropdown
                        v-if="row._buttonConfig.handle || row._buttonConfig.update || row._buttonConfig.delete"
                        trigger="click"
                        size="small"
                    >
                        <el-button size="mini" icon="el-icon-more" title="操作" />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="row._buttonConfig.handle" class="layout-dropdown-item" @click="handleDispose(row)">
                                <el-dropdown-item icon="el-icon-setting" divided>处理</el-dropdown-item>
                            </div>
                            <div v-if="row._buttonConfig.update" class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="row._buttonConfig.delete" class="layout-dropdown-item" @click="handleDelete(row)">
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
                :data-id="activeRowId"
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
    // API
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 组件
    import UpdateDialog from './components/UpdateDialog'
    import DetailDialog from './components/DetailDialog'
    import SettingDialog from './components/SettingDialog'
    import WorkbenchDialog from './components/Workbench/WorkbenchDialog'

    export default {
        components: {
            UpdateDialog,
            DetailDialog,
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
                    columns: [
                        {
                            prop: 'code',
                            label: '故障单号',
                            fixed: 'left',
                            minWidth: 155,
                            isClick: true,
                            dialogType: 'troubleTicket'
                        },
                        {
                            type: 'dict',
                            dictType: 'troubleBillsStatus',
                            prop: 'status',
                            label: '状态',
                            width: 100
                        },
                        {
                            prop: 'projectName',
                            label: '所属项目',
                            minWidth: 240
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 160,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 180
                        },
                        {
                            prop: 'count',
                            label: '报修数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'handleCount',
                            label: '已处理',
                            width: 100,
                            dbProp: 'c_handle_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'replaceCount',
                            label: '替换数量',
                            width: 100,
                            dbProp: 'c_replace_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'regisUserName',
                            label: '登记人',
                            width: 80
                        },
                        {
                            type: 'date',
                            prop: 'regisTime',
                            label: '登记时间',
                            width: 140,
                            dbProp: 'c_regis_time',
                            sortable: 'custom'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 70,
                        fixed: 'right',
                        show: true
                    }
                },
                searchParam: {
                    type: 1,
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowId: null,
                activeOperType: null,
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
            this.handleDeviceUpdate()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await troubleTicketApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(row => {
                    row._buttonConfig = {
                        update: row.status === 0 && row.replaceCount === 0 && this.checkFeature(['ty.iot.troubleTicket.update']),
                        delete: row.status === 0 && row.replaceCount === 0 && this.checkFeature(['ty.iot.troubleTicket.delete']),
                        handle: [0, 1].includes(row.status) && this.checkFeature(['ty.iot.troubleTicket.handle'])
                    }
                    return row
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
            // 点击删除按钮时触发
            async handleDelete(data) {
                await this.$confirm('此操作将删除此故障单信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await troubleTicketApi.delete(data.guidId)
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
            // 点击故障单处理按钮时触发
            handleDispose(data) {
                this.activeOperType = 3
                this.activeRowId = data.guidId
                this.updateDialogVisible = true
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
