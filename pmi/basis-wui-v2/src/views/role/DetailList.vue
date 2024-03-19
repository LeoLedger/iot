<template>
    <layout-row auto>
        <layout-col auto>
            <layout-row not-flex class="Mentitle">
                <el-input
                    v-model="searchParam.roleName"
                    placeholder="角色名称"
                    clearable
                    class="filter-item"
                    style="width:200px"
                    size="mini"
                />
                <el-select
                    v-model="searchParam.roleType"
                    placeholder="请选择角色类型"
                    clearable
                    class="filter-item"
                    style="width:200px"
                    size="mini"
                >
                    <el-option
                        v-for="item in roleTypeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>

                <el-checkbox v-model="searchParam.checkedSubDept">
                    包含子部门
                </el-checkbox>

                <!-- 搜索 -->
                <el-button
                    v-waves
                    v-prereclick
                    class="filter-item"
                    type="primary"
                    icon="el-icon-search"
                    size="mini"
                    @click="filterHandler"
                >
                    搜索
                </el-button>

                <!-- 新增 -->
                <el-button
                    v-waves
                    class="filter-item"
                    type="success"
                    icon="el-icon-plus"
                    size="mini"
                    @click="addInfo"
                >
                    添加角色
                </el-button>

                <!-- 删除角色 -->
                <el-button
                    v-waves
                    class="filter-item"
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="deleteRowInfo"
                >
                    删除角色
                </el-button>
            </layout-row>
            <layout-row auto>
                <!-- 列表 -->
                <TableComponent
                    :list="list"
                    :total="total"
                    height="100%"
                    :page-size.sync="pageSize"
                    :page-index.sync="pageIndex"
                    :options="options"
                    :columns="columns"
                    :operates="operates"
                    :selected-list="selectList"
                    @handleSelectionChange="handleSelectionChange"
                >
                    <template slot="操作" slot-scope="{row}">
                        <el-button
                            icon="el-icon-setting"
                            title="配置权限"
                            type="primary"
                            @click="handlePermission(row)"
                        />
                    </template>
                </TableComponent>
            </layout-row>
        </layout-col>
        <div>
            <EditDialog
                v-if="editDialogVisible"
                :visible.sync="editDialogVisible"
                :form-data="detailData"
                :is-edit="isEdit"
                :tree-data="treeData"
                @editSubmitCallBack="editSubmitCallBack"
            />
            <PrivilegeDialog
                v-if="fixRolesShow"
                :fix-role-visible="fixRoleVisible"
                :role="selectRole"
                @closeFixRoles="closeFixRoles"
            />
            <PermissionConfigDialog
                v-bind="permissionConfigDialog"
                :visible.sync="permissionConfigDialog.visible"
            />
        </div>
    </layout-row>
</template>

