<template>
    <div class="app-container MapMaintance">
        <div class="leftSide">
            <div class="box">
                <el-tabs v-model="activeName">
                    <el-tab-pane label="默认区域" name="first">
                        <el-input placeholder="请输入关键字" v-model="filterValue" size="mini">
                            <template slot="append">
                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="primary"
                                    icon="el-icon-search"
                                    @click="treeSearch"
                                    size="mini"
                                />
                            </template>
                        </el-input>
                        <div class="linebox"></div>
                        <div class="treeSection">
                            <side-bar-tree :treeData="treeData" ref="mapTree" @getNodeObj="getNodeObj"></side-bar-tree>
                            <!-- :refreshFlag="refreshFlag" -->
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="区域树管理" name="second">
                        <div class="filter-container">
                            <el-input placeholder="名称" clearable style="width:200px" size="mini"
                                      v-model="tree_SearchParam.mapTreeName"/>
                            <br/> <br/>
                            <!-- 搜索 -->
                            <el-button
                                @click="resetgetListTree()"
                                class="filter-item"
                                icon="el-icon-search"
                                size="mini"
                                type="primary"
                                v-prereclick
                                v-waves
                            >搜索
                            </el-button>
                            <!-- 新增 -->
                            <el-button
                                @click="addTreeItem()"
                                class="filter-item"
                                icon="el-icon-plus"
                                size="mini"
                                type="success"
                                v-waves
                            >新增
                            </el-button>
                        </div>
                        <el-table
                            :data="tree_list"
                            border
                            fit
                            height="60vh"
                            highlight-current-row
                            ref="singleTableTree"
                            stripe
                            style="display:inline-block;">
                            <el-table-column
                                label="名称">
                                <template slot-scope="scope">
                                    <el-link type="primary" @click="mapTreeNameClick(scope.row.mapTreeId)">{{
                                        scope.row.name }}
                                    </el-link>
                                </template>
                            </el-table-column>


                            <el-table-column
                                align="center"
                                label="操作"
                                prop="createDate"
                                width="120">
                                <template slot-scope="scope">
                                    <el-button
                                        @click="editTreeItem(scope.row.mapTreeId)"
                                        icon="el-icon-edit"
                                        title="编辑"
                                        type="primary"
                                        v-waves
                                    ></el-button>
                                    <el-button
                                        @click="deleTreeItem(scope.row.mapTreeId)"
                                        icon="el-icon-delete"
                                        title="删除"
                                        type="danger"
                                        v-waves
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <pagination
                            :limit.sync="tree_SearchParam.pageSize"
                            :page.sync="tree_SearchParam.pageIndex"
                            :total="tree_pagination.records"
                            @pagination="getTreeList"
                            v-show="tree_pagination.records>0"/>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
        <div class="rigthSide" v-if="activeName==firstActiveName">
            <div class="filter-container">
                <el-input placeholder="名称" clearable style="width:180px" size="mini"
                          v-model="searchParam.mapName"/>
                <el-input placeholder="编码" clearable style="width:180px" size="mini"
                          v-model="searchParam.mapCode"/>
                <el-select placeholder="类型" size="mini" value="" v-model="searchParam.mapType">
                    <el-option label="请选择" value=""></el-option>
                    <el-option v-for="item in mapTypeData" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <!-- 搜索 -->
                <el-button
                    @click="resetgetList()"
                    class="filter-item"
                    icon="el-icon-search"
                    size="mini"
                    type="primary"
                    v-prereclick
                    v-waves
                >搜索
                </el-button>
                <!-- 新增 -->
                <el-button
                    @click="addItem()"
                    class="filter-item"
                    icon="el-icon-plus"
                    size="mini"
                    type="success"
                    v-waves
                >新增
                </el-button>
            </div>
            <el-table
                :data="list"
                border
                fit
                height="72vh"
                highlight-current-row
                ref="singleMapTable"
                stripe
                style="display:inline-block;"
            >
                <el-table-column align="center" fixed label="序号" width="50">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="名称" width="100" prop="name"></el-table-column>
                <el-table-column align="center" label="编码" prop="code"></el-table-column>
                <el-table-column align="center" label="类型" prop="mapType" :formatter="formatMapType"></el-table-column>
                <el-table-column align="center" label="排序" prop="orderNum"></el-table-column>
                <el-table-column align="center" label="描述" prop="remark"></el-table-column>
                <el-table-column
                    align="center"
                    label="操作"
                    prop="createDate"
                    width="120"
                >
                    <template slot-scope="scope">
                        <el-button
                            @click="editItem(scope.row.mapId)"
                            icon="el-icon-edit"
                            title="编辑"
                            type="primary"
                            v-waves
                        ></el-button>
                        <el-button
                            @click="deleItem(scope.row.mapId)"
                            icon="el-icon-delete"
                            title="删除"
                            type="danger"
                            v-waves
                        ></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <pagination
                :limit.sync="searchParam.pageSize"
                :page.sync="searchParam.pageIndex"
                :total="pagination.records"
                @pagination="getList"
                v-show="pagination.records>0"
            />
        </div>
        <div class="rigthSide" v-if="activeName==secondActiveName&curMapTreeId!=null">

            <div class="filter-container">
                <el-input placeholder="名称" clearable style="width:180px" size="mini"
                          v-model="in_Tree_SearchParam.mapName"/>
                <el-input placeholder="编码" clearable style="width:180px" size="mini"
                          v-model="in_Tree_SearchParam.mapCode"/>
                <el-select placeholder="类型" size="mini" value="" v-model="in_Tree_SearchParam.mapType">
                    <el-option label="请选择" value=""></el-option>
                    <el-option v-for="item in mapTypeData" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <!-- 搜索 -->
                <el-button
                    @click="resetgetListInTree()"
                    class="filter-item"
                    icon="el-icon-search"
                    size="mini"
                    type="primary"
                    v-prereclick
                    v-waves
                >搜索
                </el-button>
                <!-- 新增 -->
                <el-button
                    @click="addItem()"
                    class="filter-item"
                    icon="el-icon-plus"
                    size="mini"
                    type="success"
                    v-waves
                >新增
                </el-button>

                <!-- 调入 -->
                <el-button
                    @click="callInTree()"
                    class="filter-item"
                    icon="el-icon-circle-plus-outline"
                    size="mini"
                    type="success"
                    v-waves
                >调入
                </el-button>
                <!-- 调出 -->
                <el-button
                    @click="callOutTree()"
                    class="filter-item"
                    icon="el-icon-circle-close"
                    size="mini"
                    type="danger"
                    v-waves
                >调出
                </el-button>

            </div>
            <div class="leftSideSub">

                <el-table
                    :data="inTreeList"
                    border
                    fit
                    height="69vh"
                    highlight-current-row
                    ref="inTreeTable"
                    stripe
                    style="display:inline-block;"
                >
                    <el-table-column align="center" type="selection" width="55" prop="multiSelect"/>
                    <el-table-column align="center" fixed label="序号" width="50">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(in_Tree_SearchParam.pageIndex-1) *in_Tree_SearchParam.pageSize + 1}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="区域" prop="name"></el-table-column>
                    <el-table-column align="center" label="父区域" prop="inParentName"></el-table-column>
                    <el-table-column align="center" label="编码" prop="code"></el-table-column>

                    <!--                        <el-table-column-->
                    <!--                            align="center"-->
                    <!--                            label="操作"-->
                    <!--                            prop="createDate"-->
                    <!--                            width="120"-->
                    <!--                        >-->
                    <!--                            <template slot-scope="scope">-->
                    <!--                                <el-button-->
                    <!--                                    @click="editInTree(scope.row.mapInTreeId)"-->
                    <!--                                    icon="el-icon-edit"-->
                    <!--                                    title="编辑"-->
                    <!--                                    type="primary"-->
                    <!--                                    v-waves-->
                    <!--                                ></el-button>-->
                    <!--                            </template>-->
                    <!--                        </el-table-column>-->
                </el-table>
                <pagination
                    :limit.sync="in_Tree_SearchParam.pageSize"
                    :page.sync="in_Tree_SearchParam.pageIndex"
                    :total="intree_pagination.records"
                    @pagination="getinTreeList"
                    v-show="intree_pagination.records>0"
                />
            </div>
            <div class="rigthSideSub">
                <div class="treeSection">
                    <side-bar-tree :treeData="inMapTreeData" :defaultExpandAll="true" ref="mapTree2"></side-bar-tree>
                    <!-- :refreshFlag="refreshFlag" -->
                </div>
            </div>


        </div>


        <add
            :addMapsVisible="addMapsVisible"
            :parentId="searchParam.parentId"
            :str="str"
            :treeData="treeData"
            @closeAddMaps="closeAddMaps"
            v-if="addMapsShow"
        ></add>
        <edit
            :parentId="searchParam.parentId"
            :editId="editId"
            :editMapsVisible="editMapsVisible"
            :getbuttonObj="getbuttonObj"
            :str="str"
            :treeData="treeData"
            @closeEditMaps="closeEditMaps"
            v-if="editMapsShow"
        ></edit>
        <treeAdd
            :addMapTreeVisible="addMapTreeVisible"
            :str="str"
            @closeAddMapTree="closeAddMapTree"
            v-if="addMapTreeShow"
        ></treeAdd>
        <treeEdit
            :editTreeId="editTreeId"
            :editMapTreeVisible="editMapTreeVisible"
            :str="str"
            @closeEditMapTree="closeEditMapTree"
            v-if="editMapTreeShow"
        ></treeEdit>
        <inTreeAdd
            :addInMapTreeVisible="addInMapTreeVisible"
            :str="str"
            :treeId="in_Tree_SearchParam.treeId"
            :treeData="treeData"
            :inMapTreeData="inMapTreeData"
            @closeCallInMapTree="closeCallInMapTree"
            v-if="addInMapTreeShow"
        ></inTreeAdd>
    </div>
