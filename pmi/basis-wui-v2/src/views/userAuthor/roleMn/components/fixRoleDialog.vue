<!--
* @description 角色配置 
* @fileName fixRoleDialog.vue
* @author 叶金龙
* @date 2019/06/17 13:31:42
* @version V1.0.0
!-->
<template>
    <div class="dialog-container">
        <el-dialog
            title="角色权限配置"
            :visible.sync="fixRoleVisible"
            width="1200px"
            :before-close="beforeClose"
        >
            <el-tabs v-model="activeSys" @tab-click="handleClick">
                <el-tab-pane
                    v-for="(item,index) in sysTemList"
                    :key="index"
                    :label="item.appName"
                    :name="item.appId"
                >
                    <div class="authcontentBox" v-if="activeIndex==index">
                        <div class="leftBox">
                            <div class="box">
                                <side-bar-tree :treeData="treeData" @getNodeObj="getNodeObj"></side-bar-tree>
                            </div>
                        </div>
                        <div class="rightBox">
                            <div class="haveSelect">已选择（{{total}}）项</div>
                            <div class="filter-container">
                                <!-- <el-select
                                    class="filter-item"
                                    filterable
                                    clearable
                                    v-model="searchParam.privilegeTypeId"
                                    placeholder="权限类型"
                                    size="mini"
                                    style="width:200px"
                                >
                                    <el-option
                                        v-for="item in TypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    ></el-option>
                                </el-select>-->
                                <el-input
                                    v-model="searchParam.privilegeId"
                                    placeholder="权限ID"
                                    clearable
                                    class="filter-item"
                                    style="width:200px"
                                    size="mini"
                                ></el-input>
                                <el-input
                                    v-model="searchParam.privilegeName"
                                    placeholder="权限名称"
                                    clearable
                                    class="filter-item"
                                    style="width:200px"
                                    size="mini"
                                ></el-input>
                                <!-- 搜索 -->
                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="primary"
                                    icon="el-icon-search"
                                    @click="resetgetList()"
                                    size="mini"
                                    v-prereclick
                                >搜索</el-button>
                            </div>
                            <el-table
                                ref="singleTable"
                                :data="list"
                                border
                                fit
                                resizable
                                highlight-current-row
                                height="500px"
                                style="display:inline-block"
                                @select="handleSelectChange"
                                @select-all="handleSelectAllChange"
                            >
                                <!-- @row-click="handleCurrentChange" -->
                                <el-table-column fixed type="selection" width="55"></el-table-column>
                                <el-table-column fixed align="center" width="50" label="序号">
                                    <template slot-scope="scope">
                                        <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
                                    </template>
                                </el-table-column>
                                <!-- sortable="custom" -->
                                <el-table-column
                                    fixed
                                    align="center"
                                    label="权限ID"
                                    prop="privilegeId"
                                    width="260"
                                ></el-table-column>
                                <el-table-column
                                    align="center"
                                    label="权限名称"
                                    prop="privilegeName"
                                    width="200"
                                ></el-table-column>
                                <el-table-column
                                    align="center"
                                    label="权限类型"
                                    prop="privilegeTypeName"
                                ></el-table-column>
                                <el-table-column
                                    align="center"
                                    label="所属模块"
                                    prop="parentName"
                                    width="200"
                                ></el-table-column>
                                <el-table-column
                                    align="center"
                                    label="备注"
                                    prop="privilegeRemarks"
                                    width="100"
                                ></el-table-column>
                                <el-table-column align="center" label="操作" fixed="right">
                                    <template slot-scope="scope">
                                        <el-button
                                            type="primary"
                                            title="功能配置"
                                            icon="el-icon-setting"
                                            @click="fixFeature(scope.row.parentId,scope.row.privilegeName)"
                                            :disabled="!scope.row.checked"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <pagination
                                v-show="pagination.records>0"
                                :total="pagination.records"
                                :page.sync="searchParam.pageIndex"
                                :limit.sync="searchParam.pageSize"
                                @pagination="getList"
                            />
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <span slot="footer">
                <el-button @click="simpleClose" size="mini" v-waves>取 消</el-button>
                <el-button @click="reset" size="mini" type="warning" v-waves>重 置</el-button>
                <el-button
                    type="primary"
                    @click="submitFixRole"
                    size="mini"
                    v-waves
                    v-prereclick
                >确 定</el-button>
            </span>
        </el-dialog>
        <feature-dialog
            v-if="featureShow"
            :featureVisible="featureVisible"
            :searchFeatureObj="searchFeatureObj"
            :copyprivilegeArr="copyprivilegeArr"
            @closeFeature="closeFeature"
        ></feature-dialog>
    </div>
