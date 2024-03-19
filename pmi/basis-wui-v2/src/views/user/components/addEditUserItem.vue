<template>
    <div class="dialog-container">
        <el-dialog
            :before-close="simpleClose"
            :title="dialogTitle+'用户'"
            :close-on-click-modal="false"
            :visible.sync="visible"
            width="900px"
        >
            <el-form ref="userForm" :model="userForm" :rules="rules" label-width="100px" size="mini" style="height: 500px">
                <el-tabs v-model="activeName">
                    <el-tab-pane label="基本信息" name="first">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="用户名称" prop="userName">
                                    <el-input v-model="userForm.userName" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="登陆名" prop="loginName">
                                    <el-input v-model="userForm.loginName" />
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="登陆密码" prop="loginPassword">
                                    <el-input v-model="userForm.loginPassword" show-password />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="确认密码" prop="loginPassword2">
                                    <el-input v-model="userForm.loginPassword2" show-password />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="管理员" prop="userIsAdmin">
                                    <el-switch v-model="userForm.userIsAdmin" :active-value="1" :inactive-value="0" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="案件短信提醒" prop="isReceiveEventNotice">
                                    <el-switch v-model="userForm.isReceiveEventNotice" :active-value="1" :inactive-value="0" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="微信ID" prop="wxUserId">
                                    <el-input v-model="userForm.wxUserId" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="部门" prop="deptId">
                                    <el-cascader
                                        v-model="userForm.deptId"
                                        :options="deptTree"
                                        :props="{checkStrictly: true,emitPath:false}"
                                        clearable
                                        filterable
                                        style="width: 100%"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="区域" prop="mapId">
                                    <el-cascader
                                        v-model="userForm.mapId"
                                        :options="mapTree"
                                        :props="{checkStrictly: true,emitPath:false}"
                                        clearable
                                        filterable
                                        style="width: 100%"
                                        @change="selectMap"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="用户类型" prop="userType">
                                    <el-radio-group v-model="userForm.userType" size="mini" style="vertical-align: top;">
                                        <el-radio-button label="11001">
                                            用户
                                        </el-radio-button>
                                        <el-radio-button label="11002">
                                            采集员
                                        </el-radio-button>
                                        <el-radio-button label="11003">
                                            班组长
                                        </el-radio-button>
                                        <el-radio-button label="11004">
                                            司机
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="注册信息审核" prop="wxAudit">
                                    <el-select v-model="userForm.wxAudit" size="mini" placeholder="请选择">
                                        <el-option :label="'等待验证'" :value="0" />
                                        <el-option :label="'验证通过_待确认部门'" :value="1" />
                                        <el-option :label="'等待审核通过'" :value="2" />
                                        <el-option :label="'正常'" :value="3" />
                                        <el-option :label="'禁用'" :value="4" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="是否启用" prop="enable">
                                    <el-switch v-model="userForm.enable" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>

                    <el-tab-pane label="扩展信息" name="second">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="身份证号码" prop="userIdcard">
                                    <el-input v-model="userForm.userIdcard" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="手机号码" prop="userMobile">
                                    <el-input v-model="userForm.userMobile" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="邮箱" prop="userEmail">
                                    <el-input v-model="userForm.userEmail" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="电话号码" prop="userTelephone">
                                    <el-input v-model="userForm.userTelephone" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="出生日期" prop="userBirthday">
                                    <el-date-picker
                                        v-model="userForm.userBirthday"
                                        type="date"
                                        value-format="yyyy-MM-dd"
                                        placeholder="选择日期"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="性别" prop="userSex">
                                    <el-radio-group v-model="userForm.userSex">
                                        <el-radio :label="1">
                                            男
                                        </el-radio>
                                        <el-radio :label="0">
                                            女
                                        </el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col>
                                <el-form-item label="备注" prop="remark">
                                    <el-input v-model="userForm.remark" type="textarea" :rows="2" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

            <span slot="footer">
                <el-button size="mini" @click="simpleClose">取 消</el-button>
                <el-button size="mini" type="primary" @click="submitForm">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import { saveUser, getUserById } from '@/api/user/index'
    import { getMapTree } from '@/api/map/index'
    import { getDeptTree } from '@/api/dept/index'

    export default {
        name: 'EditUserItem',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            dialogTitle: {
                type: String
            },
            userId: {
                type: String
            },
            deptId: {
                type: String
            }
        },
        data() {
            const validatePass2 = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'))
                } else if (value !== this.userForm.loginPassword) {
                    callback(new Error('两次输入密码不一致'))
                } else {
                    callback()
                }
            }
            return {
                activeName: 'first',
                mapTree: [],
                deptTree: [],
                userForm: {
                    enable: false,
                    userName: null,
                    loginName: null,
                    loginPassword: null,
                    loginPassword2: null,
                    userType: 11001,
                    userRole: null,
                    deptId: '',
                    wxAudit: 0,
                    isReceiveEventNotice: 0,
                    userSex: 1,
                    userIsAdmin: 0,
                    userIdcard: null,
                    userMobile: null,
                    userTelephone: null,
                    userEmail: null,
                    userBirthday: null,
                    remark: '',
                    wxUserId: '',
                    mapId: ''
                },
                rules: {
                    userName: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { max: 20, message: '长度超限' }
                    ],
                    loginName: [{ required: true, message: '请输入登陆名', trigger: 'blur' }],
                    loginPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }],
                    loginPassword2: [{ validator: validatePass2, required: true, trigger: 'blur' }],
                    deptId: [{ required: true, message: '请选择部门', trigger: 'blur' }],
                    mapId: [{ required: true, message: '请选择部门', trigger: 'blur' }]
                },
                isFlush: false
            }
        },
        mounted() {
            if (this.deptId) {
                this.userForm.deptId = this.deptId
            }
            if (this.userId) {
                this.getUserInfo()
            }
            this.getMapTree()
            this.getDeptTree()
        },
        methods: {
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
            // 获取用户信息
            getUserInfo() {
                getUserById({ userId: this.userId }).then(res => {
                    if (res && res.data.success) {
                        this.userForm = {
                            ...this.userForm,
                            ...res.data.data
                        }
                        this.userForm.loginPassword2 = this.userForm.loginPassword
                    } else {
                        this.$message({
                            showClose: true,
                            message: '错误：' + res.data.msg,
                            type: 'error'
                        })
                    }
                })
            },
            // 选择区域之后触发
            selectMap(val) {
                console.info(val)
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
                this.$refs['userForm'].validate((valid) => {
                    if (valid) {
                        saveUser(this.userForm).then(res => {
                            if (res.data.success) {
                                this.$message({
                                    showClose: true,
                                    message: '提交成功',
                                    type: 'success'
                                })
                                this.isFlush = true
                                this.simpleClose()
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
            }
        }
    }
</script>

<style lang='scss'>
</style>
