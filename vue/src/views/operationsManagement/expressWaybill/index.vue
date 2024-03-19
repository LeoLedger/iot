<!--
* @description 快递单管理
* @author 望浩然
* @date 2021/5/13 - 5/18
!-->
<template>
    <div class="section-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.expressWaybill.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.expressWaybill.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.expressWaybill.create'])"
                    type="success"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-plus"
                    @click="handleCreate"
                >登记</el-button>
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.expressCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="快递单号"
                    @change="handleSearch"/>
                <el-input
                    v-model="searchParam.approvalCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="关联单据"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="快递公司">
                    <DictSelect
                        v-model="searchParam.expressId"
                        type="expressCompany"
                        placeholder="快递公司"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="业务类型">
                    <DictSelect
                        v-model="searchParam.businessType"
                        type="expressBusinessType"
                        placeholder="业务类型"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="客户/供应商">
                    <el-input
                        v-model="searchParam.objectName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="客户/供应商名称"/>
                </layout-filter-item>
                <layout-filter-item label="创建人">
                    <RemoteSelect
                        v-model="searchParam.userName"
                        :method="userRemoteMethod"
                        label-key="userName"
                        value-key="userId"
                        filter-label-key="userName"
                        placeholder="选择创建人"
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
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                >
                    <template slot="操作" slot-scope="{row}">
                        <el-dropdown
                            v-if="row.businessType !== '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D'"
                            trigger="click"
                            size="small">
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <template>
                                    <div v-if="checkFeature(['ty.iot.expressWaybill.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">
                                        <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                    </div>
                                    <div v-if="checkFeature(['ty.iot.expressWaybill.delete'])" class="layout-dropdown-item" @click="handleDelete(row)">
                                        <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                    </div>
                                </template>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
        </layout-template>
        <edit-dialog
            v-if="editDialog.visible"
            :visible.sync="editDialog.visible"
            :data-id="editDialog.dataId"
            :is-detail="editDialog.isDetail"
            @confirm="handleSearch"
        />
    </div>
</template>
<script>
    // API
    import expressRepairApi from '@/api/operationsManagement/expressRepair'
    import resourceApi from '@/api/resource'
    // 组件
    import EditDialog from './EditDialog'
    import projectApi from '@/api/PM/project'
    export default {
        components: {
            EditDialog
        },
        props: {},
        data() {
            const dialogTypes = {
                '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D': 'sendRevised', // 寄出维修设备
                '0B6FF336-4733-4B10-856F-F83F771D8295': 'storageOutApproval', // 寄出出库设备
                'D9BF5AC5-B7E3-4BF8-BC4B-4E536D5D7C9D': 'invoiceApproval', // 寄出发票
                '78271167-332A-4DD5-A4D7-3456E6A2835B': 'salesContract', // 寄出合同
                'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB': 'troubleTicket' // 寄出替换设备
            }
            return {
                userRemoteMethod: resourceApi.getUserList,
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
                        fit: true,
                        loading: false,
                        curRowKey: 'id' // 高亮当前判断的 key
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: true
                    },
                    columns: [
                        {
                            label: '快递单号',
                            prop: 'expressCode',
                            minWidth: 120,
                            isClick: true,
                            dialogType: 'expressBill',
                            idKey: 'guidId'
                        },
                        {
                            label: '快递公司',
                            prop: 'expressId',
                            type: 'dict',
                            dictType: 'expressCompany',
                            width: 100
                        },
                        {
                            label: '快递费(元)',
                            prop: 'cost',
                            width: 100,
                            type: 'money',
                            sortable: 'custom',
                            dbProp: 'c_cost'
                        },
                        {
                            label: '业务类型',
                            type: 'dict',
                            dictType: 'expressBusinessType',
                            prop: 'businessType',
                            width: 150
                        },
                        {
                            label: '寄件人',
                            prop: 'sendUserName',
                            width: 150
                        },
                        {
                            label: '寄件日期',
                            prop: 'sendTime',
                            type: 'date',
                            width: 150
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            isClick: true,
                            dialogType: ({ row }) => dialogTypes[row.businessType],
                            idKey: 'approvalId',
                            width: 150
                        },
                        {
                            label: '收件方',
                            prop: 'objectName',
                            width: 200
                        },
                        {
                            label: '创建人',
                            prop: 'userName',
                            width: 150
                        },
                        {
                            label: '创建日期',
                            prop: 'createTime',
                            type: 'date',
                            width: 100,
                            sortable: 'custom',
                            dbProp: 'c_create_time'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 300
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                },
                editDialog: {
                    visible: false,
                    dataId: null,
                    isDetail: false
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
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                this.getList()
            },
            /** 加载数据 */
            // 获取客户列表数据
            async getList() {
                this.tableData.options.loading = true
                const params = {
                    ...this.searchParam
                }
                const res = await expressRepairApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
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
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                expressRepairApi.export(this.searchParam)
            },
            // 登记
            handleCreate() {
                this.editDialog.isDetail = false
                this.editDialog.visible = true
                this.editDialog.dataId = null
            },
            handleUpdate(row) {
                this.editDialog.isDetail = false
                this.editDialog.visible = true
                this.editDialog.dataId = row.guidId
            },
            async handleDelete(data) {
                await this.$confirm('此操作将删除此快递单, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await expressRepairApi.delete(data.guidId)
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
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>

