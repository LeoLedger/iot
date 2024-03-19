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
                    <div v-if="activeIndex==index" class="authcontentBox">
                        <div class="leftBox">
                            <div class="box">
                                <AppSideBarTree
                                    v-if="activeSys == '1' || activeSys == '3' "
                                    :id="appId"
                                    ref="appTree"
                                    @updateAppId="updateAppId"
                                />
                                <SideBarTree
                                    v-if="activeSys == '2' || activeSys == '0' "
                                    :id="deptId"
                                    ref="tree"
                                    @updateDeptId="updateDeptId"
                                />
                            </div>
                        </div>
                        <div class="rightBox">
                            <!--                            <div class="haveSelect">已选择（{{total}}）项</div>-->
                            <div class="Mentitle" style="margin-bottom: 2px;">
                                <el-input
                                    v-if="activeSys == '1'"
                                    v-model="searchParam.privilegeName"
                                    placeholder="权限名称"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                />
                                <el-input
                                    v-if="activeSys == '1'"
                                    v-model="searchParam.privilegeCode"
                                    placeholder="权限编码"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                />

                                <el-input
                                    v-if="activeSys == '0'"
                                    v-model="searchParam.roleName"
                                    placeholder="角色名称"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                />

                                <el-select
                                    v-if="activeSys == '0'"
                                    v-model="searchParam.roleType"
                                    placeholder="请选择角色类型"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                >
                                    <el-option
                                        v-for="item in roleTypeEnum"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>

                                <el-input
                                    v-if="activeSys == '2'"
                                    v-model="searchParam.deptName"
                                    placeholder="部门名称"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                />
                                <el-input
                                    v-if="activeSys == '2'"
                                    v-model="searchParam.deptCode"
                                    placeholder="部门编码"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                />
                                <el-select
                                    v-if="activeSys == '2'"
                                    v-model="searchParam.deptType"
                                    placeholder="请选择部门类型"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                >
                                    <el-option
                                        v-for="item in deptTypeEnum"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>

                                <el-checkbox
                                    v-if="activeSys == '0' || activeSys == '2' "
                                    v-model="searchParam.checkedSubDept"
                                >
                                    包含子部门
                                </el-checkbox>

                                <el-input
                                    v-if="activeSys == '3'"
                                    v-model="searchParam.industryName"
                                    placeholder="行业名称"
                                    clearable
                                    class="filter-item"
                                    style="width:150px"
                                    size="mini"
                                />

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

                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="success"
                                    icon="el-icon-circle-plus-outline"
                                    size="mini"
                                    @click="callIn()"
                                >
                                    调入
                                </el-button>
                                <!-- 调出 -->
                                <el-button
                                    v-waves
                                    class="filter-item"
                                    type="danger"
                                    icon="el-icon-circle-close"
                                    size="mini"
                                    @click="reCall()"
                                >
                                    调出
                                </el-button>
                            </div>

                            <div class="filter-container">
                                <!-- 列表 -->
                                <TableComponent
                                    :list="list"
                                    :total="total"
                                    :page-size.sync="pageSize"
                                    :page-index.sync="pageIndex"
                                    :options="options"
                                    :columns="columns"
                                    :operates="operates"
                                    :selected-list="selectList"
                                    @handleSelectionChange="handleSelectionChange"
                                />
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <span slot="footer">
                <el-button v-waves size="mini" @click="simpleClose">取 消</el-button>
                <el-button v-waves v-prereclick type="primary" size="mini" @click="submitFixRole">确 定</el-button>
            </span>
        </el-dialog>

        <SelectRole
            v-if="showSelectRole"
            :role-visible="roleVisible"
            :user="user"
            @closeRole="closeRole"
            @queryRoleList="queryRoleList"
        />

        <SelectPrivilege
            v-if="showSelectPrivilege"
            :privilege-visible="privilegeVisible"
            :user="user"
            @closePrivilege="closePrivilege"
            @queryPrivilegeList="queryPrivilegeList"
        />

        <SelectDept
            v-if="showSelectDept"
            :dept-visible="deptVisible"
            :user="user"
            @closeDept="closeDept"
            @queryDeptList="queryDeptList"
        />

        <SelectIndustry
            v-if="showSelectIndustry"
            :industry-visible="industryVisible"
            :user="user"
            @closeIndustry="closeIndustry"
            @queryIndustryList="queryIndustryList"
        />
    </div>
