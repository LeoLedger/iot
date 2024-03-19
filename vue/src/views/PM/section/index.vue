<!--
* @description 标段
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <div class="section-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.section.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.section.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.section.create'])"
                    type="success"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-plus"
                    @click="handleCreate"
                >新增</el-button>
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.sectionName"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="标段名称"
                    @change="handleSearch"/>
                <el-input
                    v-model="searchParam.sectionCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="标段编号"
                    @change="handleSearch"/>
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
                    @change="handleSearch"
                />
                <RemoteSelect
                    v-model="searchParam.customerId"
                    :method="customerRemoteMethod"
                    width="200px"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择服务企业"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="标段类型">
                    <DictSelect
                        v-model="searchParam.type"
                        type="sectionType"
                        placeholder="标段类型"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="主管单位">
                    <el-input
                        v-model="searchParam.managementUnit"
                        size="mini"
                        placeholder="主管单位"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="项目经理">
                    <el-input
                        v-model="searchParam.projectManagerUserName"
                        size="mini"
                        placeholder="项目经理"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="服务周期">
                    <el-date-picker
                        v-model="searchParam._period"
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
                    :cur_row="currentRow"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    :table-row-class-name="handleTableRowClassName"
                    @refreshList="handleSearch"
                    @handleCurrentChange="handleRowClick"
                >
                    <template slot="操作" slot-scope="scope">
                        <el-dropdown v-if="includeFeature(['ty.iot.section.update', 'ty.iot.section.delete'])" trigger="click" size="small">
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div v-if="checkFeature(['ty.iot.section.update'])" class="layout-dropdown-item" @click="handleEdit(scope.row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="checkFeature(['ty.iot.section.delete'])" class="layout-dropdown-item" @click="handleDel(scope.row)">
                                    <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
        </layout-template>
        <edit-dialog
            v-if="editDialog.visible"
            :visible="editDialog.visible"
            :data-id="editDialog.dataId"
            :is-create="editDialog.isCreate"
            @close="handleClose('editDialog')"
            @confirm="handleConfirm('editDialog')"
        />
        <detail-dialog
            v-if="detailDialog.visible"
            :visible="detailDialog.visible"
            :data-id="detailDialog.dataId"
            @close="handleClose('detailDialog')"
        />
    </div>
</template>
<script>
    // 工具
    import moment from 'moment'
    // API
    import sectionApi from '@/api/PM/section'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    // 组件
    import DetailDialog from '@/views/PM/section/components/DetailDialog'
    import EditDialog from '@/views/PM/section/components/EditDialog'
    import ProjectDetailDialog from '@/views/PM/project/components/DetailDialog'
    export default {
        components: {
            EditDialog,
            DetailDialog,
            ProjectDetailDialog
        },
        props: {},
        data() {
            return {
                currentRow: null,
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
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
                            label: '标段编号',
                            prop: 'code',
                            width: 150
                        },
                        {
                            label: '标段名称',
                            prop: 'name',
                            minWidth: 200,
                            render: (h, params = {}) => {
                                const { row, column } = params
                                return <span class='link-text' onClick={() => this.onClickDetail(row)}>{row.name || '--'}</span>
                            }
                        },
                        {
                            label: '服务企业',
                            prop: 'customerName',
                            minWidth: 200
                        },
                        {
                            label: '所属项目',
                            prop: 'projectName',
                            minWidth: 200,
                            isClick: true,
                            idKey: 'projectId',
                            dialogType: 'project'
                        },
                        {
                            label: '主管单位',
                            prop: 'managementUnit',
                            width: 200
                        },
                        {
                            label: '项目经理',
                            prop: 'projectManagerUserName',
                            minWidth: 120
                        },
                        {
                            label: '联系方式',
                            prop: 'phone',
                            width: 120
                        },
                        {
                            label: '服务周期',
                            prop: '_period',
                            width: 300
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15,
                    projectId: null,
                    customerId: null,
                    projectManagerUserName: '',
                    name: '',
                    code: ''
                },
                detailDialog: {
                    visible: false,
                    dataId: null
                },
                editDialog: {
                    visible: false,
                    dataId: null,
                    isCreate: false
                },
                customerRemoteMethod: customerApi.getList,
                projectRemoteMethod: projectApi.getList
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
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                this.getList()
                this.getProjectList()
                this.getCustomerList()
            },
            /** 加载数据 */
            // 获取标段列表数据
            getList() {
                this.tableData.options.loading = true
                this.searchParam.dateList = this.searchParam._period || []
                delete this.searchParam._period
                const params = Object.assign({}, this.searchParam)
                sectionApi.getList(params).then(res => {
                    if (res.success) {
                        this.tableData.list = res.data.records.map(item => {
                            if (item.startDate && item.endDate) {
                                item._period = `${moment(item.startDate).format('YYYY-MM-DD')} 至 ${moment(item.endDate).format('YYYY-MM-DD')}`
                            }
                            return item
                        })
                        this.tableData.total = res.data.total
                    }
                })
                this.tableData.options.loading = false
            },
            // 获取项目列表
            getProjectList() {
                projectApi.getList({ pageSize: 20 }).then(res => {
                    this.projectList = res.data.records
                })
            },
            // 获取服务企业列表
            getCustomerList() {
                customerApi.getList({ pageSize: 20 }).then(res => {
                    this.customerList = res.data.records
                })
            },
            /** 点击事件类 */
            // 查看详情
            onClickDetail(row) {
                this.detailDialog.dataId = row.guidId
                this.detailDialog.visible = true
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
            // 行点击
            handleRowClick() {},
            // 根据对应字段状态 修改行样式
            handleTableRowClassName({ row, rowIndex }) {
                return ''
            },
            // 创建
            handleCreate() {
                this.editDialog.dataId = null
                this.editDialog.isCreate = true
                this.editDialog.visible = true
            },
            // 导出
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                sectionApi.export(this.searchParam)
            },
            // 编辑
            handleEdit(row) {
                this.editDialog.dataId = row.guidId
                this.editDialog.isCreate = false
                this.editDialog.visible = true
                this.currentRow = row
            },
            // 删除
            handleDel(row) {
                if (row.contractCount > 0) {
                    this.$message.warning('该标段有存在关联的合同，不允许删除！')
                } else {
                    this.$confirm('是否确认删除?', '警告', {
                        confirmButtonText: '删除',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        sectionApi.delete(row.guidId).then(res => {
                            if (res.success) {
                                this.getList()
                                this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
                            }
                        })
                    }).catch(() => {})
                }
            },
            // 子窗口关闭
            handleClose(objName) {
                this[objName].visible = false
                this[objName].dataId = null
            },
            // 子窗口确认操作
            handleConfirm(objName) {
                this[objName].visible = false
                this[objName].dataId = null
                // 确认操作需要刷新主列表
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
.section-container {
  height: 100%;
  /* 可点击的文字样式 */
}
</style>
