<template>
    <div class="data-dictionary-container">
        <div class="left">
            <div class="tools-row">
                <el-button type="success" size="mini" plain icon="el-icon-plus" @click="handleTreeAdd">新建</el-button>
                <el-button :disabled="currentNodeType !== 1" type="primary" size="mini" plain icon="el-icon-edit" @click="handleTreeEdit">编辑</el-button>
                <el-button :disabled="currentNodeType !== 1" type="danger" size="mini" plain icon="el-icon-delete" @click="handleTreeDelete">删除</el-button>
            </div>
            <div class="tree-box">
                <el-tree
                    :loading="loading.leftTree"
                    :data="leftTree"
                    :props="{ label: 'name',children: 'children' }"
                    node-key="guidId"
                    highlight-current
                    default-expand-all
                    @current-change="handleTreeClick"
                />
            </div>
        </div>
        <div class="right">
            <div class="tools-row">
                <div class="active-node">
                    当前选择节点：
                    <span v-if="currentNode">{{ currentNode.name }}</span>
                    <span v-else>暂未选择</span>
                </div>
                <el-input
                    v-show="currentNodeType < 4"
                    v-model="rightSearchParam.name"
                    size="mini"
                    placeholder="标题"
                    style="width: 200px"
                    clearable
                    @input="handleSearchRight"
                />
                <el-button
                    v-show="currentNodeType < 4"
                    type="primary"
                    size="mini"
                    style="margin-left: 5px"
                    icon="el-icon-search"
                    @click="handleSearchRight"
                >
                    搜 索
                </el-button>
                <el-button
                    v-show="currentNodeType < 4"
                    type="success"
                    size="mini"
                    style="margin-left: 5px"
                    icon="el-icon-plus"
                    @click="handleCreate"
                >
                    新 建
                </el-button>
            </div>
            <TableComponent
                v-show="currentNodeType < 4"
                v-bind="rightTableData"
                :cur_row="cRight"
                :page-index.sync="rightSearchParam.pageIndex"
                :page-size.sync="rightSearchParam.pageSize"
                @refreshList="handleSearchRight"
            >
                <template slot="操作" slot-scope="scope">
                    <el-dropdown trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div class="layout-dropdown-item" @click="handleRightEdit(scope.row)">
                                <el-dropdown-item icon="el-icon-edit" divided>
                                    编辑
                                </el-dropdown-item>
                            </div>
                            <div class="layout-dropdown-item" @click="handleRightDelete(scope.row)">
                                <el-dropdown-item icon="el-icon-edit" divided>
                                    删除
                                </el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </div>
        <EditDialog
            v-if="editDialog.visible"
            :visible.sync="editDialog.visible"
            :data-id="editDialog.dataId"
            :is-edit="editDialog.isEdit"
            :type="editDialog.type"
            :extend-params="editDialog.extendParams"
            @confirm="handleConfirm"
        />
    </div>
</template>

