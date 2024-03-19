<template>
    <div class="dialog-container">
        <el-dialog
            v-if="visible"
            :before-close="simpleClose"
            :title="dialogTitle+'部门'"
            :visible.sync="visible"
            width="900px"
            :close-on-click-modal="false"
        >
            <el-form ref="deptForm" :model="deptForm" :rules="rules" label-width="140px" size="mini" style="height: 520px">
                <el-tabs v-model="activeName">
                    <el-tab-pane label="基本信息" name="first">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="名称" prop="deptName">
                                    <el-input v-model="deptForm.deptName" @blur="getDeptCode(deptForm.deptName)" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="编码" prop="deptCode">
                                    <el-input v-model="deptForm.deptCode" :readonly="true" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="编号(上下级依据)" prop="devCode">
                                    <el-input v-model="deptForm.devCode" :readonly="true" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="区域" prop="mapId">
                                    <el-cascader
                                        v-model="deptForm.mapId"
                                        :options="mapTree"
                                        :props="{checkStrictly: true,emitPath:false}"
                                        clearable
                                        filterable
                                        style="width: 100%"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="上级节点" prop="deptPid">
                                    <el-cascader
                                        v-model="deptForm.deptPid"
                                        :options="deptTree"
                                        :props="{checkStrictly: true,emitPath:false}"
                                        clearable
                                        filterable
                                        style="width: 100%"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="排序" prop="orderNum">
                                    <el-input-number v-model="deptForm.orderNum" style="width: 100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="成本中心" prop="costCenterId">
                                    <el-select
                                        v-model="deptForm.costCenterId"
                                        placeholder="请选择成本中心"
                                        clearable
                                        size="mini"
                                        style="width: 100%"
                                    >
                                        <el-option
                                            v-for="item in costCenterList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="是否启用数据过滤" prop="enableDataFilter">
                                    <el-switch v-model="deptForm.enableDataFilter" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="微信企业号对应ID" prop="wxDeptId">
                                    <el-input v-model="deptForm.wxDeptId" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="部门状态" prop="deptStatus">
                                    <el-radio-group v-model="deptForm.deptStatus" size="mini">
                                        <el-radio-button label="10101">
                                            正常
                                        </el-radio-button>
                                        <el-radio-button label="10102">
                                            暂停
                                        </el-radio-button>
                                        <el-radio-button label="10103">
                                            删除
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="类型" prop="deptType">
                                    <el-radio-group v-model="deptForm.deptType" size="mini">
                                        <el-radio-button v-for="item in deptTypeEnum" :key="item.value" :label="item.value">
                                            {{ item.label }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="联系人" prop="deptContracts">
                                    <el-input v-model="deptForm.deptContracts" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="联系人电话" prop="deptContractsNum">
                                    <el-input v-model="deptForm.deptContractsNum" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="描述" prop="remark">
                                    <el-input v-model="deptForm.remark" type="textarea" :rows="2" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>

                    <el-tab-pane v-if="deptId" label="人员信息" name="second">
                        <!-- 列表 -->
                        <div v-loading="loading" style="margin-bottom: 2px;">
                            <!-- 搜索 -->
                            <el-button type="primary" icon="el-icon-circle-plus-outline" size="mini" @click="callinUser">
                                调入人员
                            </el-button>
                            <!-- 搜索 -->
                            <el-button type="danger" icon="el-icon-remove-outline" size="mini" @click="calloutUser">
                                调出人员
                            </el-button>
                            <el-table
                                ref="userTable"
                                :data="deptUserList"
                                fit
                                border
                                style="margin: 10px 0"
                            >
                                <el-table-column align="center" type="selection" width="100" prop="multiSelect" />
                                <el-table-column align="center" label="用户名称" prop="userName" />
                            </el-table>

                            <Pagination
                                :total="pagination.total"
                                :page.sync="searchParam.pageIndex"
                                :limit.sync="searchParam.pageSize"
                                @pagination="getDeptUserList"
                            />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

            <span slot="footer">
                <el-button size="mini" @click="simpleClose">取 消</el-button>
                <el-button size="mini" type="primary" @click="submitForm">提 交</el-button>
            </span>

            <CallinUser
                v-if="callinUserVisible"
                :callin-user-visible="callinUserVisible"
                :target-dept-id="deptId"
                @closeCallinUser="closeCallinUser"
            />
        </el-dialog>
    </div>
</template>

<script>
    import { getMapTree } from '@/api/map/index'
    import { getDeptTree, saveOrEditDept, getDeptById, getInDeptUsers, calloutUser } from '@/api/dept/index'
    import Pagination from '@/components/Pagination'
    import CallinUser from '../callinUserDialog'
    import { getCode, getCostCenter } from '@/api/resource'
    import { deptTypeEnum } from '@/utils/enum'

    export default {
        name: 'DeptItem',
        components: {
            Pagination,
            CallinUser
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            dialogTitle: {
                type: String
            },
            deptId: {
                type: String
            }
        },
        data() {
            return {
                loading: false,
                activeName: 'first',
                deptTypeEnum,
                mapTree: [],
                deptTree: [],
                deptForm: {
                    deptId: '',
                    deptName: null,
                    deptCode: null,
                    devCode: null,
                    mapId: null,
                    deptPid: null,
                    deptType: 15003,
                    sortNum: null,
                    remark: null,
                    wxDeptId: null,
                    orderNum: 0,
                    deptStatus: 10101,
                    costCenterId: null,
                    deptContracts: null,
                    deptContractsNum: null,
                    enableDataFilter: false
                },
                pagination: {
                    total: 0,
                    pageIndex: 1
                },
                searchParam: {
                    userId: null,
                    deptId: null,
                    pageSize: 10,
                    pageIndex: 1,
                    sortField: '',
                    sortDirection: ''
                },
                rules: {
                    deptName: [
                        { required: true, message: '请输入部门名称', trigger: 'blur' },
                        { max: 50, message: '长度超限' }
                    ],
                    deptCode: [{ required: true, message: '请输入部门编号', trigger: 'blur' }],
                    mapId: [{ required: true, message: '请选择区域', trigger: 'blur' }],
                    deptPid: [{ required: true, message: '请选择上级节点', trigger: 'blur' }],
                    costCenterId: [{ message: '请选择成本中心', trigger: 'blur' }]
                },
                isFlush: false,
                deptUserList: [],
                costCenterList: [],
                callinUserVisible: false
            }
        },
        watch: {
            activeName: {
                immediate: true,
                handler(val) {
                    if (val === 'second') {
                        this.getDeptUserList()
                    }
                }
            },
            'searchParam.pageSize'() {
                this.getDeptUserList()
            },
            'searchParam.pageIndex'() {
                this.getDeptUserList()
            }
        },
        mounted() {
            if (this.deptId) {
                this.getDeptInfo(this.deptId)
                this.searchParam.deptId = this.deptId
            }
            getCostCenter().then(res => {
                this.costCenterList = res.data.data.map(v => {
                    return {
                        value: v.guidId,
                        label: v.name
                    }
                })
            })
            this.getMapTree()
            this.getDeptTree()
        },
        methods: {
            getDeptInfo(val) {
                getDeptById({ deptId: val }).then(res => {
                    if (res && res.data.success) {
                        Object.assign(this.deptForm, res.data.data)
                    }
                })
            },
            // 关闭弹窗
            simpleClose() {
                this.$emit('closeDialog', this.isFlush)
            },
            // 获取区域数据
            getMapTree() {
                getMapTree().then(res => {
                    if (res && res.data.success) {
                        this.mapTree = res.data.data
                    }
                })
            },
            // 获取部门数据
            getDeptTree() {
                getDeptTree().then(res => {
                    if (res && res.data.success) {
                        this.deptTree = res.data.data
                    }
                })
            },
            // 提交菜单
            submitForm() {
                this.$refs['deptForm'].validate((valid) => {
                    if (valid) {
                        saveOrEditDept(this.deptForm).then(res => {
                            if (res.data.success) {
                                this.$message({
                                    showClose: true,
                                    message: '提交成功',
                                    type: 'success'
                                })
                                this.isFlush = true
                                this.simpleClose(true)
                            } else {
                                this.$message({
                                    showClose: true,
                                    message: '错误：' + res.data.msg,
                                    type: 'error'
                                })
                            }
                        })
                    } else {
                        return false
                    }
                })
            },
            // 获取部门下的用户
            getDeptUserList() {
                this.loading = true
                getInDeptUsers(this.searchParam).then(res => {
                    if (res && res.data.success) {
                        let { total, records } = res.data.data
                        this.deptUserList = records
                        this.pagination.total = total
                    }
                }).finally(() => {
                    this.loading = false
                })
            },
            // 调出用户
            calloutUser() {
                const arr = this.$refs['userTable'].selection
                if (!arr.length) {
                    this.$message({
                        showClose: true,
                        message: '请选择要调出的人员',
                        type: 'warning'
                    })
                    return
                }
                calloutUser({ users: arr, deptId: this.deptId }).then(res => {
                    if (res && res.data.success) {
                        this.$message({
                            showClose: true,
                            message: '调出成功',
                            type: 'success'
                        })
                        this.getDeptUserList()
                    } else {
                        this.$message({
                            showClose: true,
                            message: '错误：' + res.data.msg,
                            type: 'error'
                        })
                    }
                })
            },
            // 调入用户
            callinUser() {
                this.callinUserVisible = true
            },
            closeCallinUser(isFlush) {
                if (isFlush) {
                    this.getDeptUserList()
                }
                this.callinUserVisible = false
            },
            // 获取部门编码
            getDeptCode(val) {
                if (!this.deptId) {
                    getCode({ name: val }).then(res => {
                        if (res.data.success) {
                            this.deptForm.deptCode = res.data.data
                        }
                    })
                }
            }
        }
    }
</script>

<style lang='scss'>
</style>
