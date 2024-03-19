<template>
    <div class="app-container userMain">
        <div class="leftSide">
            <SideBarTree :id="deptId" ref="tree" @updateDeptId="updateDeptId" />
        </div>

        <div class="rigthSide">
            <!--搜索栏-->
            <div class="filter-container">
                <el-input
                    v-model="searchParam.userName"
                    placeholder="姓名"
                    clearable
                    style="width:180px"
                    size="mini"
                />
                <el-input
                    v-model="searchParam.loginName"
                    placeholder="登录名"
                    clearable
                    style="width:180px"
                    size="mini"
                />
                <el-select v-model="searchParam.userType" placeholder="类型" clearable size="mini" value="">
                    <el-option
                        v-for="item in userTypeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="searchData">
                    搜索
                </el-button>
                <el-button type="success" icon="el-icon-plus" size="mini" @click="openAddDialog">
                    添加
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser">
                    删除
                </el-button>
            </div>

            <!--数据表格-->
            <el-table
                ref="dataTable"
                :data="dataList"
                border
                fit
                resizable
                highlight-current-row
                height="70vh"
                style="display:inline-block;"
            >
                <el-table-column align="center" type="selection" width="55" prop="multiSelect" />
                <el-table-column align="center" width="50" label="序号">
                    <template slot-scope="scope">
                        <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="姓名" width="100" prop="userName" />
                <el-table-column align="center" label="登录名" prop="loginName" />
                <el-table-column align="center" label="区域" prop="mapName" />
                <el-table-column align="center" label="部门" prop="deptName" />
                <el-table-column align="center" label="描述" prop="remark" />
                <el-table-column align="center" label="状态" prop="enable" width="80">
                    <template slot-scope="scope">
                        <span :style="{color: scope.row.enable ? '#67C23A' : '#F56C6C'}">{{ scope.row.enable ? '启用' :'停用' }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            title="编辑"
                            @click="openEditDialog(scope.row.userId)"
                        />
                        <el-button
                            type="primary"
                            icon="el-icon-edit-outline"
                            size="mini"
                            title="配置"
                            @click="openDeptRolePrivilegeDialog(scope.row)"
                        />
                        <el-button
                            type="primary"
                            icon="el-icon-setting"
                            size="mini"
                            title="权限配置"
                            @click="handlePermission(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>

            <!--分页控件-->
            <Pagination
                v-show="pagination.total > 0"
                :total="pagination.total"
                :page.sync="searchParam.pageIndex"
                :limit.sync="searchParam.pageSize"
                @pagination="getList"
            />
        </div>

        <!--添加用户弹窗-->
        <user-add
            v-if="addDialogVisible"
            :add-dialog-visible="addDialogVisible"
            :dialog-title="dialogTitle"
            :dept-id="searchParam.deptId"
            @closeAddDialog="closeAddDialog"
        />
        <!--编辑用户弹窗-->
        <user-edit
            v-if="editDialogVisible"
            :edit-dialog-visible="editDialogVisible"
            :dialog-title="dialogTitle"
            :user-id="userId"
            @closeEditDialog="closeEditDialog"
        />
        <!--角色、权限、部门-->
        <PrivilegeDialog
            v-if="fixRolesShow"
            :fix-role-visible="fixRoleVisible"
            :user="selectUser"
            @closeFixRoles="closeFixRoles"
        />
        <PermissionConfigDialog
            v-bind="permissionConfigDialog"
            :visible.sync="permissionConfigDialog.visible"
        />
    </div>
</template>

<script>
    import { userTypeEnum } from '@/utils/enum'
    import SideBarTree from '@/views/role/components/SideBarTree'
    import { DEPT_ID } from '@/views/role/Config'
    import Pagination from '@/components/Pagination'
    import { getUserList, deleteUser } from '@/api/user/index'
    import UserAdd from './userAdd'
    import UserEdit from './userEdit'
    import PrivilegeDialog from './PrivilegeDialog'
    import PermissionConfigDialog from '@/components/PermissionConfigDialog'

    export default {
        name: 'UserList',
        components: {
            Pagination,
            UserAdd,
            UserEdit,
            SideBarTree,
            PrivilegeDialog,
            PermissionConfigDialog
        },
        data() {
            return {
                dataList: [],
                userId: null,
                deptId: DEPT_ID,
                pagination: {
                    total: 0,
                    pageIndex: 1
                },
                searchParam: {
                    userName: null,
                    loginName: null,
                    userType: null,
                    deptId: null,
                    pageSize: 15,
                    pageIndex: 1,
                    sortField: '',
                    sortDirection: ''
                },
                dialogTitle: '',
                addDialogVisible: false,
                editDialogVisible: false,
                userTypeEnum: userTypeEnum,
                multipleSelection: [],
                fixRolesShow: false,
                fixRoleVisible: false,
                selectUser: [],
                permissionConfigDialog: {
                    title: '',
                    visible: false
                }
            }
        },
        mounted() {
            this.forceUpdateTree()
            this.getList()
        },
        methods: {
            // 关闭权限配置
            closeFixRoles(model) {
                this.fixRoleVisible = false
                this.fixRolesShow = false
            },
            // 获取数据列表
            getList() {
                getUserList(this.searchParam).then(res => {
                    if (res && res.data.success) {
                        this.dataList = res.data.data.records
                        this.pagination.total = res.data.data.total
                    } else {
                        this.$message({
                            showClose: true,
                            message: '获取数据失败：' + res.data.msg,
                            type: 'error'
                        })
                    }
                })
            },
            searchData() {
                this.searchParam.pageIndex = 1
                this.getList()
            },
            deleteUser() {
                const arr = this.$refs['dataTable'].selection
                this.$confirm('确认删除用户?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if (!arr.length) {
                        this.$message({
                            showClose: true,
                            message: '请选择要删除的用户',
                            type: 'warning'
                        })
                        return
                    }
                    deleteUser(arr).then(res => {
                        if (res && res.data.success) {
                            this.$message({
                                showClose: true,
                                message: '删除成功',
                                type: 'success'
                            })
                            this.getList()
                        } else {
                            this.$message({
                                showClose: true,
                                message: '错误：' + res.data.msg,
                                type: 'error'
                            })
                        }
                    })
                })
            },
            // 打开添加用户窗口
            openAddDialog() {
                this.dialogTitle = '新增'
                this.addDialogVisible = true
            },
            // 关闭添加用户窗口
            closeAddDialog(isFlush) {
                if (isFlush) {
                    this.getList()
                }
                this.addDialogVisible = false
            },
            // 打开编辑用户窗口
            openEditDialog(userId) {
                this.userId = userId
                this.dialogTitle = '编辑'
                this.editDialogVisible = true
            },
            // 关闭编辑用户窗口
            closeEditDialog(isFlush) {
                if (isFlush) {
                    this.getList()
                }
                this.editDialogVisible = false
            },
            // 更新树
            async forceUpdateTree() {
                this.treeData = await this.$refs.tree.getTree()
                if (this.deptId) {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.tree &&
                        this.$refs.tree.setCurrentKey &&
                        this.$refs.tree.setCurrentKey(this.deptId)
                }
            },
            // 点击左边树更新部门
            updateDeptId(value) {
                this.searchParam.deptId = value
                this.getList()
            },
            // 打开部门角色权限
            openDeptRolePrivilegeDialog(value) {
                this.fixRolesShow = true
                this.fixRoleVisible = true
                this.selectUser = value
            },
            // 点击配置权限按钮时触发
            handlePermission(data) {
                this.activeRowData = data
                this.permissionConfigDialog = {
                    title: `权限 - ${data.userName}`,
                    visible: true,
                    objectId: data.userId,
                    objectType: 1
                }
            }
        }
    }
</script>

<style lang='scss'>
  .userMain {
    display: flex;
    height: calc(100vh - 50px);

    .leftSide {
      width: 18%;
      float: left;
      position: relative;
      border: 1px solid #ebeef5;
      padding: 10px;
      border-radius: 5px;
      display: flex;
    }

    .rigthSide {
      width: 80%;
      float: left;
      overflow: auto;
      margin-left: 1.5%;
    }
  }
</style>
