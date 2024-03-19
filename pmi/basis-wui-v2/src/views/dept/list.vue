<template>
    <div class="app-container deptMain">
        <div class="leftSide">
            <el-tabs v-model="activeName">
                <el-tab-pane label="默认部门" name="first">
                    <SideBarTree :id="deptId" ref="tree" v-loading="deptTreeLoading" @updateDeptId="updateDeptId" />
                </el-tab-pane>
                <el-tab-pane label="部门树设置" name="second">
                    <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-circle-plus-outline"
                        @click="deptTreeAddDialog('新增')"
                    >
                        新增
                    </el-button>
                    <ul>
                        <li v-for="(item,index) in deptTreeDefineList" class="li-item">
                            <el-link
                                class="left-item"
                                :underline="false"
                                :class="curIndex === index ? 'active' : ''"
                                @click="activeItem(item,index)"
                            >
                                {{ item.name }}
                            </el-link>&emsp;
                            <el-link
                                type="primary"
                                class="right-item"
                                :underline="false"
                                @click="deptTreeAddDialog('编辑',item)"
                            >
                                编辑
                            </el-link>
                        </li>
                    </ul>
                </el-tab-pane>
            </el-tabs>
        </div>

        <div class="rigthSide">
            <!--部门部分-->
            <div v-if="activeName==='first'" class="deptBox">
                <div class="filter-container">
                    <el-input
                        v-model="searchParam.deptName"
                        placeholder="部门名称"
                        clearable
                        style="width:180px"
                        size="mini"
                    />
                    <el-input
                        v-model="searchParam.deptCode"
                        placeholder="部门编码"
                        clearable
                        style="width:180px"
                        size="mini"
                    />
                    <el-select
                        v-model="searchParam.deptType"
                        placeholder="部门类型"
                        clearable
                        size="mini"
                        value=""
                    >
                        <el-option
                            v-for="item in deptTypeEnum"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="searchData">
                        搜索
                    </el-button>
                    <el-button type="success" icon="el-icon-plus" size="mini" @click="addDept('新增')">
                        添加
                    </el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDept">
                        删除
                    </el-button>
                </div>
                <el-table
                    ref="deptTable"
                    key="deptTable"
                    name="deptTable"
                    :data="deptList"
                    border
                    fit
                    resizable
                    highlight-current-row
                    height="70vh"
                    style="display:inline-block;"
                >
                    <el-table-column align="center" type="selection" width="55" prop="multiSelect" />
                    <el-table-column align="center" label="排序值" width="100" prop="orderNum" />
                    <el-table-column align="center" label="部门名称" prop="deptName" />
                    <el-table-column align="center" label="部门编码" prop="deptCode" />
                    <el-table-column align="center" label="DEV_CODE" prop="devCode" />
                    <el-table-column align="center" label="类型" prop="deptType">
                        <template slot-scope="scope">
                            {{ deptTypeEnum.find(item => item.value === scope.row.deptType).label || '' }}
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="区域" prop="mapName" />
                    <el-table-column align="center" label="描述" prop="remark" />
                    <el-table-column align="center" label="操作">
                        <template slot-scope="scope">
                            <el-button
                                type="primary"
                                icon="el-icon-edit"
                                size="mini"
                                title="编辑"
                                @click="addDept('编辑',scope.row.deptId)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
                <Pagination
                    v-show="pagination.total > 0"
                    :total="pagination.total"
                    :page.sync="searchParam.pageIndex"
                    :limit.sync="searchParam.pageSize"
                    @pagination="getDepts"
                />
            </div>

            <!--部门树部分-->
            <div v-else class="deptTreeBox">
                <div class="filter-container">
                    <el-button type="primary" icon="el-icon-circle-plus-outline" size="mini" @click="addDeptInTree">
                        调入
                    </el-button>
                    <el-button type="danger" icon="el-icon-remove-outline" size="mini" @click="outDeptInTree">
                        调出
                    </el-button>
                </div>
                <el-row :gutter="10" style="margin: 0">
                    <el-col :span="19">
                        <el-table
                            ref="deptInTreeTable"
                            key="deptInTreeTable"
                            v-loading="deptInTreeListLoading"
                            :data="deptInTreeList"
                            border
                            fit
                            resizable
                            highlight-current-row
                            height="72vh"
                            style="display:inline-block;"
                        >
                            <el-table-column align="center" type="selection" width="55" prop="multiSelect" />
                            <el-table-column align="center" label="序号" width="80">
                                <template slot-scope="scope">
                                    <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" label="部门名称" prop="deptName" />
                            <el-table-column align="center" label="父级部门" prop="deptPname" />
                            <el-table-column align="center" label="部门编码" prop="deptCode" />
                        </el-table>
                        <Pagination
                            v-show="pagination.total > 0"
                            :total="pagination.total"
                            :page.sync="searchParam.pageIndex"
                            :limit.sync="searchParam.pageSize"
                            @pagination="getDeptInTrees"
                        />
                    </el-col>
                    <el-col :span="5">
                        <el-tree
                            :data="inTreeList"
                            :props="defaultProps"
                            style="height: 580px;overflow: auto;border: 1px solid #ebeef5"
                        />
                    </el-col>
                </el-row>
            </div>

            <DeptTreeDfineDialog
                v-if="deptTreeDfineDialogVisible"
                :visible="deptTreeDfineDialogVisible"
                :dialog-title="deptTreeDfineDialogTitle"
                :dept-tree-define-obj="deptTreeDefineObj"
                @closeDialog="closeDialog"
            />

            <DeptInTreeDialog
                v-if="deptInTreeDialogVisible"
                :visible="deptInTreeDialogVisible"
                :in-tree-list="inTreeList"
                :dept-tree-id="deptTreeId"
                @closeDialog="closeDialog"
            />

            <AddDialog
                v-if="addDialog.showAddDialog"
                :add-dialog="addDialog"
                :add-dialog-visible="addDialog.showAddDialog"
                :dialog-title="addDialog.addDialogTitle"
                :dept-id="addDialog.curDeptId"
                @closeAddDialog="closeAddDialog"
            />
        </div>
    </div>
