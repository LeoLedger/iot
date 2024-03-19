<!--
* @description 安装单据
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.deviceInstall.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.deviceInstall.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <DictSelect
                v-model="searchParam.status"
                type="deviceInstallTaskStatus"
                placeholder="任务状态"
                clearable
                filterable
                size="mini"
                style="width: 200px"
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productCode"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.supplierName"
                placeholder="供应商"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.code"
                placeholder="任务编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="计划安装时间">
                <el-date-picker
                    v-model="searchParam.planTime"
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
            <layout-filter-item label="提交人">
                <el-input
                    v-model="searchParam.regisUserName"
                    placeholder="提交人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="提交时间">
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
                <!-- <template slot="操作" slot-scope="{row}">
                    <el-dropdown v-if="row.status === 0" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div class="layout-dropdown-item" @click="handleEndTask(row)">
                                <el-dropdown-item icon="el-icon-circle-close" divided>结束任务</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template> -->
            </TableComponent>
        </template>
    </layout-filter>
</template>

<script>
    // 方法
    // API
    import deviceInstallApi from '@/api/operationsManagement/deviceInstall'
    // 组件

    export default {
        components: {
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
                            label: '编号',
                            minWidth: 155,
                            isClick: true,
                            dialogType: 'deviceInstall'
                        },
                        {
                            prop: 'status',
                            type: 'status',
                            style: 'dot',
                            label: '任务状态',
                            dbProp: 'tdi.c_status',
                            sortable: 'custom',
                            width: 100,
                            dictType: 'deviceInstallTaskStatus'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 160
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 160
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 160,
                            isClick: true,
                            dialogType: 'supplier',
                            idKey: 'supplierId'
                        },
                        {
                            type: 'dateRange',
                            prop: 'startDate',
                            label: '计划安装时间',
                            startKey: 'startDate',
                            endKey: 'endDate',
                            dbProp: 'tdi.c_end_date',
                            sortable: 'custom',
                            minWidth: 200
                        },
                        {
                            prop: 'count',
                            label: '申请安装数量',
                            dbProp: 'tdi.c_count',
                            sortable: 'custom',
                            minWidth: 155
                        },
                        {
                            prop: 'completeCount',
                            label: '安装完成数量',
                            dbProp: 'tdi.c_complete_count',
                            sortable: 'custom',
                            minWidth: 155
                        },
                        {
                            prop: 'regisUserName',
                            label: '提交人',
                            width: 120
                        },
                        {
                            type: 'date',
                            prop: 'regisTime',
                            label: '提交时间',
                            dbProp: 'tdi.c_regis_time',
                            sortable: 'custom',
                            minWidth: 155
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
                        show: false
                    }
                },
                searchParam: {
                    code: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowId: null
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
                var res = await deviceInstallApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records
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
            handleUpdate(data = {}) {
                this.activeRowId = data.guidId
                this.updateDialogVisible = true
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                deviceInstallApi.export(data)
            },
            // 点击结束任务按钮时触发
            async handleEndTask(data) {
                await this.$confirm('此操作将结束此安装单任务, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await deviceInstallApi.close(data.guidId)
                    if (res.success) {
                        await this.getList()
                        this.$notify({
                            title: '成功',
                            message: '操作成功',
                            type: 'success',
                            duration: 2000
                        })
                    }
                } catch (e) {
                    console.log(e)
                }
                this.tableData.options.loading = false
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
.flex-align-center {
    display: flex;
    align-items: center;
    .flex {
        flex: 1;
    }
    .separator {
        margin: 0 8px;
        font-size: 12px;
    }
    /deep/ {
        .el-input__inner {
            text-align: center;
        }
    }
}
</style>
