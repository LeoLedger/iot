<!--
* @description  联系人
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.contacts.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.contacts.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.contacts.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >新增</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.customerName"
                size="mini"
                placeholder="所属单位/公司"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.phone"
                placeholder="联系方式"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.name"
                size="mini"
                placeholder="姓名"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="性别">
                <DictSelect
                    v-model="searchParam.sex"
                    type="sex"
                    placeholder="性别"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="电子邮箱">
                <el-input
                    v-model="searchParam.email"
                    size="mini"
                    placeholder="电子邮箱"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="QQ号">
                <el-input
                    v-model="searchParam.qq"
                    size="mini"
                    placeholder="QQ号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="微信号">
                <el-input
                    v-model="searchParam.wx"
                    size="mini"
                    placeholder="微信号"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="生日日期">
                <el-date-picker
                    v-model="searchParam.bornTime"
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
                <template slot="操作" slot-scope="scope">
                    <el-dropdown v-if="includeFeature(['ty.iot.contacts.update', 'ty.iot.contacts.delete'])" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.contacts.update'])" class="layout-dropdown-item" @click="handleUpdate(scope.row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="checkFeature(['ty.iot.contacts.delete'])" class="layout-dropdown-item" @click="handleDelete(scope.row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 更新项目信息 -->
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
    // API
    import contactsApi from '@/api/PM/contacts'
    // 组件
    import UpdateDialog from './components/UpdateDialog'

    export default {
        components: {
            UpdateDialog
        },
        props: {},
        data() {
            return {
                searchParam: {
                    qq: '',
                    wx: '',
                    sex: '',
                    name: '',
                    email: '',
                    phone: '',
                    bornTime: [],
                    customerName: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '姓名',
                            fixed: 'left',
                            disabled: true,
                            isClick: true,
                            dialogType: 'contacts'
                        },
                        {
                            type: 'dict',
                            dictType: 'sex',
                            prop: 'sex',
                            label: '性别'
                        },
                        {
                            prop: 'customerName',
                            label: '所属单位/公司'
                        },
                        {
                            prop: 'deptName',
                            label: '所属部门',
                            width: 150
                        },
                        {
                            prop: 'position',
                            label: '职务'
                        },
                        {
                            prop: 'phone',
                            label: '联系方式'
                        },
                        {
                            prop: 'email',
                            label: '电子邮箱'
                        },
                        {
                            prop: 'qq',
                            label: 'QQ号'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
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
            getList() {
                this.tableData.options.loading = true
                contactsApi.getList({
                    ...this.searchParam
                }).then(res => {
                    if (res.success) {
                        this.tableData.list = res.data.records.map(item => {
                            return item
                        })
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                })
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
                await this.$confirm('此操作将删除此联系人信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await contactsApi.delete(data.guidId)
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
                contactsApi.export(data)
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
