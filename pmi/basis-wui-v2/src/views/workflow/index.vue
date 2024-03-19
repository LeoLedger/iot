<template>
    <div class="app-container menuMaintance">
        <div class="rigthSide">
            <div class="filter-container">
                <el-input
                    v-model="searchParam.name"
                    class="filter-item"
                    clearable
                    placeholder="名称"
                    size="mini"
                    style="width:200px"
                />
                <!-- 搜索 -->
                <el-button
                    class="filter-item"
                    icon="el-icon-search"
                    size="mini"
                    type="primary"
                    @click="getList()"
                >
                    搜索
                </el-button>
                <!-- 新增 -->
                <el-button
                    class="filter-item"
                    icon="el-icon-plus"
                    size="mini"
                    type="success"
                    @click="addItem()"
                >
                    新建流程
                </el-button>
                <el-button
                    class="filter-item"
                    icon="el-icon-folder-opened"
                    size="mini"
                    type="success"
                    @click="exportWorkflow"
                >
                    导出流程
                </el-button>
                <el-upload
                    ref="upload"
                    class="upload-demo"
                    :action="upLoadWorkflowUrl"
                    :show-file-list="false"
                    :headers="headers"
                    :on-success="importWorkflow"
                    style="width: 120px;display: inline-block"
                >
                    <el-button slot="trigger" size="mini" type="primary">
                        导入流程
                    </el-button>
                </el-upload>
            </div>
            <el-table
                ref="singleTable"
                :data="list"
                border
                fit
                height="75vh"
                highlight-current-row
                style="display:inline-block;"
                @select="selectRow"
            >
                <el-table-column
                    type="selection"
                    width="55"
                />
                <el-table-column align="center" fixed label="序号" width="50">
                    <template slot-scope="scope">
                        <span>{{ scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="流程名称" prop="name" />
                <el-table-column align="center" label="Code" prop="code" />
                <el-table-column align="center" label="流程定义ID" prop="identifier" />
                <el-table-column align="center" label="版本" prop="version" />
                <el-table-column
                    align="center"
                    label="操作"
                    prop="createDate"
                    width="150"
                >
                    <template slot-scope="scope">
                        <el-button
                            icon="el-icon-edit"
                            title="编辑"
                            type="primary"
                            @click="editItem(scope.row.workflowId)"
                        />
                        <el-button
                            icon="el-icon-delete"
                            title="删除"
                            type="danger"
                            @click="deleteItem(scope.row.identifier)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <pagination
                v-show="pagination.records>0"
                :limit.sync="searchParam.pageSize"
                :page.sync="searchParam.pageIndex"
                :total="pagination.records"
                @pagination="getList"
            />
        </div>

        <add
            v-if="addShow"
            :id="searchParam.id"
            :add-visible="addVisible"
            :title="title"
            @closeAddApp="closeAddApp"
        />
        <edit
            v-if="editShow"
            :work-flow-id="workFlowId"
            :edit-visible="editVisible"
            :title="title"
            @closeEditApp="closeEditApp"
        />
    </div>
</template>

<script>
    import Pagination from '@/components/Pagination'
    import add from './add'
    import edit from './edit'
    import {
        getWorkFlowList,
        deleteWorkFlow,
        exportWorkFlow
    } from '@/api/workflow/index'

    export default {
        name: 'Index',
        components: {
            Pagination,
            add,
            edit
        },
        data() {
            return {
                pagination: {
                    records: 0,
                    pageIndex: 0,
                    total: 0
                },
                list: [],
                searchParam: {
                    name: '',
                    pageSize: 10,
                    pageIndex: 0
                },
                workFlowId: '',
                addShow: false,
                addVisible: false,
                editShow: false,
                editVisible: false,
                title: '',
                selectWorkflow: null,
                upLoadWorkflowUrl: `${process.env.VUE_APP_BASE_API}/workFlow/importWorkFlow`,
                headers: null
            }
        },
        created() {
            this.headers = {
                token: this.$store.getters.token
            }
            this.getList()
        },
        methods: {
            // 列表
            getList() {
                getWorkFlowList(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.list = res.data.data
                        this.pagination.records = res.data.data.length || 0
                    }
                })
            },
            // 新增类型
            addItem() {
                this.addShow = true
                this.addVisible = true
                this.title = '新增'
            },
            deleteItem(id) {
                this.$confirm('此操作将删除此流程, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    deleteWorkFlow({ identifier: id }).then(res => {
                        if (res.data.success) {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            })
                            this.getList()
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                })
                    .catch(() => {
                    })
            },
            // 关闭新增
            closeAddApp(bool) {
                this.addVisible = false
                this.addShow = false
                if (bool) {
                    this.getList()
                }
            },
            // 编辑类型
            editItem(id) {
                this.workFlowId = id
                this.editShow = true
                this.editVisible = true
            },
            closeEditApp(bool) {
                this.editVisible = false
                this.editShow = false
                if (bool) {
                    this.getList()
                }
            },
            selectRow(selection) {
                if (selection && selection.length > 0) {
                    this.selectWorkflow = selection[0]
                }
            },
            exportWorkflow() {
                if (this.selectWorkflow) {
                    exportWorkFlow({ workflowId: this.selectWorkflow.workflowId }).then(res => {
                        const blob = new Blob([res.data], { type: 'application/txt;charset=utf-8' })
                        const href = window.URL.createObjectURL(blob) // 创建下载的链接
                        const downloadElement = document.createElement('a')
                        downloadElement.href = href
                        downloadElement.download = decodeURI(this.selectWorkflow.name + '.json')
                        document.body.appendChild(downloadElement)
                        downloadElement.click() // 点击下载
                        document.body.removeChild(downloadElement) // 下载完成移除元素
                        window.URL.revokeObjectURL(href) // 释放掉blob对象
                        // eslint-disable-next-line handle-callback-err
                    }).catch(err => {
                        this.$message({
                            message: '下载失败！',
                            type: 'error',
                            showClose: true
                        })
                    })
                } else {
                    this.$alert('请选择要导出的流程!')
                }
            },
            importWorkflow() {
                this.$message.success('导入成功!')
                this.getList()
            }

        }
    }
</script>

<style lang='scss' scoped>
.menuMaintance {
  display: flex;
  height: calc(100vh - 50px);

  .leftSide {
    width: 18%;
    float: left;
    overflow: hidden;
    position: relative;

    .box {
      border: 1px solid #ccc;
      width: 100%;
      padding: 10px;
      border-radius: 5px;
      position: absolute;
      // height: calc(100vh - 170px);
      top: 0px;
      bottom: 0px;

      .linebox {
        height: 0;
        width: 100%;
        border: 1px solid #ececec;
        margin-top: 10px;
      }

      .treeSection {
        height: calc(100vh - 145px);
        overflow-y: scroll;
      }
    }
  }

  .rigthSide {
    width: 100%;
    float: left;
    overflow: auto;
    margin-left: 1.5%;
  }
}
</style>
