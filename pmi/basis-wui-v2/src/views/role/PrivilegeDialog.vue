<template>
    <div class="dialog-container">
        <el-dialog
            :title="title"
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
                                <AppSideBarTree
                                    v-if="activeSys == '0'"
                                    ref="appTree"
                                    :id="appId"
                                    @updateAppId="updateAppId"/>
                                <SideBarTree
                                    v-if="activeSys == '1'"
                                    ref="tree"
                                    :id="deptId"
                                    @updateDeptId="updateDeptId"/>
                            </div>
                        </div>
                        <div class="rightBox">
<!--                            <div class="haveSelect">已选择（{{total}}）项</div>-->
                            <div class="Mentitle" style="margin-bottom: 2px;">

                                <el-input
                                    v-if="activeSys == '0'"
                                    v-model="searchParam.privilegeName"
                                    placeholder="权限名称"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                ></el-input>
                                <el-input
                                    v-if="activeSys == '0'"
                                    v-model="searchParam.privilegeCode"
                                    placeholder="权限编码"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                ></el-input>

                                <el-input
                                    v-if="activeSys == '1'"
                                    placeholder="用户名"
                                    v-model="searchParam.userName"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                ></el-input>
                                <el-input
                                    v-if="activeSys == '1'"
                                    placeholder="登录名"
                                    v-model="searchParam.loginName"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                ></el-input>
                                <el-select
                                    v-if="activeSys == '1'"
                                    v-model="searchParam.userType"
                                    placeholder="请选择用户类型"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                >
                                    <el-option
                                        v-for="item in userTypeEnum"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                    </el-option>
                                </el-select>

                                <el-checkbox v-if="activeSys == '1'" v-model="searchParam.checkedSubDept">包含子部门</el-checkbox>

                                <!-- 搜索 -->
                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="primary"
                                    icon="el-icon-search"
                                    size="mini"
                                    v-prereclick
                                    @click="filterHandler"
                                >搜索
                                </el-button>

                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="success"
                                    icon="el-icon-circle-plus-outline"
                                    size="mini"
                                    @click="callIn()"
                                >调入
                                </el-button>
                                <!-- 调出 -->
                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="danger"
                                    icon="el-icon-circle-close"
                                    size="mini"
                                    @click="reCall()"
                                >调出
                                </el-button>
                            </div>

                            <div class="filter-container">
                                <!-- 列表 -->
                                <TableComponent :list="list"
                                                :total="total"
                                                v-bind:pageSize.sync="pageSize"
                                                v-bind:pageIndex.sync="pageIndex"
                                                :options="options"
                                                :columns="columns"
                                                :operates="operates"
                                                :selectedList="selectList"
                                                @handleSelectionChange="handleSelectionChange"
                                />
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <span slot="footer">
                <el-button @click="simpleClose" size="mini" v-waves>取 消</el-button>
                <!--                <el-button @click="reset" size="mini" type="warning" v-waves>重 置</el-button>-->
                <el-button type="primary" @click="submitFixRole" size="mini" v-waves v-prereclick>确 定</el-button>
            </span>
        </el-dialog>

        <SelectUser
            v-if="showSelectUser"
            :userVisible="userVisible"
            :role="role"
            @closeUser="closeUser"
            @queryUserList="queryUserList"
        >

        </SelectUser>

        <SelectPrivilege
            v-if="showSelectPrivilege"
            :privilegeVisible="privilegeVisible"
            :role="role"
            @closePrivilege="closePrivilege"
            @queryPrivilegeList="queryPrivilegeList"
        >

        </SelectPrivilege>
    </div>
</template>