</template>
<script>
    import waves from "@/directive/waves"; // Waves directive;
    import prereclick from "@/directive/prereclick"; // prereclick directive;
    import Pagination from "@/components/Pagination";
    import sideBarTree from "@/components/sideBarTree/sideBarTree";
    import add from "./add";
    import edit from "./edit";
    import treeAdd from "./treeAdd";
    import treeEdit from "./treeEdit";
    import inTreeAdd from "./inTreeAdd";
    import {
        getMapListSearch,
        deleMap,
        getMapTree,
        getMapTreeDefineList,
        getInMapList,
        deleteMapTree,
        callOutMapInTree,
        getMapTreeById

    } from "@/api/map/index";


    export default {
        name: "MapList",
        directives: {waves, prereclick},
        data() {

            return {
                pagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
                tree_pagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
                intree_pagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
                list: [],
                searchParam: {
                    parentId: null,
                    mapName: null,
                    mapCode: null,
                    mapType: null,
                    pageSize: 15,
                    pageIndex: 1,
                    sortField: "",
                    sortDirection: ""
                },
                tree_list: [],
                tree_SearchParam: {
                    mapTreeName: null,
                    pageSize: 15,
                    pageIndex: 1,
                },
                inTreeList: [],
                in_Tree_SearchParam: {
                    treeId: null,
                    mapName: null,
                    mapCode: null,
                    mapType: null,
                    pageSize: 15,
                    pageIndex: 1,
                },
                searchTree: {
                    treeId: ""
                },
                sysTemList: [],
                refreshFlag: 0,
                MapList: [],
                treeData: [],
                inMapTreeData: [],
                getbuttonObj: {},
                str: "",
                filterValue: '',
                editId: null,
                addMapsShow: false,
                addMapsVisible: false,
                editMapsShow: false,
                editMapsVisible: false,
                mapTypeData: this.$store.getters.mapType,
                activeName: "first",
                firstActiveName: "first",
                secondActiveName: "second",
                editTreeId: null,
                editInTreeId: null,
                addMapTreeShow: false,
                addMapTreeVisible: false,
                editMapTreeShow: false,
                editMapTreeVisible: false,
                addInMapTreeShow: false,
                addInMapTreeVisible: false,
                curMapTreeId: null
            };
        },
        props: {},
        created() {
            this.getList();
            this.getTree();
            this.getTreeList();
        },
        watch: {
            xxxxx: {
                immediate: true,
                handler(val) {
                }
            }
        },
        components: {
            Pagination,
            add,
            edit,
            sideBarTree,
            treeAdd,
            treeEdit,
            inTreeAdd
        },
        methods: {
            // 搜索
            resetgetList() {
                this.searchParam.pageIndex = 1;
                this.getList();
            },
            resetgetListTree() {
                this.tree_SearchParam.pageIndex = 1;
                this.getTreeList();
            },
            resetgetListInTree() {
                this.in_Tree_SearchParam.pageIndex = 1;
                this.bingInTreesome();
            },
            // 获取点击的节点
            getNodeObj(obj) {
                this.searchParam.parentId = obj.id;
                this.getList();
            },
            mapTreeNameClick(id) {
                this.in_Tree_SearchParam.treeId = id;
                this.curMapTreeId = id;
                this.bingInTreesome();
            },
            //绑定区域在树里的相关
            bingInTreesome() {
                this.getinTreeList();
                this.getTreeById();
            },
            // 数据绑定
            bindData(val) {
                this.refreshData(val);
            },
            // 刷新数据
            refreshData(val) {
                this.searchParam.parentId = val;
                this.searchTree.parentId = val;
                this.getList();
                this.getTree();

            },
            // 列表
            getList() {
                getMapListSearch(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.list = res.data.data.records;
                        this.pagination.records = res.data.data.total;
                    }
                });
            },
            // 树列表
            getTreeList() {
                getMapTreeDefineList(this.tree_SearchParam).then(res => {
                    if (res.data.success) {
                        this.tree_list = res.data.data.records;
                        this.tree_pagination.records = res.data.data.total;
                    }
                });
            },
            getinTreeList() {
                getInMapList(this.in_Tree_SearchParam).then(res => {
                    if (res.data.success) {
                        this.inTreeList = res.data.data.records;
                        this.intree_pagination.records = res.data.data.total;
                    }
                });
            },
            formatMapType(row, column) {
                let text = '';
                let res = this.mapTypeData.find(({value}) => {
                    return value === row.mapType;
                }) || {};
                text = res.label;
                return text || '';
            },
            // 获取级联树形数据
            getTree() {
                getMapTree(this.searchTree).then(res => {
                    this.treeData = res.data.data;
                    // console.log(this.treeData);
                });
            },
            //根據樹Id獲取樹
            getTreeById() {
                getMapTreeById({treeId: this.in_Tree_SearchParam.treeId}).then(res => {
                    this.inMapTreeData = res.data.data;
                    // console.log(this.treeData);
                });
            },
            //树查询
            treeSearch() {
                this.$refs.mapTree.$refs.attrList.filter(this.filterValue);
            },

            // 新增区域
            addItem() {
                this.addMapsShow = true;
                this.addMapsVisible = true;
                this.str = "新增";
            },
            // 关闭新增
            closeAddMaps(bool) {
                this.addMapsVisible = false;
                this.addMapsShow = false;
                if (bool) {
                    this.searchParam.parentId = null;
                    this.refreshData(this.searchTree.parentId);
                }
            },
            // 编辑区域
            editItem(id) {
                this.editId = id;
                this.editMapsShow = true;
                this.editMapsVisible = true;
                this.str = "编辑";
                this.getbuttonObj = {mapId: id, mapPid: this.searchTree.parentId};

            },
            // 关闭编辑区域
            closeEditMaps(bool) {
                this.editMapsVisible = false;
                this.editMapsShow = false;
                if (bool) {
                    this.searchParam.parentId = null;
                    this.getTree();
                    this.getList();
                }
            },
            // 删除区域
            deleItem(id) {
                this.$confirm("此操作将删除此区域, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true
                })
                    .then(() => {
                        deleMap({id: id}).then(res => {
                            if (res.data.success) {
                                this.$message({
                                    type: "success",
                                    message: "删除成功!"
                                });
                                this.searchParam.parentId = null;
                                this.getList();
                                this.getTree();
                            } else {
                                this.$message.error(res.data.message);
                            }
                        });
                    })
                    .catch(() => {
                    });
            },

            // 新增区域树
            addTreeItem() {
                this.addMapTreeShow = true;
                this.addMapTreeVisible = true;
                this.str = "新增";
            },
            // 关闭新增区域树
            closeAddMapTree(bool) {
                this.addMapTreeShow = false;
                this.addMapTreeVisible = false;
                if (bool) {
                    this.getTreeList();
                }
            },
            // 编辑区域
            editTreeItem(id) {
                this.editTreeId = id;
                this.editMapTreeShow = true;
                this.editMapTreeVisible = true;
                this.str = "编辑";
            },
            // 关闭编辑区域
            closeEditMapTree(bool) {
                this.editMapTreeShow = false;
                this.editMapTreeVisible = false;
                if (bool) {
                    this.editTreeId = null;
                    this.getTreeList();
                }
            },
            // 删除区域
            deleTreeItem(id) {
                this.$confirm("此操作将删除此区域树, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true
                })
                    .then(() => {
                        deleteMapTree({id: id}).then(res => {
                            if (res.data.success) {
                                this.$message({
                                    type: "success",
                                    message: "删除成功!"
                                });
                                this.getTreeList();
                            } else {
                                this.$message.error(res.data.message);
                            }
                        });
                    })
                    .catch(() => {
                    });
            },
            // 关闭调入区域在树里
            closeCallInMapTree(bool) {
                this.addInMapTreeShow = false;
                this.addInMapTreeVisible = false;
                if (bool) {
                    this.bingInTreesome();
                }
            },
            // 调入区域树
            callInTree() {
                this.addInMapTreeShow = true;
                this.addInMapTreeVisible = true;
                this.str = "调入";
            },
            //调出树
            callOutTree() {
                let list = this.$refs['inTreeTable'].selection;
                if (list.length > 0) {
                    this.$confirm("此操作将调出所选区域, 是否继续?", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                        center: true
                    }).then(() => {
                        callOutMapInTree(list).then(res => {
                            const {success, msg} = res.data;
                            if (success) {
                                this.$message({
                                    type: "success",
                                    message: "调出成功!"
                                });
                                this.bingInTreesome();

                            } else {
                                this.$message.error(msg);
                            }
                        });

                    }).catch(() => {
                    });
                } else {
                    this.$message.error('请选择要删除的数据!');
                }
            },
            //编辑树
            editInTree() {

            }

        }
    };
</script>

<style lang='scss'>
    .MapMaintance {
        display: flex;
        height: calc(100vh - 50px);

        .leftSide {
            width: 20%;
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
            width: 80%;
            float: left;
            overflow: auto;
            margin-left: 1.5%;

            .leftSideSub {
                width: 80%;
                float: left;
                overflow: auto;
                margin-left: 1.5%;
            }

            .rigthSideSub {
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
        }
    }
</style>
