<!--
* @description  项目
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.project.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.project.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.project.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >新增</el-button>
            <ImportButton
                :download-method="handleDownloadTemplate"
                class="filter-item"
                type="primary"
                action="project/import"
                title="项目列表导入"
                template-name="项目记录模板.xlsx"
                @success="handleImportConfirm"
            />
        </template>
        <template slot="filter">
            <RegionCascader
                v-model="searchParam.regionList"
                clearable
                placeholder="请选择所属区域"
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.businessType"
                type="businessType"
                placeholder="业务类型"
                clearable
                filterable
                class="filter-item"
                size="mini"
                width="200px"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.projectName"
                size="mini"
                placeholder="项目名称"
                maxlength="11"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.code"
                placeholder="项目编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="项目状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="projectStatus"
                    placeholder="项目状态"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="源客户">
                <el-input
                    v-model="searchParam.customerName"
                    size="mini"
                    placeholder="源客户"
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
            <layout-filter-item label="销售经理">
                <el-input
                    v-model="searchParam.saleManagerUserName"
                    size="mini"
                    placeholder="销售经理"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="项目周期">
                <el-date-picker
                    v-model="searchParam.dateList"
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
                    <el-dropdown v-if="includeFeature(['ty.iot.project.update', 'ty.iot.project.delete'])" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="row.status === 0 && checkFeature(['ty.iot.project.update'])" class="layout-dropdown-item" @click="handleUpdateStatus(row)">
                                <el-dropdown-item icon="el-icon-setting" divided>启用</el-dropdown-item>
                            </div>
                            <template>
                                <div v-if="checkFeature(['ty.iot.project.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="checkFeature(['ty.iot.project.delete'])" class="layout-dropdown-item" @click="handleDelete(row)">
                                    <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                </div>
                                <div v-if="checkFeature(['ty.iot.project.update'])" class="layout-dropdown-item" @click="handleUpdateStatus(row)">
                                    <el-dropdown-item icon="el-icon-circle-close" divided>关闭</el-dropdown-item>
                                </div>
                            </template>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 编辑数据 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :data-id="activeRowId"
                :visible.sync="updateDialogVisible"
                is-edit
                @update="getList"
            />
        </div>
    </layout-template>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    import moment from 'moment'
    // API
    import resourceApi from '@/api/resource'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    // 组件
    import UpdateDialog from './components/UpdateDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        name: 'Project',
        components: {
            UpdateDialog,
            ImportButton
        },
        props: {

        },
        data() {
            return {
                searchParam: {
                    status: 1,
                    dateList: [],
                    regionList: [],
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '项目编号',
                            disabled: true
                        },
                        {
                            prop: 'qqProjectCode',
                            label: '企企项目编号',
                            disabled: true
                        },
                        {
                            prop: 'qqProjectName',
                            label: '企企项目名称',
                            disabled: true
                        },
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            disabled: true,
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'status',
                            type: 'status',
                            enums: enums.projectStatus,
                            label: '状态',
                            width: 100
                        },
                        {
                            type: 'dict',
                            dictType: 'businessType',
                            prop: 'businessType',
                            label: '业务类型'
                        },
                        {
                            prop: 'areaName',
                            label: '所属区域'
                        },
                        {
                            prop: 'customerName',
                            label: '源客户'
                        },
                        {
                            prop: 'projectManagerUserName',
                            label: '项目经理'
                        },
                        {
                            prop: '_period',
                            label: '项目周期'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: true
                    }
                },
                activeRowId: null,
                updateDialogVisible: false,
                peopleRemoteMethod: resourceApi.getUserList,
                customerRemoteMethod: customerApi.getList
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
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var [beginDate, endDate] = this.searchParam._period || []
                var [provinceId, cityId, areaId] = this.searchParam.regionList
                var res = await projectApi.getList({
                    ...this.searchParam,
                    areaId,
                    cityId,
                    provinceId,
                    endDate,
                    beginDate,
                    regionList: ''
                })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        item._period = `${moment(item.startDate).format('YYYY-MM-DD')} 至 ${moment(item.endDate).format('YYYY-MM-DD')}`
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
                if (data.contractCount > 0) {
                    this.$message.warning('该项目有存在关联的合同，不允许删除！')
                } else {
                    await this.$confirm('此操作将删除此项目信息, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    })
                    this.tableData.options.loading = true
                    try {
                        var res = await projectApi.delete(data.guidId)
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
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                projectApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            // 更新项目状态
            async handleUpdateStatus(data) {
                var tips = ['是否启用该项目?', '此操作将关闭此项目, 是否继续?'][data.status]

                await this.$confirm(tips, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await projectApi.updateStatus({
                        id: data.id,
                        status: [1, 0][data.status]
                    })
                    if (res.success) {
                        await this.getList()
                        this.$notify({
                            title: '成功',
                            message: ['启用成功', '关闭成功'][data.status],
                            type: 'success',
                            duration: 2000
                        })
                    }
                } catch (e) {}
                this.tableData.options.loading = false
            },
            // 导入
            handleImportConfirm(data) {
                var failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                var succeed = data.length - failure
                var messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
                messageNode += data.map((item, index) => {
                    if (item.code > 0) {
                        return `<p>第${index + 1}行：${item.errorMsg}</p>`
                    }
                }).filter(v => v).join('')
                this.$message({
                    type: 'success',
                    duration: failure > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.tableData.list = data.filter(item => item.code === 0).map(item => item.data).concat(this.tableData.list)
                this.handleFilter()
            },
            // 下载模板
            handleDownloadTemplate() {
                projectApi.downTemplate({ tem: 1 }).then(res => {
                    this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