</template>

<script>
    import { deptTypeEnum } from '@/utils/enum'
    import SideBarTree from '@/views/role/components/SideBarTree'
    import { DEPT_ID } from '@/views/role/Config'
    import { getDeptList, deleteDept } from '@/api/dept/index'
    import Pagination from '@/components/Pagination'
    import DeptTreeDfineDialog from './deptTreeDfineDialog'
    import DeptInTreeDialog from './deptInTreeDialog'
    import { getDeptTreeDefineList } from '@/api/dept/deptTreeDefine/index'
    import { getDeptInTreeList, deleteDeptInTree, getInTreeList } from '@/api/dept/deptInTree/index'
    import AddDialog from './add'
    import EditDialog from './edit'

    export default {
        name: 'DeptList',
        components: {
            SideBarTree,
            Pagination,
            DeptTreeDfineDialog,
            DeptInTreeDialog,
            AddDialog,
            EditDialog
        },
        data() {
            return {
                deptTreeLoading: true,
                addDialog: {
                    showAddDialog: false,
                    addDialogTitle: '添加部门',
                    curDeptId: null
                },
                curIndex: 0,
                activeName: 'first',
                deptTypeEnum: deptTypeEnum,
                deptId: DEPT_ID,
                searchParam: {
                    deptName: null,
                    deptCode: null,
                    deptType: null,
                    deptId: null,
                    deptTreeId: null,
                    pageSize: 15,
                    pageIndex: 1,
                    sortField: '',
                    sortDirection: ''
                },
                deptList: [],
                deptTreeDefineList: [],
                deptInTreeList: [],
                pagination: {
                    total: 0,
                    pageIndex: 1
                },
                deptTreeDfineDialogVisible: false,
                deptTreeDfineDialogTitle: '',
                deptTreeDefineObj: null,
                deptInTreeDialogVisible: false,
                deptTreeId: null,
                inTreeList: [],
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                deptInTreeListLoading: true
            }
        },
        watch: {
            activeName: {
                immediate: true,
                deep: true,
                handler(val) {
                    if (val === 'second') {
                        this.getDeptTreeDefines()
                        this.getInTreeList()
                    }
                }
            }
        },
        mounted() {
            this.forceUpdateTree()
            this.getDepts()
        },
        methods: {
            // 更新树
            async forceUpdateTree() {
                this.treeData = await this.$refs.tree.getTree()
                if (this.deptId) {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.tree &&
                        this.$refs.tree.setCurrentKey &&
                        this.$refs.tree.setCurrentKey(this.deptId)
                }
                this.deptTreeLoading = false
            },
            // 点击左边树更新部门
            updateDeptId(value) {
                this.searchParam.deptId = value
                this.getDepts()
            },
            // 获取数据列表
            getDepts() {
                getDeptList(this.searchParam).then(res => {
                    if (res && res.data.success) {
                        this.deptList = res.data.data.records
                        this.pagination.total = res.data.data.total
                    } else {
                        this.$message({
                            showClose: true,
                            message: '获取部门数据失败',
                            type: 'error'
                        })
                    }
                })
            },
            searchData() {
                this.searchParam.pageIndex = 1
                this.getDepts()
            },
            deptTreeAddDialog(type, obj) {
                this.deptTreeDefineObj = obj
                this.deptTreeDfineDialogTitle = type
                this.deptTreeDfineDialogVisible = true
            },
            // 关闭弹窗
            closeDialog(isFlush, type) {
                if (isFlush) {
                    if (type && type === 'intree') {
                        this.getInTreeList()
                        this.getDeptInTrees()
                    } else {
                        this.getDeptTreeDefines()
                    }
                }
                this.deptTreeDfineDialogVisible = false
                this.deptInTreeDialogVisible = false
            },
            getDeptTreeDefines() {
                getDeptTreeDefineList().then(res => {
                    if (res && res.data.success) {
                        this.deptTreeDefineList = res.data.data
                        this.deptTreeId = this.deptTreeDefineList[0].deptTreeId
                        this.getDeptInTrees()
                    } else {
                        this.$message({
                            showClose: true,
                            message: '获取部门树失败',
                            type: 'error'
                        })
                    }
                })
            },
            // 部门树调入
            addDeptInTree() {
                this.deptInTreeDialogVisible = true
            },
            getDeptInTrees() {
                this.searchParam.deptTreeId = this.deptTreeId
                getDeptInTreeList(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.deptInTreeList = res.data.data.records
                        this.pagination.total = res.data.data.total
                        this.deptInTreeListLoading = false
                    } else {
                        this.$message({
                            showClose: true,
                            message: '获取数据出错',
                            type: 'error'
                        })
                    }
                })
            },
            // 点击部门树查询相应数据
            activeItem(item, index) {
                this.deptTreeId = item.deptTreeId
                this.curIndex = index
                this.getDeptInTrees()
                this.getInTreeList()
            },
            // 调出
            outDeptInTree() {
                const arr = this.$refs['deptInTreeTable'].selection
                if (!arr.length) {
                    this.$message({
                        showClose: true,
                        message: '请选择要调出的部门',
                        type: 'warning'
                    })
                    return
                }
                this.$confirm('确认调出部门?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteDeptInTree(arr).then(res => {
                        if (res && res.data.success) {
                            this.closeDialog(true, 'intree')
                            this.$message({
                                showClose: true,
                                message: '调出成功',
                                type: 'success'
                            })
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

            // 添加部门树
            addDept(title, id) {
                this.addDialog.addDialogTitle = title
                this.addDialog.curDeptId = id
                this.addDialog.showAddDialog = true
            },

            deleteDept() {
                const arr = this.$refs['deptTable'].selection
                if (!arr.length) {
                    this.$message({
                        showClose: true,
                        message: '请选择要删除的部门',
                        type: 'warning'
                    })
                    return
                }
                this.$confirm('确认删除部门?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteDept(arr).then(res => {
                        if (res && res.data.success) {
                            this.$message({
                                showClose: true,
                                message: '删除成功',
                                type: 'success'
                            })
                            this.forceUpdateTree()
                            this.getDepts()
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
            closeAddDialog(isFlush) {
                if (isFlush) {
                    this.forceUpdateTree()
                    this.getDepts()
                }
                this.addDialog.showAddDialog = false
            },
            // 获取调入的树数据
            getInTreeList() {
                getInTreeList({ treeId: this.deptTreeId }).then(res => {
                    if (res && res.data.success) {
                        this.inTreeList = res.data.data
                    } else {
                        this.$message({
                            showClose: true,
                            message: '获取部门树失败',
                            type: 'error'
                        })
                    }
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
  .deptMain {
    display: flex;
    height: calc(100vh - 50px);

    .leftSide {
      width: 18%;
      float: left;
      overflow: auto;
      position: relative;
      border: 1px solid #ebeef5;
      padding: 10px;
      border-radius: 5px;
      height: calc(100vh - 125px);
      top: 0;
      bottom: 0;

      ul {
        .left-item {
          padding-left: 5px;
        }

        .right-item {
          float: right;
          padding: 0 5px;
        }
      }
    }

    .li-item {
      display: block;
      line-height: 35px;
    }

    .rigthSide {
      width: 80%;
      float: left;
      overflow: auto;
      margin-left: 10px;

      .rigth_rigth_side {
        width: 18%;
        float: left;
        overflow: hidden;
        position: relative;
      }
    }

    .active {
      color: #409EFF;
    }
  }
</style>