<script>
    import TableComponent from '@/components/TableComponent'
    import EditDialog from './EditDialog'
    import { getRolesInfo, getRolesList, delRoleIds } from '@/api/role'
    import { roleStatusEnum, roleTypeEnum } from '@/utils/enum'

    // 权限配置
    import PrivilegeDialog from './PrivilegeDialog'
    import PermissionConfigDialog from '@/components/PermissionConfigDialog'

    export default {
        name: 'DetailList',
        components: {
            TableComponent,
            EditDialog,
            PrivilegeDialog,
            PermissionConfigDialog
        },
        props: {
            // 当前所选部门
            deptId: {
                type: String
            },
            parentInfo: {
                type: Object
            },
            treeData: {
                type: Array
            }
        },
        data() {
            const _this = this
            return {
                editDialogVisible: false, // 编辑弹窗
                fixRolesShow: false,
                fixRoleVisible: false,
                selectRole: [],
                detailData: {
                    orderNum: 0, // 默认排序为零
                    roleCode: '测试编号',
                    roleStatus: 10401, // 角色状态默认正常
                    roleType: 12001 // 默认系统角色
                },
                isEdit: false, // 判断弹窗类型
                selectedFormOption: [],
                list: [],
                total: 0, // table数据总条数
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                    mutiSelect: true, // 开启选择
                    mutiSelectedKey: 'roleId', // 根据 对应key 找出应被选中的状态
                    curRowKey: 'roleId'
                },
                selectList: [],
                roleTypeEnum,
                roleStatusEnum,
                searchParam: {
                    roleName: '',
                    roleType: '',
                    checkedSubDept: true
                },
                columns: [
                    {
                        prop: 'roleName',
                        label: '名称',
                        width: 110
                    },
                    {
                        prop: 'roleCode',
                        label: '编号',
                        width: 200
                    }, {
                        prop: 'deptName',
                        label: '所属部门',
                        width: 100
                    },
                    {
                        prop: 'mapName',
                        label: '所属区域',
                        width: 100
                    },
                    {
                        prop: 'roleType',
                        label: '类型',
                        width: 100,
                        formatter: function(row, column) {
                            let text = ''
                            const res = _this.roleTypeEnum.find(({ value }) => {
                                return value === row.roleType
                            }) || {}
                            text = res.label
                            return text || ''
                        }
                    },
                    {
                        prop: 'roleStatus',
                        label: '状态',
                        width: 100,
                        formatter: function(row, column) {
                            let text = ''
                            const res = _this.roleStatusEnum.find(({ value }) => {
                                return value === row.roleStatus
                            }) || {}
                            text = res.label
                            return text || ''
                        }
                    }, {
                        prop: 'orderNum',
                        label: '排序',
                        width: 100
                    }, {
                        prop: 'remark',
                        label: '备注',
                        minWidth: 200
                    }
                ],
                // 列操作按钮
                operates: {
                    width: 70,
                    fixed: 'right',
                    show: true
                },
                activeRowData: null,
                permissionConfigDialog: {
                    visible: false
                }
            }
        },
        watch: {
            pageIndex(newData, oldDate) {
                this.queryList()
            },
            pageSize(newData, oldDate) {
                this.queryList()
            },
            deptId(newData, oldData) {
                this.queryList()
            }
        },
        methods: {
            // 请求数据列表
            queryList() {
                const _this = this
                const {
                    pageSize,
                    pageIndex,
                    options,
                    searchParam,
                    deptId
                } = this
                if (typeof deptId === 'undefined') return
                options.loading = true
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    deptId, // 部门节点
                    ...searchParam
                }
                this.selectList = []
                getRolesList(params).then(res => {
                    let data = null
                    if (res.data.success) {
                        data = res.data.data.records
                    } else {
                        return this.$message.error('角色信息获取失败！')
                    }
                    _this.options.loading = false // 更改加载中的 loading值
                    _this.list = data || []
                    _this.total = res.data.data.total// data.records;
                })
            },
            filterHandler() {
                this.pageIndex = 1 // 初始为1
                if (typeof this.deptId === 'undefined') {
                    return this.$message.error('请先选择部门')
                }
                this.queryList()
            },
            // 删除
            deleteRowInfo() {
                const list = this.selectList
                if (list.length > 0) {
                    this.$confirm('此操作将删除所选记录, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        delRoleIds(list).then(res => {
                            const { success, msg } = res.data
                            if (success) {
                                this.$message({
                                    type: 'success',
                                    message: '删除成功!'
                                })
                                this.queryList()
                                this.$emit('editSubmitCallBack')
                            } else {
                                this.$message.error(msg)
                            }
                        })
                    }).catch(() => {
                    })
                } else {
                    this.$message.error('请选择要删除的数据!')
                }
            },
            // 编辑
            async editRowInfo(index, row) {
                // 获取角色信息
                const info = await this.querySysRloeDetail(row.roleId)
                this.detailData = info
                this.editDialogVisible = true
                this.isEdit = true
            },
            // 新增
            addInfo() {
                this.detailData = {}
                if (typeof this.deptId === 'undefined') {
                    return this.$message.error('请先选择部门')
                }
                this.editDialogVisible = true
                this.isEdit = false
                this.detailData.deptStr = [this.deptId]
            },
            // 获取角色信息
            querySysRloeDetail(id) {
                return getRolesInfo(id).then((res) => {
                    const { success, data, msg } = res.data
                    if (success) {
                        return data || {}
                    } else {
                        this.$message.error(message)
                    }
                })
            },
            // 选择事件
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 配置人员或权限
            openUserOrPrivilege(role) {
                this.fixRolesShow = true
                this.fixRoleVisible = true
                this.selectRole = role
            },
            // 关闭权限配置
            closeFixRoles(model) {
                this.fixRoleVisible = false
                this.fixRolesShow = false
            },
            editSubmitCallBack() {
                this.$emit('editSubmitCallBack') // 触发刷新 树/详情/列表数据
            },
            // 点击配置权限按钮时触发
            handlePermission(data) {
                this.activeRowData = data
                this.permissionConfigDialog = {
                    title: `权限 - ${data.roleName}`,
                    visible: true,
                    objectId: data.roleId,
                    objectType: 0
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.Mentitle {
    margin-bottom: 10px;
}
</style>
