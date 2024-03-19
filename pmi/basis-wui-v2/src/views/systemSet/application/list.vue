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
                    新增
                </el-button>
            </div>
            <el-table
                ref="singleTable"
                :data="list"
                border
                fit
                height="75vh"
                highlight-current-row
                style="display:inline-block;"
            >
                <el-table-column align="center" fixed label="序号" width="50">
                    <template slot-scope="scope">
                        <span>{{ scope.$index+ 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="程序名称" prop="appName" width="150" />
                <el-table-column align="center" label="程序编码" prop="appCode" width="100" />
                <el-table-column align="center" label="站点名称" prop="appSite" width="300" />
                <el-table-column align="center" label="排序号" prop="orderNum" width="70" />
                <el-table-column align="center" label="ID" prop="appId" width="300" />
                <el-table-column align="center" label="备注" prop="remark" />
                <el-table-column align="center" label="" width="1" />
                <el-table-column
                    align="center"
                    fixed="right"
                    label="操作"
                    prop="createDate"
                    width="150"
                >
                    <template slot-scope="scope">
                        <el-button
                            v-waves
                            icon="el-icon-edit"
                            title="编辑"
                            type="primary"
                            v
                            @click="editItem(scope.row.appId)"
                        />
                        <el-button
                            v-waves
                            icon="el-icon-delete"
                            title="编辑"
                            type="danger"
                            v
                            @click="deleteItem(scope.row.appId)"
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
            :add-app-visible="addAppVisible"
            :dict-id="searchParam.dictId"
            :title="title"
            @closeAddApp="closeAddApp"
        />
        <edit
            v-if="editAppShow"
            :edit-id="editId"
            :edit-app-visible="editAppVisible"
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
        getAppList,
        deleteByAppId
    } from '@/api/systemSet/application/index'

    import { log } from 'util'

    export default {
        name: 'ApplicationList',
        components: {
            Pagination,
            add,
            edit
        },
        props: {},
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
                    pageSize: 15,
                    pageIndex: 1
                },
                editId: null,
                addShow: false,
                addAppVisible: false,
                editAppShow: false,
                editAppVisible: false,
                title: ''
            }
        },
        watch: {
            xxxxx: {
                immediate: true,
                handler(val) {}
            }
        },
        created() {
            this.getList()
        },
        methods: {
            // 列表
            getList() {
                getAppList(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.list = res.data.data.records
                        this.pagination.records = res.data.data.total
                    }
                })
            },
            // 新增类型
            addItem() {
                this.addShow = true
                this.addAppVisible = true
                this.title = '新增'
            },
            // 关闭新增
            closeAddApp(bool) {
                this.addAppVisible = false
                this.addShow = false
                if (bool) {
                    this.getList()
                }
            },
            // 编辑类型
            editItem(id) {
                this.editId = id
                this.editAppShow = true
                this.editAppVisible = true
            },
            deleteItem(id) {
                this.$confirm('此操作将删除此程序, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    deleteByAppId({ id: id }).then(res => {
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
                    .catch(() => {})
            },
            closeEditApp(bool) {
                this.editAppVisible = false
                this.editAppShow = false
                if (bool) {
                    this.getList()
                }
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
