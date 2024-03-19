<template>
    <div class="app-container classMaintance">
        <div class="leftSide">
            <div class="box">
                <div>
                    <el-tabs
                        v-if="activeName == 'first'"
                        v-model="activeName"
                        stretch
                        @tab-click="handleClick"
                    >
                        <el-tab-pane label="所有类型" name="first">
                            <el-button
                                class="filter-item"
                                icon="el-icon-s-grid"
                                size="mini"
                                type="success"
                                @click="allItem()"
                            >
                                所有类型
                            </el-button>
                            <div class="linebox" style="border: none;" />
                            <el-input v-model="filterValue" placeholder="请输入关键字" size="mini">
                                <template slot="append">
                                    <el-button
                                        class="filter-item"
                                        type="primary"
                                        icon="el-icon-search"
                                        size="mini"
                                        @click="treeSearch"
                                    />
                                </template>
                            </el-input>
                            <div class="linebox" />
                            <div class="treeSection">
                                <sideBarTree
                                    ref="classTree"
                                    :tree-data="classTreeData"
                                    @getNodeObj="getNodeObj"
                                />
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="类别树管理" name="second">
                            <el-button
                                class="filter-item"
                                icon="el-icon-plus"
                                size="mini"
                                type="success"
                                @click="addCtdClick()"
                            >
                                新增
                            </el-button>
                            <div class="linebox" style="border: none;" />
                            <ul>
                                <li v-for="item in ctdList" class="liItem">
                                    <a @click="ctdClick(item.classTreeId)">{{ item.name }}</a>
                                    <a
                                        style="padding-right: 20px;float: right;"
                                        @click="ctdEditClick(item.classTreeId)"
                                    >编辑</a>
                                </li>
                            </ul>
                        </el-tab-pane>
                    </el-tabs>
                    <el-tabs
                        v-if="activeName == 'second'"
                        v-model="activeName"
                        stretch
                        @tab-click="handleClick"
                    >
                        <el-tab-pane label="所有类型" name="first">
                            <el-button
                                class="filter-item"
                                icon="el-icon-s-grid"
                                size="mini"
                                type="success"
                                @click="allItem()"
                            >
                                所有类型
                            </el-button>
                            <div class="linebox" style="border: none;" />
                            <el-input v-model="filterValue" placeholder="请输入关键字" size="mini">
                                <template slot="append">
                                    <el-button
                                        class="filter-item"
                                        type="primary"
                                        icon="el-icon-search"
                                        size="mini"
                                        @click="treeSearch"
                                    />
                                </template>
                            </el-input>
                            <div class="linebox" />
                            <div class="treeSection">
                                <sideBarTree
                                    ref="classTree"
                                    :tree-data="classTreeData"
                                    @getNodeObj="getNodeObj"
                                />
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="类别树管理" name="second">
                            <el-button
                                class="filter-item"
                                icon="el-icon-plus"
                                size="mini"
                                type="success"
                                @click="addCtdClick()"
                            >
                                新增
                            </el-button>
                            <div class="linebox" style="border: none;" />
                            <ul>
                                <li v-for="item in ctdList" class="liItem">
                                    <el-link type="primary" :underline="false" @click="ctdClick(item.classTreeId)">
                                        {{
                                            item.name }}
                                    </el-link>
                                    <el-link
                                        style="padding-right: 20px;float: right;"
                                        :underline="false"
                                        type="primary"
                                        @click="ctdEditClick(item.classTreeId)"
                                    >
                                        编辑
                                    </el-link>
                                </li>
                            </ul>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
        <div class="rigthSide">
            <div v-if="activeName == 'first'" class="filter-container">
                <el-input
                    v-model="searchParam.name"
                    class="filter-item"
                    clearable
                    placeholder="名称"
                    size="mini"
                    style="width:200px"
                />
                <el-input
                    v-model="searchParam.code"
                    class="filter-item"
                    clearable
                    placeholder="编码"
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
            <div v-if="activeName == 'second'" style="padding-bottom: 0px;" class="filter-container">
                <el-input
                    v-model="treeParam.name"
                    class="filter-item"
                    clearable
                    placeholder="名称"
                    size="mini"
                    style="width:200px"
                />
                <el-input
                    v-model="treeParam.code"
                    class="filter-item"
                    clearable
                    placeholder="编码"
                    size="mini"
                    style="width:200px"
                />
                <el-select v-model="treeParam.type" size="mini" placeholder="请选择类别">
                    <el-option
                        v-for="item in typeData"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-button
                    class="filter-item"
                    icon="el-icon-search"
                    size="mini"
                    type="primary"
                    @click="classPageList()"
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
                <el-button
                    class="filter-item"
                    icon="el-icon-plus"
                    size="mini"
                    type="success"
                    @click="addAIT()"
                >
                    调入
                </el-button>
                <el-button
                    class="filter-item"
                    icon="el-icon-minus"
                    size="mini"
                    type="danger"
                    @click="delCT()"
                >
                    调出
                </el-button>
            </div>
            <div>
                <div
                    v-if="activeName == 'first'"
                    class="rigth_left_side"
                    :style="{width:activeName == 'first' ? '100%' : ''}"
                >
                    <el-table
                        ref="singleTable"
                        :data="list"
                        border
                        fit
                        height="70vh"
                        highlight-current-row
                        style="display:inline-block;"
                    >
                        <el-table-column align="center" fixed label="序号" width="70">
                            <template slot-scope="scope">
                                <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" fixed label="名称" width="260">
                            <template slot-scope="scope">
                                {{ scope.row.name }}
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="编码" prop="code" width="150" />
                        <el-table-column align="center" label="描述" prop="remark" width="150" />
                        <el-table-column align="center" label="类型" prop="type" width="150">
                            <template slot-scope="scope">
                                {{ scope.row.type == 14001 ? "类别" : (scope.row.type == 14002 ? "大类" : "小类" ) }}
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="排序" width="80">
                            <template slot-scope="scope">
                                {{ scope.row.orderNum }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            fixed="right"
                            label="操作"
                            prop="createDate"
                            width="185"
                        >
                            <template slot-scope="scope">
                                <el-button
                                    icon="el-icon-edit"
                                    title="编辑"
                                    type="primary"
                                    @click="editItem(scope.row.classId)"
                                />
                                <el-button
                                    size="mini"
                                    title="删除"
                                    type="danger"
                                    icon="el-icon-delete"
                                    @click="deleteItem(scope.row.classId)"
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
                <div v-if="activeName == 'second'" class="rigth_left_side">
                    <el-table
                        ref="ctTable"
                        :data="ctList"
                        border
                        fit
                        height="70.5vh"
                        highlight-current-row
                    >
                        <el-table-column align="center" type="selection" width="108" prop="multiSelect" />
                        <el-table-column align="center" fixed label="序号" width="108">
                            <template slot-scope="scope">
                                <span>{{ scope.$index+(treeParam.pageIndex-1) *treeParam.pageSize + 1 }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" fixed label="类别" prop="name" width="280" />
                        <el-table-column align="center" label="父类别" prop="pname" width="150" />
                        <el-table-column align="center" label="Code" prop="remark" width="150" />
                    </el-table>
                    <pagination
                        v-show="tpPagination.records>0"
                        :limit.sync="treeParam.pageSize"
                        :page.sync="treeParam.pageIndex"
                        :total="tpPagination.records"
                        @pagination="classPageList"
                    />
                </div>
                <div v-if="activeName == 'second'" class="rigth_rigth_side">
                    <div class="treeSection">
                        <sideBarTree ref="citTree" :tree-data="citTreeData" :default-expand-all="true" />
                    </div>
                </div>
            </div>
        </div>
        <add
            v-if="addClassVisible"
            :add-class-visible="addClassVisible"
            :parent-id="choParId"
            @closeAddClass="closeAddClass"
        />
        <edit
            v-if="editClassVisible"
            :edit-class-visible="editClassVisible"
            :class-id="searchParam.classId"
            :edit-id="editId"
            @closeEditClass="closeEditClass"
        />
        <ctdAddEditDialog
            v-if="addCtdVisible"
            :visible="addCtdVisible"
            :title="'修改自定义树'"
            @closeCtd="closeAddCtd"
        />
        <editCtd
            v-if="editCtdVisible"
            :edit-ctd-visible="editCtdVisible"
            :edit-ctd-id="editCtdId"
            @closeEditCtd="closeEditCtd"
        />
        <addInTree
            v-if="addInTreeVisible"
            :add-in-tree-visible="addInTreeVisible"
            :tree-id="treeId"
            @closeAddInTree="closeAIT"
        />
    </div>
</template>
<script>
    import pagination from '@/components/Pagination'
    import sideBarTree from '@/components/sideBarTree/sideBarTree'
    import add from './add'
    import edit from './edit'
    import addCtd from './addCtd'
    import editCtd from './editCtd'
    import addInTree from './addInTree'

    import ctdAddEditDialog from './components/ctdAddEditDialog'
    import {
        getClassList,
        deleteClass,
        getClassTree,
        getCtdList,
        classPageList,
        getInTreeList,
        delCT
    } from '@/api/systemSet/class/index'

    export default {
        name: 'ClassList',
        components: {
            sideBarTree,
            pagination,
            add,
            edit,
            addCtd,
            editCtd,
            addInTree,
            ctdAddEditDialog
        },
        props: {},
        data() {
            return {
                typeData: [
                    {
                        value: '14001',
                        label: '类别'
                    }, {
                        value: '14002',
                        label: '大类'
                    }, {
                        value: '14003',
                        label: '小类'
                    }],
                activeName: 'first',
                ctdList: [],
                ctList: [],
                filterValue: '',
                classTreeData: [],
                citTreeData: [],
                pagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
                delClaParam: {
                    classList: [],
                    treeId: this.treeId
                },
                treeId: '',
                list: [],
                searchParam: {
                    name: null,
                    code: null,
                    type: null,
                    parentId: null,
                    pageSize: 15,
                    pageIndex: 1
                },
                treeParam: {
                    name: '',
                    code: '',
                    type: '',
                    treeId: '',
                    parentId: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                tpPagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
                tsParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                editCtdId: '',
                editId: '',
                addClassVisible: false,
                addInTreeVisible: false,
                editClassVisible: false,
                addCtdVisible: false,
                editCtdVisible: false,
                title: '',
                choParId: ''
            }
        },
        watch: {
            xxxxx: {
                immediate: true,
                handler(val) {
                }
            }
        },
        created() {
            this.getList()
            this.getTree()
        },
        methods: {
            handleClick(obj) {
                if (obj.paneName == 'first') {
                    this.getList()
                    this.getTree()
                    this.treeId = ''
                    this.delClaParam.treeId = ''
                } else {
                    this.getCtdList()
                    this.classPageList()
                    this.getCitTree()
                }
            },
            ctdClick(classTreeId) {
                this.treeId = classTreeId
                this.delClaParam.treeId = classTreeId
                this.treeParam.treeId = classTreeId
                this.classPageList()
                this.getCitTree()
            },
            classPageList() {
                classPageList(this.treeParam).then(res => {
                    this.ctList = res.data.data.records
                    this.tpPagination.records = res.data.data.total
                })
            },
            // 编辑自定义树
            ctdEditClick(classTreeId) {
                this.editCtdId = classTreeId
                this.editCtdVisible = true
            },
            // 关闭自定义树编辑类型
            closeEditCtd(isRefresh) {
                this.editCtdVisible = false
                if (isRefresh) {
                    this.getCtdList()
                    this.getCitTree()
                }
            },
            // 调入
            addAIT() {
                if (this.treeId != '') {
                    this.addInTreeVisible = true
                } else {
                    this.$message({
                        showClose: true,
                        message: '请选择类别树',
                        type: 'success'
                    })
                }
            },
            // 关闭调入
            closeAIT(isRefresh) {
                this.addInTreeVisible = false
                if (isRefresh) {
                    this.classPageList()
                    this.getCitTree()
                }
            },
            allItem() {
                this.searchParam.parentId = ''
                this.getList()
            },
            // 关闭新增
            closeAddCtd(isRefresh) {
                this.addCtdVisible = false
                if (isRefresh) {
                    this.getCtdList()
                }
            },
            // 获取类型自定义树
            getCtdList() {
                getCtdList().then(res => {
                    this.ctdList = res.data.data
                })
            },
            // 右边自定义树
            getCitTree() {
                getInTreeList({ treeId: this.treeId }).then(res => {
                    this.citTreeData = res.data.data
                })
            },
            // 获取级联树形数据
            getTree() {
                getClassTree().then(res => {
                    this.classTreeData = res.data.data
                })
            },
            // 获取点击的节点
            getNodeObj(obj) {
                this.searchParam.parentId = obj.id
                this.choParId = obj.id
                this.getList()
            },
            // 树查询
            treeSearch() {
                this.$refs.classTree.$refs.attrList.filter(this.filterValue)
            },
            // 列表
            getList() {
                getClassList(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.list = res.data.data.records
                        this.pagination.records = res.data.data.total
                    }
                })
            },
            // 新增类型
            addItem() {
                this.addClassVisible = true
            },
            // 关闭新增
            closeAddClass(isRefresh) {
                this.addClassVisible = false
                if (isRefresh) {
                    this.getList()
                    this.getTree()
                }
            },
            addCtdClick() {
                this.addCtdVisible = true
            },
            // 编辑类型
            editItem(ctdId) {
                this.editId = ctdId
                this.editClassVisible = true
            },
            // 关闭类型编辑
            closeEditClass(isRefresh) {
                this.editClassVisible = false
                if (isRefresh) {
                    this.getList()
                    this.getTree()
                }
            },
            deleteItem(classId) {
                this.$confirm('此操作将删除此记录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    deleteClass({ classId }).then(res => {
                        const { success, message } = res.data
                        if (success) {
                            this.$notify({
                                title: '成功',
                                message: '操作成功',
                                type: 'success',
                                duration: 2000
                            })
                            this.getList()
                        } else {
                            this.$notify({
                                title: '失败',
                                message: '数据验证失败',
                                type: 'warning',
                                duration: 2000
                            })
                        }
                    })
                }).catch(() => {
                })
            },
            delCT() {
                const arr = this.$refs['ctTable'].selection
                if (this.treeId == '') {
                    this.$message({
                        showClose: true,
                        message: '请选择类别树',
                        type: 'success'
                    })
                    return
                }
                if (!arr.length) {
                    this.$message({
                        showClose: true,
                        message: '请选择要调出的类型',
                        type: 'warning'
                    })
                    return
                }
                this.$confirm('确认调出类型?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.delClaParam.classList = arr
                    delCT(this.delClaParam).then(res => {
                        if (res && res.data.success) {
                            this.$message({
                                showClose: true,
                                message: '调出成功',
                                type: 'success'
                            })
                            this.handleClick({ paneName: 'second' })
                        } else {
                            this.$message({
                                showClose: true,
                                message: '错误：' + res.data.msg,
                                type: 'error'
                            })
                        }
                    })
                })
            }
        }
    }
</script>

<style lang='scss'>
    .rigth_left_side {
        width: 74%;
        float: left;
        overflow: hidden;
        position: relative;
    }

    .rigth_rigth_side {
        width: 25%;
        float: left;
        overflow: hidden;
        position: relative;
    }

    .liItem {
        border-top: 1px solid #dedede;
        border-bottom: 1px solid #e8f1fb;
        background: #EBEEF5;
        display: block;
        height: 30px;
        line-height: 30px;
    }

    .liItem a {
        height: 30px;
        line-height: 30px;
        padding: 0 0 0 20px;
        font-size: 12px;
        color: #0C7ACC;
    }

    .classMaintance {
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
                    height: auto;
                    overflow: auto;
                }
            }
        }
        .rigthSide {
            width: 80%;
            float: left;
            overflow: auto;
            margin-left: 1.5%;
        }
    }
</style>