</template>

<script>
    import waves from '@/directive/waves'
    import prereclick from '@/directive/prereclick'
    import SideBarTree from '@/views/role/components/SideBarTree'
    import AppSideBarTree from '@/views/role/components/AppSideBarTree'
    import TableComponent from '@/components/TableComponent'
    import SelectRole from './SelectRole'
    import SelectPrivilege from './SelectPrivilege'
    import SelectDept from './SelectDept'
    import SelectIndustry from './SelectIndustry'
    import { roleTypeEnum, deptTypeEnum, roleStatusEnum } from '@/utils/enum'
    import {
        getUserCallInRoleList,
        reCallRole,
        getUserCallInPrivilegeList,
        reCallPrivilege,
        getUserCallInDeptList,
        reCallDept,
        getIndustryList,
        reCallIndustry
    } from '@/api/user/index'

    export default {
        name: 'FixRoleDialog',
        directives: { waves, prereclick },
        components: {
            SideBarTree,
            AppSideBarTree,
            TableComponent,
            SelectRole,
            SelectPrivilege,
            SelectDept,
            SelectIndustry
        },
        props: {
            user: {
                type: Object,
                default: {}
            },
            fixRoleVisible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            const _this = this
            return {
                showSelectRole: false,
                roleVisible: false,
                showSelectPrivilege: false,
                privilegeVisible: false,
                showSelectDept: false,
                deptVisible: false,
                showSelectIndustry: false,
                industryVisible: false,
                appId: '',
                deptId: '',
                list: [],
                total: 0, // table数据总条数
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                options: {
                    loading: false, // 是否添加表格loading加载动画
                    height: 500,
                    mutiSelect: true, // 开启选择
                    mutiSelectedKey: 'roleId', // 根据 对应key 找出应被选中的状态
                    curRowKey: 'roleId'
                },
                selectList: [],
                columns: [
                    {
                        prop: 'roleName',
                        label: '名称',
                        width: 110
                    },
                    {
                        prop: 'roleCode',
                        label: '编号',
                        width: 100
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
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        minWidth: 100
                    }
                ],

                // 列操作按钮
                operates: {},
                sysTemList: [
                    {
                        appId: '0',
                        appName: '角色配置'
                    },
                    // {
                    //     appId: '1',
                    //     appName: '权限配置'
                    // },
                    {
                        appId: '2',
                        appName: '部门配置'
                    },
                    {
                        appId: '3',
                        appName: '行业配置'
                    }
                ],
                activeSys: '0',
                activeIndex: 0,
                searchParam: {
                    checkedSubDept: true,
                    objType: 1, // 人
                    isCall: 1
                },
                roleTypeEnum,
                deptTypeEnum,
                roleStatusEnum,
                featureShow: false,
                featureVisible: false,
                title: '配置'
            }
        },
        computed: {},
        watch: {
            pageIndex(newData, oldDate) {
                // 角色搜索
                if (this.activeSys === '0') {
                    this.queryRoleList()
                }
                // 权限搜索
                if (this.activeSys === '1') {
                    this.queryPrivilegeList()
                }
                // 部门搜索
                if (this.activeSys === '2') {
                    this.queryDeptList()
                }
                // 行业搜索
                if (this.activeSys === '3') {
                    this.queryIndustryList()
                }
            },
            pageSize(newData, oldDate) {
                // 角色搜索
                if (this.activeSys === '0') {
                    this.queryRoleList()
                }
                // 权限搜索
                if (this.activeSys === '1') {
                    this.queryPrivilegeList()
                }
                // 部门搜索
                if (this.activeSys === '2') {
                    this.queryDeptList()
                }
                // 行业搜索
                if (this.activeSys === '3') {
                    this.queryIndustryList()
                }
            }
        },
        created() {
            this.title = this.user.deptName + '(' + this.user.userName + ')' + '角色、权限、部门、行业配置'
            this.searchParam.objId = this.user.userId
            this.searchParam.userId = this.user.userId
            this.queryRoleList()
        },
        mounted() {
            this.nextTickWrap()
        },
        methods: {
            closeDept() {
                this.showSelectDept = false
                this.deptVisible = false
            },
            queryDeptList() {
                const _this = this
                const {
                    pageSize,
                    pageIndex,
                    options,
                    searchParam,
                    deptId,
                    userId
                } = this
                options.loading = true
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    deptId, // 部门节点
                    ...searchParam
                }
                getUserCallInDeptList(params).then(res => {
                    let data = null
                    if (res.data.success) {
                        data = res.data.data.records
                    } else {
                        return this.$message.error('获取权限信息失败！')
                    }
                    _this.options.loading = false // 更改加载中的 loading值
                    _this.list = data || []
                    _this.total = res.data.data.total// data.records;
                })
            },
            closeRole() {
                this.showSelectRole = false
                this.roleVisible = false
            },
            updateDeptId(value) {
                this.deptId = value
                // 角色
                if (this.activeSys === '0') {
                    this.queryRoleList()
                }
                // 部门
                if (this.activeSys === '2') {
                    this.queryDeptList()
                }
            },
            // 调入
            callIn() {
                // 角色配置
                if (this.activeSys === '0') {
                    this.showSelectRole = true
                    this.roleVisible = true
                }
                // 权限配置
                if (this.activeSys === '1') {
                    this.showSelectPrivilege = true
                    this.privilegeVisible = true
                }

                // 部门配置
                if (this.activeSys === '2') {
                    this.showSelectDept = true
                    this.deptVisible = true
                }

                // 行业配置
                if (this.activeSys === '3') {
                    this.showSelectIndustry = true
                    this.industryVisible = true
                }
            },
            // 调出
            reCall() {
                const _this = this
                // 角色
                if (this.activeSys === '0') {
                    if (this.selectList.length == 0) {
                        this.$message.error('请选择需要调出的角色!')
                    } else {
                        this.$confirm('此操作将调出所选角色, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            reCallRole(_this.selectList).then(res => {
                                const { success, msg } = res.data
                                if (success) {
                                    this.$message({
                                        type: 'success',
                                        message: '调出成功!'
                                    })
                                    this.selectList = []
                                    // 刷新
                                    this.queryRoleList()
                                } else {
                                    this.$message.error(msg)
                                }
                            })
                        }).catch(() => {
                        })
                    }
                }
                // 权限
                if (this.activeSys === '1') {
                    if (this.selectList.length == 0) {
                        this.$message.error('请选择需要调出的权限!')
                    } else {
                        this.$confirm('此操作将调出所选权限, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            reCallPrivilege(_this.selectList).then(res => {
                                const { success, msg } = res.data
                                if (success) {
                                    this.$message({
                                        type: 'success',
                                        message: '调出成功!'
                                    })
                                    this.selectList = []
                                    // 刷新
                                    this.queryPrivilegeList()
                                } else {
                                    this.$message.error(msg)
                                }
                            })
                        }).catch(() => {
                        })
                    }
                }
                // 部门
                if (this.activeSys === '2') {
                    if (this.selectList.length == 0) {
                        this.$message.error('请选择需要调出的部门!')
                    } else {
                        this.$confirm('此操作将调出所选部门, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            reCallDept(_this.selectList).then(res => {
                                const { success, msg } = res.data
                                if (success) {
                                    this.$message({
                                        type: 'success',
                                        message: '调出成功!'
                                    })
                                    this.selectList = []
                                    // 刷新
                                    this.queryDeptList()
                                } else {
                                    this.$message.error(msg)
                                }
                            })
                        }).catch(() => {
                        })
                    }
                }
                // 行业
                if (this.activeSys === '3') {
                    if (this.selectList.length == 0) {
                        this.$message.error('请选择需要调出的行业!')
                    } else {
                        this.$confirm('此操作将调出所选行业, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            reCallIndustry(_this.selectList).then(res => {
                                const { success, msg } = res.data
                                if (success) {
                                    this.$message({
                                        type: 'success',
                                        message: '调出成功!'
                                    })
                                    this.selectList = []
                                    // 刷新
                                    this.queryIndustryList()
                                } else {
                                    this.$message.error(msg)
                                }
                            })
                        }).catch(() => {
                        })
                    }
                }
            },
            handleSelectionChange(val) {
                this.selectList = val
            },
            updateAppId(value) {
                this.appId = value.id
                // 权限配置
                if (this.activeSys == '1') {
                    this.queryPrivilegeList()
                }
                // 行业配置
                if (this.activeSys == '3') {
                    this.queryIndustryList()
                }
            },
            // 关闭调入人员窗
            closeUser() {
                this.showSelectUser = false
                this.userVisible = false
            },
            // 关闭调入权限窗
            closePrivilege() {
                this.showSelectPrivilege = false
                this.privilegeVisible = false
            },
            // 关闭调入权限窗
            closeIndustry() {
                this.showSelectIndustry = false
                this.industryVisible = false
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeFixRoles', { arr: null, flag: false })
            },
            // 确认关闭
            beforeClose() {
                this.$confirm('确认放弃本次操作？')
                    .then(_ => {
                        // done();  不能使用done 否则会直接操作模态框
                        this.$nextTick(() => {
                            this.$emit('closeFixRoles', { arr: null, flag: false })
                        })
                    })
                    .catch(_ => {
                        return false
                    })
            },
            // tabs切换校验
            handleClick(tab, event) {
                const _this = this
                this.total = 0 // table数据总条数
                this.pageIndex = 1 // 当前页码
                this.pageSize = 15 // 每页数量
                this.activeIndex = this.sysTemList.findIndex(x => {
                    return x.appId == this.activeSys
                })
                // 角色
                if (this.activeSys == '0') {
                    this.nextTickWrap()
                    this.columns = [
                        {
                            prop: 'roleName',
                            label: '名称',
                            width: 110
                        },
                        {
                            prop: 'roleCode',
                            label: '编号',
                            width: 100
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
                        },
                        // {
                        //     prop: 'orderNum',
                        //     label: '排序',
                        //     width: 100,
                        // },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 100
                        }
                    ]
                    this.queryRoleList()
                }
                // 权限
                if (this.activeSys == '1') {
                    this.nextAppTickWrap()
                    this.columns = [
                        {
                            prop: 'name',
                            label: '名称',
                            width: 110
                        },
                        {
                            prop: 'code',
                            label: '编码',
                            width: 100
                        }, {
                            prop: 'appName',
                            label: '所属程序',
                            width: 100
                        },
                        // {
                        //     prop: 'orderNum',
                        //     label: '排序',
                        //     width: 100,
                        // },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200
                        }
                    ]
                    this.queryPrivilegeList()
                }
                // 部门
                if (this.activeSys == '2') {
                    this.nextTickWrap()
                    this.columns = [
                        {
                            prop: 'deptName',
                            label: '部门名称',
                            width: 200
                        },
                        {
                            prop: 'deptCode',
                            label: '部门编码',
                            width: 100
                        }, {
                            prop: 'deptType',
                            label: '部门类型',
                            width: 100,
                            formatter: function(row, column) {
                                let text = ''
                                const res = _this.deptTypeEnum.find(({ value }) => {
                                    return value === row.deptType
                                }) || {}
                                text = res.label
                                return text || ''
                            }
                        },
                        // {
                        //     prop: 'mapName',
                        //     label: '所属区域',
                        //     width: 100,
                        // },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200
                        }
                    ]
                    this.queryDeptList()
                }
                // 行业
                if (this.activeSys == '3') {
                    this.nextAppTickWrap()
                    this.columns = [
                        {
                            prop: 'industryName',
                            label: '名称',
                            width: 110
                        },
                        {
                            prop: 'industryCode',
                            label: '编码',
                            width: 100
                        },
                        {
                            prop: 'sort',
                            label: '排序',
                            width: 100
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200
                        }
                    ]
                    this.queryIndustryList()
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
                const treeData = await this.$refs.appTree[0].getTree()
                // this.treeData = treeData;
                if (typeof this.appId !== 'undefined') {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.appTree &&
                        this.$refs.appTree.setCurrentKey &&
                        this.$refs.appTree.setCurrentKey(this.appId)
                }
            },
            async forceUpdateTree() {
                const treeData = await this.$refs.tree[0].getTree()
                this.treeData = treeData
                if (typeof this.deptId !== 'undefined') {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.tree &&
                        this.$refs.tree.setCurrentKey &&
                        this.$refs.tree.setCurrentKey(this.deptId)
                }
            },
            // 获取已经调入人员的权限
            queryRoleList() {
                const _this = this
                const {
                    pageSize,
                    pageIndex,
                    options,
                    searchParam,
                    deptId
                } = this
                options.loading = true
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    deptId, // 部门节点
                    ...searchParam
                }
                getUserCallInRoleList(params).then(res => {
                    let data = null
                    if (res.data.success) {
                        data = res.data.data.records
                    } else {
                        return this.$message.error('获取角色信息失败！')
                    }
                    _this.options.loading = false // 更改加载中的 loading值
                    _this.list = data || []
                    _this.total = res.data.data.total// data.records;
                })
            },
            // 搜索
            filterHandler() {
                this.pageIndex = 1
                // 角色搜索
                if (this.activeSys === '0') {
                    this.queryRoleList()
                }

                // 权限搜索
                if (this.activeSys === '1') {
                    this.queryPrivilegeList()
                }
                // 部门搜索
                if (this.activeSys === '2') {
                    this.queryDeptList()
                }

                // 行业搜索
                if (this.activeSys === '3') {
                    this.queryIndustryList()
                }
            },
            // 获取已经调入角色的权限
            queryPrivilegeList() {
                const _this = this
                const {
                    pageSize,
                    pageIndex,
                    options,
                    searchParam,
                    appId,
                    objId
                } = this
                options.loading = true
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    appId, // 部门节点
                    ...searchParam
                }
                getUserCallInPrivilegeList(params).then(res => {
                    let data = null
                    if (res.data.success) {
                        data = res.data.data.records
                    } else {
                        return this.$message.error('获取权限信息失败！')
                    }
                    _this.options.loading = false // 更改加载中的 loading值
                    _this.list = data || []
                    _this.total = res.data.data.total// data.records;
                })
            },
            // 获取已经调入行业
            queryIndustryList() {
                const _this = this
                const {
                    pageSize,
                    pageIndex,
                    options,
                    searchParam,
                    appId
                } = this
                options.loading = true
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    appId, // 部门节点
                    ...searchParam
                }
                getIndustryList(params).then(res => {
                    let data = null
                    if (res.data.success) {
                        data = res.data.data.records
                    } else {
                        return this.$message.error('获取行业信息失败！')
                    }
                    _this.options.loading = false // 更改加载中的 loading值
                    _this.list = data || []
                    _this.total = res.data.data.total// data.records;
                })
            },
            // 提交角色配置
            submitFixRole() {
                this.$emit('closeFixRoles', { arr: null, flag: false })
            }
        }
    }
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
