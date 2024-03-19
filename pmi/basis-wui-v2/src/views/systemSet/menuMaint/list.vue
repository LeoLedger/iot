<template>
    <layout-col height="100%" class="content">
        <layout-row not-flex class="filter-container">
            <el-select
                v-model="searchParam.appId"
                filterable
                placeholder="请选择系统"
                size="mini"
                class="filter-item"
                @change="getList"
            >
                <el-option
                    v-for="item in sysTemList"
                    :key="item.appId"
                    :label="item.appName"
                    :value="item.appId"
                />
            </el-select>
            <el-input
                v-model="searchParam.name"
                class="filter-item"
                clearable
                placeholder="标题"
                size="mini"
                style="width:200px"
                @change="handleFilter()"
            />
            <!-- 搜索 -->
            <el-button
                v-prereclick
                v-waves
                class="filter-item"
                icon="el-icon-search"
                size="mini"
                type="primary"
                @click="handleFilter()"
            >
                搜索
            </el-button>
            <!-- 新增 -->
            <el-button
                v-if="hasPerms(privileges.menu.menuAdd)"
                v-waves
                class="filter-item"
                icon="el-icon-plus"
                size="mini"
                type="success"
                @click="addDialogVisible = true"
            >
                新增
            </el-button>
        </layout-row>
        <layout-row auto>
            <el-table
                ref="Table"
                v-loading="tableData.loading"
                :data="tableData.list"
                border
                fit
                height="100%"
                highlight-current-row
                stripe
                row-key="menuId"
                style="display:inline-block;"
            >
                <el-table-column width="400px" label="菜单名称" prop="menuName" show-overflow-tooltip />
                <el-table-column width="70px" label="类型" prop="menuType" align="center">
                    <template slot-scope="{row, column}">
                        <el-tag size="small" :type="row[column.property] === 1 ? 'success' : ''">
                            {{ (typeEnums.find(v => v.value === row[column.property]) || {}).label || '- -' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="链接地址" prop="linkUrl" show-overflow-tooltip />
                <el-table-column label="排序号" width="80px" prop="orderNum" show-overflow-tooltip />
                <el-table-column label="权限Key" min-width="100px" prop="permissionKey" show-overflow-tooltip />
                <el-table-column label="路由组件Key" prop="componentKey" show-overflow-tooltip />
                <el-table-column label="备注" prop="remark" show-overflow-tooltip />
                <el-table-column
                    align="center"
                    label="操作"
                    width="100"
                >
                    <template slot-scope="{row}">
                        <el-link
                            class="link-button"
                            type="primary"
                            icon="el-icon-plus"
                            title="添加权限"
                            :underline="false"
                            @click="handlePermissionCreate(row)"
                        />
                        <el-link
                            class="link-button"
                            type="primary"
                            icon="el-icon-edit"
                            title="编辑"
                            :underline="false"
                            @click="handleUpdate(row)"
                        />
                        <el-link
                            class="link-button"
                            type="danger"
                            icon="el-icon-delete"
                            title="删除"
                            :underline="false"
                            @click="handleDelete(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </layout-row>
        <div>
            <add
                v-if="addDialogVisible"
                :add-menus-visible="addDialogVisible"
                :app-id="searchParam.appId"
                str="新增"
                :tree-data="tableData.list"
                @closeAddMenus="handleAddDialogClose"
            />
            <edit
                v-if="editDialogVisible"
                :app-id="searchParam.appId"
                :edit-id="activeRowData.menuId"
                :edit-menus-visible="editDialogVisible"
                :getbutton-obj="activeRowData"
                str="编辑"
                :tree-data="tableData.list"
                @closeEditMenus="handleEditDialogClose"
            />
            <!-- 添加权限 -->
            <el-dialog
                :visible="permissionDialog.visible"
                :title="permissionDialog.activeRowData ? '编辑权限' : '创建权限'"
                :before-close="handleDialogClose"
                :close-on-click-modal="false"
                width="500px"
                class="not-padding"
                append-to-body
                @close="permissionDialog.visible = false"
            >
                <div v-loading="permissionDialog.loading" class="permission-dialog">
                    <el-form
                        ref="permissionForm"
                        :model="permissionDialog.formData"
                        :rules="permissionDialog.formRules"
                        label-width="120px"
                        size="mini"
                    >
                        <el-row>
                            <el-col :xs="24">
                                <el-form-item
                                    label="上级菜单"
                                >
                                    <el-input
                                        v-model="permissionDialog.formData.parentMenuName"
                                        disabled
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24">
                                <el-form-item
                                    label="权限名称"
                                    prop="name"
                                >
                                    <el-input
                                        v-model="permissionDialog.formData.name"
                                        clearable
                                        placeholder="输入权限名称"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24">
                                <el-form-item
                                    label="权限key"
                                    prop="permissionKey"
                                >
                                    <el-input
                                        v-model="permissionDialog.formData.permissionKey"
                                        clearable
                                        placeholder="格式：ty.iot.菜单名称.功能名称"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
                <span slot="footer">
                    <el-button :loading="permissionDialog.loading" size="mini" @click="permissionDialog.visible = false">取 消</el-button>
                    <el-button v-prereclick :loading="permissionDialog.loading" type="primary" size="mini" @click="handleSubmit()">保 存</el-button>
                </span>
            </el-dialog>
        </div>
    </layout-col>
</template>
<script>
    import add from './add'
    import edit from './edit'
    import {
        getMenuTree,
        deleMenu,
        handlerMenu
    } from '@/api/systemSet/menuMataince/index'
    import { getAppList } from '@/api/systemSet/application/index'
    import { isEmpty } from '@/utils'

    export default {
        name: 'MenuList',
        components: {
            add,
            edit
        },
        props: {},
        data() {
            return {
                treeData: [],
                tableData: {
                    list: [],
                    loading: false
                },
                typeEnums: [
                    { label: '菜单', value: 0 },
                    { label: '权限', value: 1 }
                ],
                sysTemList: [],
                searchParam: {
                    appId: null,
                    name: ''
                },
                activeRowData: {},
                permissionDialog: {
                    visible: false,
                    loading: false,
                    formData: {},
                    formRules: {
                        permissionKey: [
                            { required: true, trigger: 'change', message: '权限Key不能为空' }
                        ],
                        name: [
                            { required: true, trigger: 'change', message: '权限名称不能为空' }
                        ]
                    },
                    activeRowData: null
                },
                privileges: this.$store.getters.privilege,
                addDialogVisible: false,
                editDialogVisible: false
            }
        },
        watch: {
        },
        created() {
            this.getSystemList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.loading = true
                var res = await getMenuTree(this.searchParam.appId)
                var recursion = (data) => {
                    data.children.forEach(item => {
                        recursion(item)
                        item.parentMenuName = data.menuName
                    })
                    return data
                }
                this.tableData.list = res.data.data.map(item => recursion(item))
                this.tableData.loading = false
            },
            // 获取系统列表
            getSystemList() {
                getAppList({
                    name: '',
                    pageSize: 1000
                }).then(res => {
                    if (res.data.success) {
                        this.sysTemList = res.data.data.records
                        this.searchParam.appId = this.sysTemList[1].appId
                        this.handleFilter()
                    } else {
                        return this.$message.error('获取系统信息错误!')
                    }
                })
            },
            // 筛选列表
            handleFilter() {
                this.getList().then(() => {
                    this.$nextTick(() => {
                        var $table = this.$refs.Table
                        this.tableData.list.forEach(row => {
                            if (row.children.length) {
                                $table.toggleRowExpansion(row, true)
                            }
                        })
                        // 解决不显示合计栏的问题
                        this.$nextTick(() => {
                            $table.doLayout()
                        })
                    })
                })
            },
            // 点击编辑按钮时触发
            handleUpdate(data) {
                if (data.menuType === 0) {
                    this.activeRowData = data
                    this.editDialogVisible = true
                } else {
                    this.handlePermissionUpdate(data)
                }
            },
            // 点击删除按钮时触发
            async handleDelete(data) {
                await this.$confirm('此操作将删除此菜单, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.loading = true
                try {
                    await deleMenu({
                        id: data.menuId
                    })
                    await this.getList()
                    this.$notify({
                        title: '成功',
                        message: '删除成功',
                        type: 'success',
                        duration: 2000
                    })
                } catch (e) {}
                this.tableData.loading = false
            },
            hasPerms(perms) {
                // 根据权限标识和外部指示状态进行权限判断
                return this.hasPermission(perms)
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.permissionDialog.loading = true
                this.$refs.permissionForm.validate(valid => {
                    if (valid) {
                        let { permissionKey } = this.permissionDialog.formData
                        handlerMenu({
                            ...this.permissionDialog.formData,
                            appId: this.searchParam.appId,
                            sortNo: 0,
                            menuType: 1,
                            permissionKey: permissionKey.trim(),
                            isCreatePrivilege: false,
                            isRemovePrivilege: false
                        }).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: '保存成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.getList().then(() => {
                                    this.$refs.permissionForm.resetFields()
                                    this.permissionDialog.visible = false
                                    // 展开更新的权限
                                    if (!this.permissionDialog.activeRowData) {
                                        this.$nextTick(() => {
                                            this.$nextTick(() => {
                                                this.$refs.Table.toggleRowExpansion({
                                                    menuId: this.permissionDialog.formData.parentId
                                                }, true)
                                            })
                                        })
                                    }
                                })
                            } else {
                                this.$message.warning(res.data.msg)
                                this.permissionDialog.loading = false
                            }
                        }).finally(() => {
                            this.permissionDialog.loading = false
                        })
                    } else {
                        this.permissionDialog.loading = false
                    }
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            },
            // 新增窗口关闭时触发
            handleAddDialogClose(bool) {
                this.addDialogVisible = false
                bool && this.getList()
            },
            // 新增窗口关闭时触发
            handleEditDialogClose(bool) {
                this.editDialogVisible = false
                bool && this.getList()
            },
            // 点击新增权限时触发
            handlePermissionCreate(data) {
                this.permissionDialog.visible = true
                this.permissionDialog.formData = {
                    parentId: [data.menuId],
                    parentMenuName: data.menuName
                }
                this.permissionDialog.activeRowData = null
            },
            // 点击编辑权限时触发
            handlePermissionUpdate(data) {
                this.permissionDialog.visible = true
                this.permissionDialog.activeRowData = data
                this.permissionDialog.formData = {
                    id: data.menuId,
                    name: data.menuName,
                    parentId: [data.menuPid],
                    permissionKey: data.permissionKey,
                    parentMenuName: data.parentMenuName
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    padding: 15px;
    /deep/ {
        .el-table .cell {
            line-height: 30px;
        }
    }
    .link-button {
        & + .link-button {
            margin-left: 4px;
        }
    }
}
.permission-dialog {
    padding: 20px 20px 0 0;
    min-height: 200px;
    box-sizing: border-box;
}
</style>