<script>
    import mainApi from '@/api/systemSet/faultCodeConfig'
    import EditDialog from './EditDialog'
    export default {
        name: 'Index',
        components: {
            EditDialog
        },
        data() {
            return {
                // 加载中
                loading: {
                    leftTree: false
                },
                // 左边
                leftTree: [],
                currentNode: null,
                // 右边
                rightTableData: {
                    list: [],
                    total: 0,
                    options: {
                        height: '100%',
                        stripe: true,
                        loading: false,
                        curRowKey: 'guidId' // 高亮当前判断的 key
                    },
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: true
                    },
                    columns: [
                        {
                            label: '标题',
                            prop: 'name',
                            minWidth: 200
                        },
                        {
                            visible: false,
                            label: '故障代码',
                            prop: 'code',
                            width: 500
                        },
                        {
                            label: '备注',
                            prop: 'remark'
                        }
                    ]
                },
                cRight: null,
                rightSearchParam: {
                    pageIndex: 1,
                    pageSize: 20,
                    parentGuidId: null
                },
                // 编辑窗口
                editDialog: {
                    visible: false,
                    dataId: null,
                    isEdit: false,
                    extendParams: {},
                    type: 3
                }
            }
        },
        computed: {
            currentNodeType() {
                return this.currentNode && this.currentNode.type
            }
        },
        mounted() {
            this.getTree({}, false)
        },
        methods: {
            async getTree(params, findCurrentNode = false) {
                this.loading.leftTree = true
                const res = await mainApi.getTree(params)
                if (res.code === 200) {
                    this.leftTree = res.data
                    // 增删改时刷新左侧的树,并重新获取当前节点
                    if (findCurrentNode) {
                        this.getCurrentNodeInTree(this.currentNode.guidId, this.leftTree)
                    } else {
                        this.currentNode = this.leftTree[0] || null
                        if (this.currentNode) {
                            this.rightSearchParam.parentGuidId = this.currentNode.guidId
                            await this.getList()
                        }
                    }
                }
                this.loading.leftTree = false
            },
            async getList() {
                this.rightTableData.options.loading = true
                const res = await mainApi.getList(this.rightSearchParam)
                if (res.success) {
                    this.rightTableData.list = res.data.records
                    this.rightTableData.total = res.data.total
                }
                this.rightTableData.options.loading = false
            },
            handleFreshTree() {
                this.getTree({}, true)
            },
            handleSearchRight(obj) {
                if (typeof obj === 'object') {
                    this.rightSearchParam = Object.assign({}, this.rightSearchParam, obj)
                    this.getList()
                } else {
                    if (this.rightSearchParam.pageIndex !== 1) {
                        this.rightSearchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            handleCreate() {
                this.editDialog.dataId = null
                this.editDialog.visible = true
                this.editDialog.isEdit = true
                this.editDialog.type = this.currentNode.type + 1
                this.editDialog.extendParams = {
                    parentGuidId: this.currentNode.guidId,
                    type: this.currentNode.type + 1
                }
            },
            handleRightEdit(row) {
                this.editDialog.dataId = row.guidId
                this.editDialog.visible = true
                this.editDialog.isEdit = true
                this.editDialog.type = row.type
                this.editDialog.extendParams = {}
            },
            async handleRightDelete(row) {
                this.$confirm('是否确认删除 ' + row.name + ' ?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    mainApi.delete(row.guidId).then(res => {
                        if (res.success) {
                            this.handleFreshTree()
                            this.$message.success('已成功删除')
                        }
                    })
                }).catch(() => {})
            },
            handleTreeClick(row) {
                this.currentNode = row
                if (row.guidId) {
                    this.rightSearchParam.parentGuidId = row.guidId
                    this.getList()
                    const item = this.rightTableData.columns.find(v => v.prop === 'code')
                    if (row.type === 2) {
                        this.$set(item, 'visible', true)
                    } else this.$set(item, 'visible', false)
                }
            },
            handleTreeAdd() {
                this.editDialog.dataId = null
                this.editDialog.visible = true
                this.editDialog.extendParams = {
                    parentGuidId: null,
                    name: ''
                }
                this.editDialog.isEdit = true
                this.editDialog.type = 1
            },
            handleTreeEdit() {
                if (this.currentNode.type === 1) {
                    this.editDialog.dataId = this.currentNode.guidId
                    this.editDialog.visible = true
                    this.editDialog.extendParams = {}
                    this.editDialog.isEdit = true
                    this.editDialog.type = 1
                }
            },
            async handleTreeDelete() {
                if (this.currentNode.type === 1) {
                    this.$confirm('是否确认删除节点' + this.currentNode.name + '?', '警告', {
                        confirmButtonText: '删除',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        mainApi.delete(this.currentNode.guidId).then(res => {
                            if (res.success) {
                                this.handleFreshTree()
                                this.$message.success('已成功删除')
                            }
                        })
                    }).catch(() => {})
                }
            },
            handleConfirm() {
                if (this.currentNodeType === 1) {
                  this.handleFreshTree()
                } else {
                  this.getList()
                }
            },
            getCurrentNodeInTree(guidId, tree) {
                tree.map((item) => {
                    if (item.guidId === guidId) {
                        this.currentNode = item
                        if (this.currentNode) {
                            this.rightSearchParam.parentGuidId = this.currentNode.guidId
                            this.getList()
                        }
                        return true
                    } else {
                        if (item.children && item.children.length > 0) {
                            this.getCurrentNodeInTree(guidId, item.children)
                        }
                    }
                })
            }
        }
    }
</script>

<style scoped lang="scss">
  .data-dictionary-container {
    min-height: calc(100vh - 50px);
    width: 100%;
    display: flex;
    padding: 5px;
    background: #e9eef2;
    flex-direction: row;
    justify-content: flex-start;
    .left {
      width: 19%;
      height: calc(100vh - 80px);
      background-color: white;
      margin-right: 5px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      .tree-box {
        height: 100%;
        flex: 1;
        border: 1px solid #DCDFE6;
      }
    }
    .right {
      width: 80%;
      padding: 5px;
      height: calc(100vh - 80px);
      background-color: white;
      .active-node {
        min-width: 200px;
        font-size: 12px;
        color: #7f7f7f;
        margin-right: 5px;
        padding: 5px;
        border: 1px solid #DCDFE6;
      }
    }
    .tools-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 5px;
    }
  }
</style>

