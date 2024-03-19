<!--
* @description  来料批次检测
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.materialTesting.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.materialTesting.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.materialTesting.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >登记</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.code"
                placeholder="批次"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.productTestType"
                type="checkType"
                placeholder="检测类型"
                clearable
                filterable
                size="mini"
                style="width: 180px"
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="产品编号">
                <el-input
                    v-model="searchParam.productCode"
                    size="mini"
                    placeholder="产品编号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="产品类型">
                <DictSelect
                    v-model="searchParam.productType"
                    type="productType"
                    placeholder="产品类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <el-input
                    v-model="searchParam.supplierName"
                    size="mini"
                    placeholder="供应商"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="抽检结果">
                <DictSelect
                    v-model="searchParam.checkResult"
                    type="spotCheckResult"
                    placeholder="抽检结果"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="抽检日期">
                <el-date-picker
                    v-model="searchParam.date"
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
            <layout-filter-item label="操作人">
                <el-input
                    v-model="searchParam.userName"
                    size="mini"
                    placeholder="操作人"
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
                    <el-dropdown v-if="includeFeature(['ty.iot.materialTesting.update', 'ty.iot.materialTesting.delete'])" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.materialTesting.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="checkFeature(['ty.iot.materialTesting.delete'])" class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
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
    // API
    import materialTestingApi from '@/api/operationsManagement/materialTesting'
    // 组件
    import UpdateDialog from './components/UpdateDialog'

    export default {
        components: {
            UpdateDialog
        },
        props: {

        },
        data() {
            return {
                searchParam: {
                    code: '',
                    date: [],
                    productCode: '',
                    productType: '',
                    checkResult: '',
                    userName: '',
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
                            label: '批次',
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            dialogType: 'materialTesting'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 130,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            minWidth: 155,
                            label: '产品类型'
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 200
                        },
                        {
                            prop: 'count',
                            label: '抽检数量',
                            width: 100
                        },
                        {
                            prop: 'countInvalid',
                            label: '不良品数',
                            width: 100,
                            dbProp: 'tdii.c_count_invalid',
                            sortable: 'custom'
                        },
                        {
                            prop: 'checkResult',
                            type: 'status',
                            style: 'block',
                            dictType: 'spotCheckResult',
                            label: '抽检结果',
                            dbProp: 'tdii.c_check_result',
                            sortable: 'custom',
                            width: 100
                        },
                        {
                            type: 'dict',
                            prop: 'productTestType',
                            dictType: 'checkType',
                            label: '检测类型',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '抽检日期',
                            width: 100,
                            dbProp: 'tdii.c_check_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'userName',
                            label: '操作人',
                            width: 100
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 300
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
                updateDialogVisible: false
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
                var res = await materialTestingApi.getList({
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
                await this.$confirm('此操作将删除此来料批次检测信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await materialTestingApi.delete(data.guidId)
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
                materialTestingApi.export(data)
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
</style>
