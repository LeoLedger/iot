<!--
* @description 故障单列表
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
                v-model="searchParam.code"
                placeholder="寄修单号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
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
            <layout-filter-item label="单据状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="sendRevisedStatus"
                    placeholder="单据状态"
                    clearable
                    filterable
                    size="mini"
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
            <layout-filter-item label="创建人">
                <el-input
                    v-model="searchParam.createName"
                    placeholder="创建人"
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
                        v-if="row._buttonConfig.datete || row._buttonConfig.update || row._buttonConfig.feedback || row._buttonConfig.allocation || row._buttonConfig.verifiable"
                        trigger="click"
                        size="small"
                    >
                        <el-button size="mini" icon="el-icon-more" title="操作" />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="row._buttonConfig.feedback" class="layout-dropdown-item" @click="handleDispose(row)">
                                <el-dropdown-item icon="el-icon-setting" divided>维修反馈</el-dropdown-item>
                            </div>
                            <div v-if="row._buttonConfig.allocation" class="layout-dropdown-item" @click="handleDispose(row)">
                                <el-dropdown-item icon="el-icon-setting" divided>分配核验</el-dropdown-item>
                            </div>
                            <div v-if="row._buttonConfig.verifiable" class="layout-dropdown-item" @click="handleDispose(row)">
                                <el-dropdown-item icon="el-icon-setting" divided>核验确认</el-dropdown-item>
                            </div>
                            <div v-if="row._buttonConfig.update" class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="row._buttonConfig.datete" class="layout-dropdown-item" @click="handleDelete(row)">
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
            <!-- 核验工作台窗口 -->
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
                    columns: [
                        {
                            prop: 'code',
                            label: '寄修单号',
                            fixed: 'left',
                            minWidth: 155,
                            isClick: true,
                            dialogType: 'sendRevised'
                        },
                        {
                            prop: 'expressCode',
                            label: '快递单号',
                            minWidth: 155
                        },
                        {
                            type: 'dict',
                            dictType: 'expressCompany',
                            prop: 'expressId',
                            label: '快递公司',
                            width: 100
                        },
                        {
                            type: 'money',
                            prop: 'cost',
                            label: '快递费（元）',
                            width: 120,
                            dbProp: 'c_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'dict',
                            dictType: 'sendRevisedType',
                            prop: 'type',
                            label: '寄修类型',
                            width: 100
                        },
                        {
                            type: 'dict',
                            dictType: 'sendRevisedStatus',
                            prop: 'status',
                            label: '单据状态',
                            width: 180
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            width: 220
                        },
                        {
                            prop: 'count',
                            label: '设备数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'createUserName',
                            label: '创建人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '创建日期',
                            width: 140,
                            dbProp: 'c_create_time',
                            sortable: 'custom'
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            width: 300
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
                    pageSize: 15,
                    pageIndex: 1,
                    tabType: 0
                },
                activeRowId: null,
                activeOperType: null,
                updateDialogVisible: false,
                handleDialogVisible: false,
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
                this.tableData.list = res.data.records.map(row => {
                    row._buttonConfig = {
                        update: [0].includes(row.status) && this.checkFeature(['ty.iot.sendRevised.update']),
                        delete: [0].includes(row.status) && this.checkFeature(['ty.iot.sendRevised.delete']),
                        feedback: [0].includes(row.status) && this.checkFeature(['ty.iot.sendRevised.feedback']),
                        allocation: [1].includes(row.status) && this.checkFeature(['ty.iot.sendRevised.allocation']),
                        verifiable: [2].includes(row.status) && this.checkFeature(['ty.iot.sendRevised.verifiable'])
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
                await this.$confirm('此操作将删除此寄修单信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await sendRevisedApi.delete(data.guidId)
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
            // 点击其他操作按钮时触发
            handleDispose(data = {}) {
                switch (data.status) {
                case 0:
                    // 寄修待反馈
                    this.activeOperType = 2
                    break
                case 1:
                    // 分配待反馈
                    this.activeOperType = 3
                    break
                case 2:
                default:
                    // 核验确认
                    this.activeOperType = 4
                    break
                }
                this.activeRowId = data.guidId
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