<script>
    import waves from "@/directive/waves";
    import prereclick from "@/directive/prereclick";
    import SideBarTree from "./components/SideBarTree";
    import AppSideBarTree from "./components/AppSideBarTree";
    import TableComponent from "@/components/TableComponent";
    import SelectUser from "./SelectUser";
    import SelectPrivilege from "./SelectPrivilege";
    import {getCallInUserList, getCallInPrivilegeList, reCallUser, reCallPrivilege} from "@/api/role";
    import {userTypeEnum} from '@/utils/enum'

    export default {
        name: "fixRoleDialog",
        directives: {waves, prereclick},
        components: {
            SideBarTree,
            AppSideBarTree,
            TableComponent,
            SelectUser,
            SelectPrivilege
        },
        data() {
            return {
                showSelectUser: false,
                userVisible: false,
                showSelectPrivilege: false,
                privilegeVisible: false,
                appId: '',
                list: [],
                total: 0, // table数据总条数
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                    height: 500,
                    mutiSelect: true, // 开启选择
                    mutiSelectedKey: 'roleId', // 根据 对应key 找出应被选中的状态
                    curRowKey: 'roleId'
                },
                selectList: [],
                columns: [
                    {
                        prop: 'name',
                        label: '名称',
                        width: 110
                    },
                    {
                        prop: 'code',
                        label: '编码',
                        width: 100,
                    }, {
                        prop: 'appName',
                        label: '所属程序',
                        width: 100,
                    },
                    {
                        prop: 'orderNum',
                        label: '排序',
                        width: 100,
                    }, {
                        prop: 'remark',
                        label: '备注',
                        minWidth: 200,
                    },
                ],
                // 列操作按钮
                operates: {},
                sysTemList: [
                    {
                        appId: "0",
                        appName: "权限配置"
                    },
                    {
                        appId: "1",
                        appName: "人员配置"
                    },
                ],
                activeSys: "0",
                activeIndex: 0,
                searchParam: {
                    checkedSubDept: true
                },
                userTypeEnum,
                featureShow: false,
                featureVisible: false,
                title: '配置'
            };
        },
        props: {
            role: {
                type: Object,
                default: {}
            },
            fixRoleVisible: {
                type: Boolean,
                default: false
            },
            deptId: {
                type: String,
                default: ''
            }

        },
      watch: {
        pageIndex(newData, oldDate) {
          // 人员搜索
          if (this.activeSys === "1") {
            this.queryUserList();
          }

          // 权限搜索
          if (this.activeSys === "0") {
            this.queryPrivilegeList();
          }
        },
        pageSize(newData, oldDate) {
          // 人员搜索
          if (this.activeSys === "1") {
            this.queryUserList();
          }

          // 权限搜索
          if (this.activeSys === "0") {
            this.queryPrivilegeList();
          }
        }
      },
        created() {
            this.title = this.role.deptName + '(' + this.role.roleName + ')' + "人员、权限配置";
            this.searchParam.roleId = this.role.roleId;
            this.queryPrivilegeList();
        },
        mounted() {
            this.nextAppTickWrap();
        },
        methods: {
            // 点击部门过滤
            updateDeptId(value) {
                this.deptId = value;
                this.queryUserList();
            },
            // 调入
            callIn() {
                // 权限
                if (this.activeSys === '0') {
                    this.showSelectUser = false;
                    this.userVisible = false;
                    this.showSelectPrivilege = true;
                    this.privilegeVisible = true;
                }
                // 人员
                if (this.activeSys === '1') {
                    this.showSelectUser = true;
                    this.userVisible = true;
                    this.showSelectPrivilege = false;
                    this.privilegeVisible = false;
                }

            },
            // 调出
            reCall() {
                let _this = this;
                // 人员
                if (this.activeSys === '1') {

                    if (this.selectList.length == 0) {
                        this.$message.error("请选择需要调出的人员!")
                    } else {
                        this.$confirm("此操作将调出所选人员, 是否继续?", "提示", {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            type: "warning",
                            center: true
                        }).then(() => {

                            reCallUser(_this.selectList).then(res => {
                                const {success, msg} = res.data;
                                if (success) {
                                    this.$message({
                                        type: "success",
                                        message: "调出成功!"
                                    });
                                    this.selectList = [];
                                    // 刷新
                                    this.queryUserList();
                                } else {
                                    this.$message.error(msg);
                                }
                            });

                        }).catch(() => {
                        });
                    }
                }
                // 权限
                if (this.activeSys === '0') {
                    if (this.selectList.length == 0) {
                        this.$message.error("请选择需要调出的权限!")
                    } else {
                        this.$confirm("此操作将调出所选权限, 是否继续?", "提示", {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            type: "warning",
                            center: true
                        }).then(() => {
                            reCallPrivilege(_this.selectList).then(res => {
                                const {success, msg} = res.data;
                                if (success) {
                                    this.$message({
                                        type: "success",
                                        message: "调出成功!"
                                    });
                                    this.selectList = [];
                                    // 刷新
                                    this.queryPrivilegeList();
                                } else {
                                    this.$message.error(msg);
                                }
                            });

                        }).catch(() => {
                        });
                    }
                }
            },
            // 选择
            handleSelectionChange(val) {
                this.selectList = val;
            },
            updateAppId(value) {
                this.appId = value.id;
                this.queryPrivilegeList();
            },
            // 关闭调入人员窗
            closeUser() {
                this.showSelectUser = false;
                this.userVisible = false;
            },
            // 关闭调入权限窗
            closePrivilege() {
                this.showSelectPrivilege = false;
                this.privilegeVisible = false;
            },
            // 直接关闭
            simpleClose() {
                this.$emit("closeFixRoles", {arr: null, flag: false});
            },
            // 确认关闭
            beforeClose() {
                this.$confirm("确认放弃本次操作？")
                    .then(_ => {
                        //done();  不能使用done 否则会直接操作模态框
                        this.$nextTick(() => {
                            this.$emit("closeFixRoles", {arr: null, flag: false});
                        });
                    })
                    .catch(_ => {
                        return false;
                    });
            },
            // tabs切换校验
            handleClick(tab, event) {
                let _this = this;
                this.activeIndex = this.sysTemList.findIndex(x => {
                    return x.appId == this.activeSys;
                });
                if (this.activeSys == "1") {
                    this.nextTickWrap();
                    this.columns = [
                        {
                            prop: 'userName',
                            label: '用户名',
                            width: 110
                        },
                        {
                            prop: 'loginName',
                            label: '登录名',
                            width: 100,
                        }, {
                            prop: 'userType',
                            label: '人员类型',
                            width: 100,
                            formatter: function (row, column) {
                                let text = '';
                                let res = _this.userTypeEnum.find(({value}) => {
                                    return value === row.userType;
                                }) || {};
                                text = res.label;
                                return text || '';
                            }
                        }, {
                            prop: 'deptName',
                            label: '所属部门',
                            width: 100,
                        },
                        {
                            prop: 'orderNum',
                            label: '排序',
                            width: 100,
                        }, {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200,
                        }
                    ];
                    this.queryUserList();
                }
                if (this.activeSys == "0") {
                    this.nextAppTickWrap();
                    this.columns = [
                        {
                            prop: 'name',
                            label: '名称',
                            width: 110
                        },
                        {
                            prop: 'code',
                            label: '编码',
                            width: 100,
                        }, {
                            prop: 'appName',
                            label: '所属程序',
                            width: 100,
                        },
                        {
                            prop: 'orderNum',
                            label: '排序',
                            width: 100,
                        }, {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200,
                        },
                    ];
                    this.queryPrivilegeList();
                }
            },
            nextAppTickWrap() {
                this.$nextTick(() => {
                    this.forceUpdateAppTree()
                })
            },
            nextTickWrap() {
                this.$nextTick(() => {
                    this.forceUpdateTree()
                })
            },
            async forceUpdateAppTree() {
                let treeData = await this.$refs.appTree[0].getTree();
                //this.treeData = treeData;
                if (typeof this.appId !== 'undefined') {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.appTree &&
                    this.$refs.appTree.setCurrentKey &&
                    this.$refs.appTree.setCurrentKey(this.appId)
                }
            },
            async forceUpdateTree() {
               let treeData = await this.$refs.tree[0].getTree();
                this.treeData = treeData;
                if (typeof this.deptId !== 'undefined') {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.tree &&
                    this.$refs.tree.setCurrentKey &&
                    this.$refs.tree.setCurrentKey(this.deptId)
                }
            },
            // 获取已经调入人员的权限
            queryUserList() {
                const _this = this,
                    {
                        pageSize,
                        pageIndex,
                        options,
                        searchParam,
                        deptId,
                        roleId
                    } = this;
                // if (typeof deptId === 'undefined') return;
                options.loading = true;
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    deptId, // 部门节点
                    ...searchParam
                };
                getCallInUserList(params).then(res => {
                    let data = null;
                    if (res.data.success) {
                        data = res.data.data.records;
                    } else {
                        return this.$message.error('获取用户信息失败！');
                    }
                    _this.options.loading = false; // 更改加载中的 loading值
                    _this.list = data || [];
                    _this.total = res.data.data.total;// data.records;

                });
            },
            // 搜索
            filterHandler() {
                this.pageIndex = 1;
                // 人员搜索
                if (this.activeSys === "1") {
                    this.queryUserList();
                }

                // 权限搜索
                if (this.activeSys === "0") {
                    this.queryPrivilegeList();
                }
            },
            // 获取已经调入角色的权限
            queryPrivilegeList() {
                const _this = this,
                    {
                        pageSize,
                        pageIndex,
                        options,
                        searchParam,
                        appId,
                        roleId
                    } = this;
                // if (typeof deptId === 'undefined') return;
                options.loading = true;
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    appId, // 部门节点
                    ...searchParam
                };
                getCallInPrivilegeList(params).then(res => {
                    let data = null;
                    if (res.data.success) {
                        data = res.data.data.records;
                    } else {
                        return this.$message.error('获取权限信息失败！');
                    }
                    _this.options.loading = false; // 更改加载中的 loading值
                    _this.list = data || [];
                    _this.total = res.data.data.total;// data.records;

                });
            },

            //提交角色配置
            submitFixRole() {
                this.$emit("closeFixRoles", {arr: null, flag: false});
            }
        },
        computed: {}
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