</template>

<script>
import waves from "@/directive/waves"; // Waves directive;
import prereclick from "@/directive/prereclick"; // prereclick directive;
import sideBarTree from "@/components/sideBarTree/sideBarTree";
import Pagination from "@/components/Pagination";
import featureDialog from "./featureDialog";
import { getPermissionTypes } from "@/api/resource";
import { getPermissionList } from "@/api/userAuthor/authorityMn/index";
import { deleteNullCity } from "@/utils";
import { getSysTem } from "@/api/resource";
export default {
    name: "fixRoleDialog",
    directives: { waves, prereclick },
    data() {
        return {
            pagination: {
                records: 0,
                pageIndex: 0,
                ageTotal: 0
            },
            sysTemList: [
                {
                    appId: "AA2E2C8F-787F-4B30-92A5-4239B485113D",
                    appName: "智慧清扫管理系统"
                },
                {
                    appId: "DB037170-BB2B-4732-993F-493746B0688C",
                    appName: "智慧环卫运维管理平台"
                },
                {
                    appId: "6FACA7CE-A5E5-4DC9-819D-8060FAE8B9FC",
                    appName: "顺一移动办公"
                }
            ],
            searchTree: {
                id: 0,
                appId: ""
            },
            activeSys: null,
            activeIndex: 0,
            searchParam: {
                appId: null,
                menuId: null,
                privilegeTypeId: 140001,
                privilegeId: null,
                privilegeName: null,
                pageSize: 15,
                pageIndex: 1,
                sortField: "",
                sortDirection: ""
            },
            list: [],
            // TypeList: [],
            treeData: [],
            // featureArr: [],
            // totalArr: [],
            // selectArr: [],
            copyprivilegeArr: [],
            searchFeatureObj: {},
            featureShow: false,
            featureVisible: false,
            actionRow: {}
        };
    },
    props: {
        fixRoleVisible: {
            type: Boolean,
            default: false
        },

        privilegeArr: {
            type: Array
        }
    },
    created() {
        this.bindData(this.sysTemList[0].appId);
    },
    watch: {
        privilegeArr: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val != null) {
                    this.copyprivilegeArr = val.concat();
                    // this.featureArr = this.copyprivilegeArr.concat();
                }
            }
        }
    },
    components: {
        Pagination,
        sideBarTree,
        featureDialog
    },
    methods: {
        // 重置搜索
        resetgetList() {
            this.searchParam.pageIndex = 1;
            this.getList();
        },
        // 获取点击的节点
        getNodeObj(obj) {
            this.searchParam.menuId = obj.value;
            this.getList();
        },
        // 数据绑定
        bindData(val) {
            this.refreshData(val);
        },
        // 获取级联树形数据
        getTree() {
            getSysTem(this.searchTree).then(res => {
                // deleteNullCity(res.data);
                this.treeData = res.data;
            });
        },
        // 刷新数据
        refreshData(val) {
            this.activeSys = val;
            this.searchParam.appId = val;
            this.searchTree.appId = val;
            this.searchParam.menuId = null;
            this.getList();
            this.getTree();
        },
        // 直接关闭
        simpleClose() {
            this.$emit("closeFixRoles", { arr: null, flag: false });
        },
        // 确认关闭
        beforeClose() {
            this.$confirm("确认放弃本次操作？")
                .then(_ => {
                    //done();  不能使用done 否则会直接操作模态框
                    this.$nextTick(() => {
                        this.$emit("closeFixRoles", { arr: null, flag: false });
                    });
                })
                .catch(_ => {
                    return false;
                });
        },
        // 重置
        reset() {
            this.$confirm("是否重置本页的更改？", "提示", {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
                .then(_ => {
                    //done();  不能使用done 否则会直接操作模态框
                    this.copyprivilegeArr = [];
                    this.list.forEach(row => {
                        row.checked = false;
                        this.$refs.singleTable[0].toggleRowSelection(
                            row,
                            false
                        );
                    });
                })
                .catch(_ => {
                    return false;
                });
        },
        // tabs切换校验
        handleClick(tab, event) {
            this.refreshData(tab._props.name);
            this.activeIndex = this.sysTemList.findIndex(x => {
                return x.appId == this.activeSys;
            });
        },

        // 获取权限列表
        getList() {
            getPermissionList(this.searchParam).then(res => {
                if (res.data.success) {
                    this.list = res.data.data.rows;
                    this.pagination.records = res.data.data.records;
                    this.list.forEach(i => {
                        this.$set(i, "checked", false);
                    });
                    this.copyprivilegeArr.forEach(a => {
                        let row = this.list.find(b => {
                            return a.id == b.id;
                        });
                        if (row != undefined) {
                            (function(row, self) {
                                self.$nextTick(() => {
                                    row.checked = true;
                                    self.$refs.singleTable[0].toggleRowSelection(
                                        row,
                                        true
                                    );
                                });
                            })(row, this);
                        }
                    });
                }
            });
        },

        //    单选
        handleSelectChange(selection, row) {
            row.checked = !row.checked;
            if (row.checked) {
                this.copyprivilegeArr.push({ id: row.id, parentPriId: 0 });
            } else {
                let arr = [].concat(this.copyprivilegeArr);
                arr.forEach((val, index) => {
                    let l = this.copyprivilegeArr.findIndex(x => {
                        row.checked = false;
                        return x.parentPriId == row.id || x.id == row.id;
                    });
                    if (l > -1) {
                        this.copyprivilegeArr.splice(l, 1);
                    }
                });
            }
        },
        // 全选
        handleSelectAllChange(selection) {
            this.list.forEach(x => {
                let index = this.copyprivilegeArr.findIndex(y => {
                    return y.id == x.id;
                });
                if (index > -1) {
                    x.checked = false;
                    this.copyprivilegeArr.splice(index, 1);
                }
            });
            selection.forEach(x => {
                this.handleSelectChange(selection, x);
            });
        },
        // 功能配置
        fixFeature(menuId, name) {
            this.featureShow = true;
            this.featureVisible = true;
            this.searchFeatureObj = {
                menuId,
                appId: this.searchTree.appId,
                actionName: name
            };
        },

        // 关闭功能配置
        closeFeature(model) {
            this.featureVisible = false;
            this.featureShow = false;
            if (model != null) {
                this.copyprivilegeArr = model.feature;
            }
        },

        //提交角色配置
        submitFixRole() {
            this.$emit("closeFixRoles", {
                arr: this.copyprivilegeArr,
                flag: true
            });
        }
    },
    computed: {
        total() {
            return this.copyprivilegeArr.length;
        }
    }
};
</script>

<style lang='scss'>
.authcontentBox {
    height: 650px;
    width: 100%;
    .leftBox {
        float: left;
        width: 20%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        .box {
            border: 1px solid #ccc;
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            position: absolute;
            height: calc(100vh- 170px);
            top: 0px;
            bottom: 0px;
            overflow-y: scroll;
        }
    }
    .rightBox {
        float: left;
        overflow: hidden;
        width: 79%;
        margin-left: 1%;
        .haveSelect {
            height: 30px;
            line-height: 30px;
            border-bottom: 1px dashed #ccc;
        }
        .filter-container {
            margin-top: 10px;
        }
    }
}
</style>
